package com.jfallon.finance_app.repository;

import com.jfallon.finance_app.model.Balance;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BalanceRepository extends JpaRepository<Balance, Long> {
    Optional<Balance> findByUser(User user);
}
