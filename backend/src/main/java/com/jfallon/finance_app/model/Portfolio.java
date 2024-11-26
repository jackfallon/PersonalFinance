package com.jfallon.finance_app.model;


import com.jfallon.finance_app.userauth.model.User;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Table(name="portfolio")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ElementCollection
    @CollectionTable(name = "portfolio_stocks", joinColumns = @JoinColumn(name = "portfolio_id"))
    @MapKeyColumn(name = "stock_name")
    @Column(name = "num_shares")
    private Map<String, BigDecimal> stocks = new HashMap<>(); //String for stock name, BigDecimal for number of shares
}
