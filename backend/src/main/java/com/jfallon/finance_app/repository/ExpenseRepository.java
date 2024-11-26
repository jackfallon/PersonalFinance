package com.jfallon.finance_app.repository;

import com.jfallon.finance_app.model.Expense;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
}
