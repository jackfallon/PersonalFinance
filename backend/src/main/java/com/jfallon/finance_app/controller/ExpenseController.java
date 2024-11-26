package com.jfallon.finance_app.controller;

import com.jfallon.finance_app.model.Expense;
import com.jfallon.finance_app.service.ExpenseService;
import com.jfallon.finance_app.service.UserService;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense, Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        expense.setUser(user);
        Expense savedExpense = expenseService.saveExpense(expense);
        return ResponseEntity.ok(savedExpense);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getUserExpenses(Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        List<Expense> expenses = expenseService.getExpensesByUser(user);
        return ResponseEntity.ok(expenses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense, Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        expense.setId(id);
        expense.setUser(user);
        //Expense updatedExpense = expenseService.saveExpense(expense);
        Expense updatedExpense = expenseService.updateExpense(id, expense);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        Expense expense = expenseService.getExpenseById(id);
        if (!expense.getUser().getId().equals(user.getId())){
            return ResponseEntity.badRequest().body("Not authorized to delete this expense");
        }
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }
}
