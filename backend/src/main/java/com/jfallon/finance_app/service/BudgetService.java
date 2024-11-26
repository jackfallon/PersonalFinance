package com.jfallon.finance_app.service;

import com.jfallon.finance_app.model.Budget;
import com.jfallon.finance_app.model.Expense;
import com.jfallon.finance_app.repository.BudgetRepository;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseService expenseService;

    public Budget saveBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public List<Budget> getBudgetsByUser(User user) {
        return budgetRepository.findByUser(user);
    }

    public List<Budget> getBudgetsByUserAndMonth(User user, YearMonth month) {
        return budgetRepository.findByUserAndBudgetMonth(user, month);
    }

    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    public Map<String, Object> getBudgetSummary(User user, YearMonth month) {
        List<Budget> budgets = getBudgetsByUserAndMonth(user, month);
        List<Expense> expenses = expenseService.getExpensesByUser(user);

        Map<String, Object> summary = new HashMap<>();
        Map<String, BigDecimal> budgetByCategory = new HashMap<>();
        Map<String, BigDecimal> spentByCategory = new HashMap<>();

        // Initialize budget amounts
        for (Budget budget : budgets) {
            budgetByCategory.put(budget.getCategory(), budget.getAmount());
            spentByCategory.put(budget.getCategory(), BigDecimal.ZERO);
        }

        // Calculate spent amounts
        for (Expense expense : expenses) {
            String category = expense.getCategory();
            if (spentByCategory.containsKey(category)) {
                BigDecimal currentAmount = spentByCategory.get(category);
                spentByCategory.put(category, currentAmount.add(expense.getAmount()));
            }
        }

        summary.put("budgets", budgetByCategory);
        summary.put("spent", spentByCategory);

        return summary;
    }
}
