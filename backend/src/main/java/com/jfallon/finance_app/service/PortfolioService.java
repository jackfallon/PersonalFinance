package com.jfallon.finance_app.service;

import com.jfallon.finance_app.dto.PortfolioDTO;
import com.jfallon.finance_app.model.Portfolio;
import com.jfallon.finance_app.model.Stock;
import com.jfallon.finance_app.repository.PortfolioRepository;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.RoundingMode;

@Service
public class PortfolioService {
    @Autowired
    private StockService stockService;

    @Autowired
    private PortfolioRepository portfolioRepository;

    public PortfolioDTO getPortfolioWithPrices(User user){
        Portfolio portfolio = portfolioRepository.findByUser(user);
        if (portfolio == null || portfolio.getStocks().isEmpty()){
            return new PortfolioDTO();
        }

        Map<String, Stock> stockPrices = stockService.getBatchStockPrices(portfolio.getStocks().keySet());

        PortfolioDTO dto = new PortfolioDTO();
        List<PortfolioDTO.StockPosition> positions = new ArrayList<>();
        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalDailyChange = BigDecimal.ZERO;

        for (Map.Entry<String, BigDecimal> entry : portfolio.getStocks().entrySet()){
            String symbol = entry.getKey();
            BigDecimal shares = entry.getValue();
            Stock price = stockPrices.get(symbol);

            PortfolioDTO.StockPosition position = new PortfolioDTO.StockPosition();
            position.setSymbol(symbol);
            position.setShares(shares);
            position.setCurrentPrice(price.getCurrentPrice());
            position.setTotalValue(price.getCurrentPrice().multiply(shares));
            position.setDailyChange(price.getDailyChange());
            position.setDailyChangePercent(price.getDailyChangePercent());

            positions.add(position);
            totalValue = totalValue.add(position.getTotalValue());
            totalDailyChange = totalDailyChange.add(price.getDailyChange().multiply(shares));
        }
        dto.setStocks(positions);
        dto.setTotalValue(totalValue);
        dto.setDailyChange(totalDailyChange);
        dto.setDailyChangePercent(totalDailyChange.divide(totalValue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
        return dto;
    }

    public Portfolio savePortfolio(Portfolio portfolio){
        return portfolioRepository.save(portfolio);
    }

    public List<Portfolio> getAllPortfolios(){
        return portfolioRepository.findAll();
    }

    public Portfolio getPortfolioById(Long id){
        return portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    public void deletePortfolio(Long id){
        portfolioRepository.deleteById(id);
    }

    public Map<String, BigDecimal> getPortfolioByUser(User user){
        Portfolio portfolio = portfolioRepository.findByUser(user);
        if (portfolio == null){
            return new HashMap<>();
        }
        return portfolio.getStocks();
    }

    public BigDecimal calculatePortfolioValue(Map<String, BigDecimal> portfolio) {
        // Implement stock price lookup
        return portfolio.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public void addStock(User user, String symbol, BigDecimal shares) {
        if (shares.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Number of shares must be positive");
        }

        // Verify the stock symbol exists
        Stock stockPrice = stockService.getStockPrice(symbol);
        if (stockPrice == null) {
            throw new IllegalArgumentException("Invalid stock symbol: " + symbol);
        }

        Portfolio portfolio = portfolioRepository.findByUser(user);
        if (portfolio == null) {
            portfolio = new Portfolio();
            portfolio.setUser(user);
        }
        Map<String, BigDecimal> stocks = portfolio.getStocks();
        stocks.merge(symbol.toUpperCase(), shares, BigDecimal::add);

        portfolioRepository.save(portfolio);
    }

    @Transactional
    public void updateShares(User user, String symbol, BigDecimal shares) {
        if (shares.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Number of shares must be positive");
        }

        Portfolio portfolio = portfolioRepository.findByUser(user);
        if (portfolio == null || !portfolio.getStocks().containsKey(symbol)) {
            throw new IllegalArgumentException("Stock not found in portfolio: " + symbol);
        }

        portfolio.getStocks().put(symbol.toUpperCase(), shares);
        portfolioRepository.save(portfolio);
    }

    @Transactional
    public void deleteStock(User user, String symbol) {
        Portfolio portfolio = portfolioRepository.findByUser(user);
        if (portfolio == null || !portfolio.getStocks().containsKey(symbol)) {
            throw new IllegalArgumentException("Stock not found in portfolio: " + symbol);
        }

        portfolio.getStocks().remove(symbol.toUpperCase());
        portfolioRepository.save(portfolio);
    }
}
