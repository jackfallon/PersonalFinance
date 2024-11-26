package com.jfallon.finance_app.service;

import com.jfallon.finance_app.model.Balance;
import com.jfallon.finance_app.repository.BalanceRepository;
import com.jfallon.finance_app.userauth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BalanceService {
    private final BalanceRepository balanceRepository;

    @Transactional(readOnly = true)
    public Balance getOrCreateBalance(User user) {
        return balanceRepository.findByUser(user)
                .orElseGet(() -> {
                    Balance balance = new Balance();
                    balance.setUser(user);
                    balance.setCurrentBalance(BigDecimal.ZERO);
                    balance.setLastUpdated(LocalDateTime.now());
                    return balanceRepository.save(balance);
                });
    }

    @Transactional
    public Balance saveBalance(Balance balance) {
        return balanceRepository.save(balance);
    }

    @Transactional
    public Balance updateBalance(User user, BigDecimal amount, String transactionType) {
        for (int i = 0; i < 3; i++) {  // Retry up to 3 times
            try {
                Balance balance = getOrCreateBalance(user);

                if ("EXPENSE".equals(transactionType)) {
                    amount = amount.negate();
                }

                balance.setCurrentBalance(balance.getCurrentBalance().add(amount));
                balance.setLastUpdated(LocalDateTime.now());
                return balanceRepository.save(balance);
            } catch (ObjectOptimisticLockingFailureException e) {
                // Log the exception and retry
                System.out.println("Optimistic locking failure, retrying... " + (i + 1));
            }
        }
        throw new RuntimeException("Failed to update balance after multiple attempts");
    }

    @Transactional
    public Balance setBalance(User user, BigDecimal newBalance) {
        Balance balance = getOrCreateBalance(user);
        balance.setCurrentBalance(newBalance);
        balance.setLastUpdated(LocalDateTime.now());
        return balanceRepository.save(balance);
    }
}
