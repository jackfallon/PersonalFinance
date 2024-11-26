package com.jfallon.finance_app.service;

import com.jfallon.finance_app.model.Expense;
import com.jfallon.finance_app.model.Income;
import com.jfallon.finance_app.model.Transaction;
import com.jfallon.finance_app.repository.TransactionRepository;
import com.jfallon.finance_app.userauth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final BalanceService balanceService;

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        Transaction savedTransaction = transactionRepository.save(transaction);
        return savedTransaction;
    }

    @Transactional
    public void updateTransactionForExpense(Expense expense) {
        Transaction existingTransaction = transactionRepository
                .findByReferenceTypeAndReferenceId("EXPENSE", expense.getId())
                .orElseThrow(() -> new RuntimeException("No transaction found for expense"));

        existingTransaction.setCategory(expense.getCategory());
        existingTransaction.setAmount(expense.getAmount());
        existingTransaction.setDescription("Expense: " + expense.getCategory());
        existingTransaction.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(existingTransaction);
    }

    private void adjustBalanceForUpdate(User user, BigDecimal oldAmount, BigDecimal newAmount) {
        // First, reverse the old amount
        balanceService.updateBalance(user, oldAmount, "INCOME"); // Reverse old expense
        // Then apply the new amount
        balanceService.updateBalance(user, newAmount, "EXPENSE"); // Add new expense
    }

    @Transactional
    public void updateTransactionForIncome(Income income) {
        // Find the existing transaction for this income
        Transaction existingTransaction = transactionRepository
                .findByReferenceTypeAndReferenceId("INCOME", income.getId())
                .orElseThrow(() -> new RuntimeException("No transaction found for income"));

        // Store the old amount for balance adjustment
        var oldAmount = existingTransaction.getAmount();

        // Update the transaction
        existingTransaction.setCategory(income.getType());
        existingTransaction.setAmount(income.getAmount());
        existingTransaction.setDescription("Income: " + income.getType());
        existingTransaction.setTransactionDate(LocalDateTime.now());

        // Adjust the balance
        adjustBalanceForUpdate(income.getUser(), oldAmount, income.getAmount());
    }

    @Transactional
    public void deleteTransactionsByReferenceTypeAndId(String referenceType, Long referenceId) {
        transactionRepository.deleteByReferenceTypeAndReferenceId(referenceType, referenceId);
    }

    public List<Transaction> getRecentTransactions(User user, int limit) {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        return transactionRepository.findByUserAndTransactionDateAfterOrderByTransactionDateDesc(
                        user,
                        oneMonthAgo
                ).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateCurrentBalance(User user) {
        List<Transaction> allTransactions = transactionRepository.findByUserOrderByTransactionDateAsc(user);

        return allTransactions.stream()
                .map(transaction -> {
                    if ("EXPENSE".equals(transaction.getType())) {
                        return transaction.getAmount().negate();
                    }
                    return transaction.getAmount();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Map<String, Object>> getSpendingTrend(User user) {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Transaction> transactions = transactionRepository
                .findByUserAndTypeAndTransactionDateAfterOrderByTransactionDateAsc(
                        user,
                        "EXPENSE",
                        sixMonthsAgo
                );

        Map<YearMonth, BigDecimal> monthlyTotals = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getTransactionDate()),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Transaction::getAmount,
                                BigDecimal::add
                        )
                ));

        return monthlyTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", entry.getKey().format(DateTimeFormatter.ofPattern("MMM yyyy")));
                    point.put("amount", entry.getValue());
                    return point;
                })
                .collect(Collectors.toList());
    }
}
