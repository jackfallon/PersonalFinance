package com.jfallon.finance_app.controller;

import com.jfallon.finance_app.model.Transaction;
import com.jfallon.finance_app.service.TransactionService;
import com.jfallon.finance_app.service.UserService;
import com.jfallon.finance_app.userauth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/balance")
@RequiredArgsConstructor
public class BalanceController {
    private final UserService userService;
    private final TransactionService transactionService;

    @GetMapping("")
    public ResponseEntity<?> getBalance(Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth.getName());
            BigDecimal currentBalance = transactionService.calculateCurrentBalance(user);
            LocalDateTime lastUpdated = LocalDateTime.now();

            Map<String, Object> response = new HashMap<>();
            response.put("currentBalance", currentBalance);
            response.put("lastUpdated", lastUpdated);
            response.put("total", currentBalance);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch balance data"));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getRecentTransactions(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        List<Transaction> transactions = transactionService.getRecentTransactions(user, 10);

        List<Map<String, Object>> formattedTransactions = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("timestamp", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("amount", transaction.getAmount());
                    map.put("description", transaction.getDescription());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(formattedTransactions);
    }

    @GetMapping("/balance/history")
    public ResponseEntity<?> getBalanceHistory(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        List<Transaction> transactions = transactionService.getRecentTransactions(user, 30);

        List<Map<String, Object>> history = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", transaction.getTransactionDate().format(DateTimeFormatter.ISO_DATE_TIME));
                    map.put("amount", transaction.getAmount());
                    map.put("type", transaction.getType());
                    map.put("description", transaction.getDescription());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }
}
