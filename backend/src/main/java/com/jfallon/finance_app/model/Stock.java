package com.jfallon.finance_app.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class Stock {
    private String symbol;
    private BigDecimal currentPrice;
    private BigDecimal dailyChange;
    private BigDecimal dailyChangePercent;
    private BigDecimal previousClose;
    private Long volume;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private LocalDate latestTradingDay;
}