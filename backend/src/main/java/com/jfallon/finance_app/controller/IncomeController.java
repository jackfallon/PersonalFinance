package com.jfallon.finance_app.controller;

import com.jfallon.finance_app.model.Income;
import com.jfallon.finance_app.service.IncomeService;
import com.jfallon.finance_app.service.UserService;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Income> createIncome(@RequestBody Income income, Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        income.setUser(user);
        Income savedIncome = incomeService.saveIncome(income);
        return ResponseEntity.ok(savedIncome);
    }

    @GetMapping
    public ResponseEntity<List<Income>> getUserIncomes(Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        List<Income> incomes = incomeService.getIncomesByUser(user);
        return ResponseEntity.ok(incomes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Income> updateIncome(@PathVariable Long id, @RequestBody Income income, Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        Income existingIncome = incomeService.getIncomeById(id);

        if (!existingIncome.getUser().getId().equals(user.getId())){
            return ResponseEntity.badRequest().body(null);
        }
        income.setId(id);
        income.setUser(user);
        Income updatedIncome = incomeService.saveIncome(income);
        return ResponseEntity.ok(updatedIncome);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id, Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        Income income = incomeService.getIncomeById(id);

        if (!income.getUser().getId().equals(user.getId())){
            return ResponseEntity.badRequest().body("Not authorized to delete this income");
        }
        incomeService.deleteIncome(id);
        return ResponseEntity.ok().build();
    }

}
