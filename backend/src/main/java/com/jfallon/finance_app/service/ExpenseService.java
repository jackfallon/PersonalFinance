package com.jfallon.finance_app.service;

import com.jfallon.finance_app.model.Expense;
import com.jfallon.finance_app.model.Transaction;
import com.jfallon.finance_app.repository.ExpenseRepository;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;
    @Autowired
    private TransactionService transactionService;

    @Transactional
    public Expense saveExpense(Expense expense) {
        Expense saved = expenseRepository.save(expense);

        // Create corresponding transaction
        Transaction transaction = new Transaction();
        transaction.setUser(expense.getUser());
        transaction.setType("EXPENSE");
        transaction.setCategory(expense.getCategory());
        transaction.setAmount(expense.getAmount());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceType("EXPENSE");
        transaction.setReferenceId(saved.getId());
        transaction.setDescription("Expense: " + expense.getCategory());

        transactionService.createTransaction(transaction);

        return saved;
    }

    public List<Expense> getAllExpenses(){
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(Long id){
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    @Transactional
    public Expense updateExpense(Long id, Expense updatedExpense){
        Expense existingExpense = getExpenseById(id);

        existingExpense.setCategory(updatedExpense.getCategory());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setFrequency(updatedExpense.getFrequency());

        // Save the updated expense
        Expense saved = expenseRepository.save(existingExpense);

        // Update the corresponding transaction
        transactionService.updateTransactionForExpense(saved);

        return saved;
    }

    @Transactional
    public void deleteExpense(Long id){
        transactionService.deleteTransactionsByReferenceTypeAndId("EXPENSE", id);
        expenseRepository.deleteById(id);
    }

    public List<Expense> getExpensesByUser(User user){
        return expenseRepository.findByUser(user);
    }

    public List<Expense> getExpensesByMonth(User user, YearMonth month) {
        return getExpensesByUser(user).stream()
                .filter(expense -> expense.getStartDate() != null &&
                        YearMonth.from(expense.getStartDate()).equals(month))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getExpenseBreakdown(User user) {
        Map<String, BigDecimal> categoryTotals = getExpensesByUser(user).stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add
                        )
                ));

        return categoryTotals.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> categoryData = new HashMap<>();
                    categoryData.put("category", entry.getKey());
                    categoryData.put("value", entry.getValue());
                    return categoryData;
                })
                .collect(Collectors.toList());
    }

    public BigDecimal calculateMonthlyExpenses(User user) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        return getExpensesByUser(user).stream()
                .filter(expense -> expense.getStartDate().isAfter(startOfMonth))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
