package com.jfallon.finance_app.service;

import com.jfallon.finance_app.model.Stock;
import com.jfallon.finance_app.dto.AlphaVantageResponse;
import com.jfallon.finance_app.exception.StockDataException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class StockService {
    private static final Logger logger = LoggerFactory.getLogger(StockService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int BATCH_SIZE = 5; // AlphaVantage has rate limits
    private static final long API_CALL_DELAY = 1000; // 1 second delay between API calls

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final ExecutorService executorService;

    public StockService(
            @Value("${alphavantage.api.key}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey;
        this.executorService = Executors.newFixedThreadPool(BATCH_SIZE);
    }

    @Cacheable(value = "stockPrices", key = "#symbol", unless = "#result == null")
    public Stock getStockPrice(String symbol) {
        logger.debug("Fetching stock price for symbol: {}", symbol);

        if (symbol == null || symbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Stock symbol cannot be null or empty");
        }

        String url = buildApiUrl(symbol);

        try {
            ResponseEntity<AlphaVantageResponse> response = restTemplate.getForEntity(
                    url,
                    AlphaVantageResponse.class
            );

            //Check for rate limit

            return Optional.ofNullable(response.getBody())
                    .map(AlphaVantageResponse::getGlobalQuote)
                    .map(this::mapToStockPrice)
                    .orElseThrow(() -> new StockDataException("Empty response received for symbol: " + symbol));

        } catch (RestClientException e) {
            logger.error("Failed to fetch stock data for symbol: {}", symbol, e);
            throw new StockDataException("Failed to fetch stock data for symbol: " + symbol, e);
        } catch (Exception e) {
            logger.error("Unexpected error while processing stock data for symbol: {}", symbol, e);
            throw new StockDataException("Error processing stock data for symbol: " + symbol, e);
        }
    }

    public Map<String, Stock> getBatchStockPrices(Set<String> symbols) {
        logger.debug("Fetching batch stock prices for symbols: {}", symbols);

        if (symbols == null || symbols.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Stock> prices = new ConcurrentHashMap<>();
        List<List<String>> batches = createBatches(new ArrayList<>(symbols), BATCH_SIZE);

        try {
            for (List<String> batch : batches) {
                List<CompletableFuture<Void>> futures = batch.stream()
                        .map(symbol -> CompletableFuture.runAsync(() -> {
                            try {
                                Stock price = getStockPrice(symbol);
                                prices.put(symbol, price);
                                Thread.sleep(API_CALL_DELAY); // Respect API rate limits
                            } catch (Exception e) {
                                logger.error("Error fetching price for symbol: {}", symbol, e);
                                prices.put(symbol, null); // Mark failed fetches
                            }
                        }, executorService))
                        .collect(Collectors.toList());

                // Wait for each batch to complete before starting the next
                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            }
        } catch (Exception e) {
            logger.error("Error in batch processing", e);
            throw new StockDataException("Failed to fetch batch stock prices", e);
        }

        // Remove any null entries from failed fetches
        prices.values().removeIf(Objects::isNull);
        return prices;
    }

    // Clear cache every 5 minutes
    @Scheduled(fixedRate = 300000)
    @CacheEvict(value = "stockPrices", allEntries = true)
    public void clearStockPriceCache() {
        logger.debug("Clearing stock price cache");
    }

    private String buildApiUrl(String symbol) {
        return String.format(
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=%s",
                symbol.trim().toUpperCase(),
                apiKey
        );
    }

    private Stock mapToStockPrice(AlphaVantageResponse.GlobalQuote quote) {
        try {
            Stock stockPrice = new Stock();
            stockPrice.setSymbol(quote.getSymbol());
            stockPrice.setCurrentPrice(parseDecimal(quote.getPrice()));
            stockPrice.setDailyChange(parseDecimal(quote.getChange()));
            stockPrice.setDailyChangePercent(parseDecimal(quote.getChangePercent().replace("%", "")));
            stockPrice.setPreviousClose(parseDecimal(quote.getPreviousClose()));
            stockPrice.setVolume(Long.parseLong(quote.getVolume()));
            stockPrice.setOpen(parseDecimal(quote.getOpen()));
            stockPrice.setHigh(parseDecimal(quote.getHigh()));
            stockPrice.setLow(parseDecimal(quote.getLow()));
            stockPrice.setLatestTradingDay(LocalDate.parse(quote.getLatestTradingDay(), DATE_FORMATTER));

            validateStockPrice(stockPrice);
            return stockPrice;

        } catch (NumberFormatException e) {
            throw new StockDataException("Failed to parse numeric values from API response", e);
        } catch (Exception e) {
            throw new StockDataException("Failed to map API response to StockPrice", e);
        }
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new StockDataException("Received null or empty decimal value from API");
        }
        return new BigDecimal(value.trim());
    }

    private void validateStockPrice(Stock stockPrice) {
        if (stockPrice.getCurrentPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new StockDataException("Invalid current price: " + stockPrice.getCurrentPrice());
        }
        if (stockPrice.getVolume() <= 0) {
            throw new StockDataException("Invalid volume: " + stockPrice.getVolume());
        }
        if (stockPrice.getLatestTradingDay() == null) {
            throw new StockDataException("Missing latest trading day");
        }
    }

    private <T> List<List<T>> createBatches(List<T> items, int batchSize) {
        List<List<T>> batches = new ArrayList<>();
        for (int i = 0; i < items.size(); i += batchSize) {
            batches.add(items.subList(i, Math.min(items.size(), i + batchSize)));
        }
        return batches;
    }

    // Cleanup method to shut down the executor service
    public void shutdown() {
        executorService.shutdown();
    }
}