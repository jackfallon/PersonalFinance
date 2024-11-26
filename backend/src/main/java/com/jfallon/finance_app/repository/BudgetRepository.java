package com.jfallon.finance_app.repository;

import com.jfallon.finance_app.model.Budget;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    List<Budget> findByUserAndBudgetMonth(User user, YearMonth budgetMonth);
    List<Budget> findByUserAndCategory(User user, String category);
}
