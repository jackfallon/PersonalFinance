package com.jfallon.finance_app.controller;

import com.jfallon.finance_app.model.Budget;
import com.jfallon.finance_app.service.BudgetService;
import com.jfallon.finance_app.service.UserService;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget, Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        budget.setUser(user);
        Budget savedBudget = budgetService.saveBudget(budget);
        return ResponseEntity.ok(savedBudget);
    }

    @GetMapping
    public ResponseEntity<List<Budget>> getUserBudgets(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        List<Budget> budgets = budgetService.getBudgetsByUser(user);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/month/{yearMonth}")
    public ResponseEntity<List<Budget>> getUserBudgetsByMonth(
            @PathVariable String yearMonth,
            Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        YearMonth month = YearMonth.parse(yearMonth);
        List<Budget> budgets = budgetService.getBudgetsByUserAndMonth(user, month);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/summary/{yearMonth}")
    public ResponseEntity<Map<String, Object>> getBudgetSummary(
            @PathVariable String yearMonth,
            Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        YearMonth month = YearMonth.parse(yearMonth);
        Map<String, Object> summary = budgetService.getBudgetSummary(user, month);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @RequestBody Budget budget,
            Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        Budget existingBudget = budgetService.getBudgetById(id);

        if (!existingBudget.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(null);
        }

        budget.setId(id);
        budget.setUser(user);
        Budget updatedBudget = budgetService.saveBudget(budget);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        Budget budget = budgetService.getBudgetById(id);

        if (!budget.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Not authorized to delete this budget");
        }

        budgetService.deleteBudget(id);
        return ResponseEntity.ok().build();
    }
}