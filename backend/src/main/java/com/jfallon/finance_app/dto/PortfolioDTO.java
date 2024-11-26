package com.jfallon.finance_app.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PortfolioDTO {
    private BigDecimal totalValue;
    private BigDecimal dailyChange;
    private BigDecimal dailyChangePercent;
    private List<StockPosition> stocks;

    @Data
    public static class StockPosition {
        private String symbol;
        private BigDecimal shares;
        private BigDecimal currentPrice;
        private BigDecimal totalValue;
        private BigDecimal dailyChange;
        private BigDecimal dailyChangePercent;
    }
}