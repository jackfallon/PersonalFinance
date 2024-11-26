package com.jfallon.finance_app.model;

import com.jfallon.finance_app.userauth.model.User;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.YearMonth;

@Data
@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String category;

    private BigDecimal amount;

    @Column(name = "budget_month")
    private YearMonth budgetMonth;
}