package com.jfallon.finance_app.repository;

import com.jfallon.finance_app.model.Transaction;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.transactionDate >= :date ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentTransactions(User user, LocalDateTime date);

    List<Transaction> findByUserAndTransactionDateAfter(User user, LocalDateTime date);

    Optional<Transaction> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);

    void deleteByReferenceTypeAndReferenceId(String referenceType, Long referenceId);

    List<Transaction> findByUserOrderByTransactionDateAsc(User user);

    List<Transaction> findByUserAndTransactionDateAfterOrderByTransactionDateDesc(
            User user,
            LocalDateTime date
    );

    List<Transaction> findByUserAndTypeAndTransactionDateAfterOrderByTransactionDateAsc(
            User user,
            String type,
            LocalDateTime date
    );
}
