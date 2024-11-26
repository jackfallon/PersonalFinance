package com.jfallon.finance_app.model;

import com.jfallon.finance_app.userauth.model.User;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // "EXPENSE", "INCOME", "TRANSFER"

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    private String category;

    // Optional reference to related entities
    @Column(name = "reference_type")
    private String referenceType; // "EXPENSE", "INCOME", "PORTFOLIO"

    @Column(name = "reference_id")
    private Long referenceId;
}
