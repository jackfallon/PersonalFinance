// DashboardController.java
package com.jfallon.finance_app.controller;

import com.jfallon.finance_app.model.Transaction;
import com.jfallon.finance_app.service.*;
import com.jfallon.finance_app.userauth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final PortfolioService portfolioService;
    private final UserService userService;
    private final TransactionService transactionService;

    @GetMapping("/income")
    public ResponseEntity<?> getIncome(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());

        BigDecimal monthlyIncome = incomeService.getIncomesByUser(user).stream()
                .filter(income -> income.getFrequency().equals("MONTHLY"))
                .map(income -> income.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of("monthly", monthlyIncome));
    }

    @GetMapping("/expenses")
    public ResponseEntity<?> getExpenses(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        Map<String, Object> response = new HashMap<>();

        // Get monthly expenses total
        BigDecimal monthlyTotal = expenseService.calculateMonthlyExpenses(user);

        // Get expense breakdown by category
        List<Map<String, Object>> breakdown = expenseService.getExpenseBreakdown(user);

        // Get spending trend (last 6 months)
        List<Map<String, Object>> trend = transactionService.getSpendingTrend(user);

        response.put("monthly", monthlyTotal);
        response.put("breakdown", breakdown);
        response.put("trend", trend);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/portfolio")
    public ResponseEntity<?> getPortfolio(Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth.getName());
            Map<String, BigDecimal> portfolio = portfolioService.getPortfolioByUser(user);

            // Calculate total portfolio value
            BigDecimal total = portfolio.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // This is a placeholder that returns 0%
            BigDecimal change = BigDecimal.ZERO;

            return ResponseEntity.ok(Map.of(
                    "total", total,
                    "change", change
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Map.of(
                    "total", BigDecimal.ZERO,
                    "change", BigDecimal.ZERO
            ));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        List<Transaction> recentTransactions = transactionService.getRecentTransactions(user, 5);

        List<Map<String, Object>> formattedTransactions = recentTransactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("type", transaction.getType().toLowerCase());
                    map.put("description", transaction.getDescription());
                    map.put("amount", transaction.getAmount());
                    map.put("date", transaction.getTransactionDate().format(
                            DateTimeFormatter.ofPattern("MMM dd, yyyy")
                    ));
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("recent", formattedTransactions);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/recent")  // Changed to match frontend endpoint
    public ResponseEntity<?> getRecentTransactions(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        List<Transaction> recent = transactionService.getRecentTransactions(user, 5);

        // Transform transactions to match frontend expectations
        List<Map<String, Object>> transformedTransactions = recent.stream()
                .map(transaction -> {
                    Map<String, Object> transformed = new HashMap<>();
                    transformed.put("id", transaction.getId());
                    transformed.put("timestamp", transaction.getTransactionDate());
                    transformed.put("type", transaction.getType());  // Ensure this is either "EXPENSE" or "INCOME"
                    transformed.put("amount", transaction.getAmount());
                    //transformed.put("balanceAfter", transaction.getBalanceAfter());
                    return transformed;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(transformedTransactions);
    }
}
