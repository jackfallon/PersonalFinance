package com.jfallon.finance_app.repository;

import com.jfallon.finance_app.model.Portfolio;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Portfolio findByUser(User user);
}
