package com.jfallon.finance_app.service;

import com.jfallon.finance_app.model.Income;
import com.jfallon.finance_app.model.Transaction;
import com.jfallon.finance_app.repository.IncomeRepository;
import com.jfallon.finance_app.userauth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncomeService {
    @Autowired
    private IncomeRepository incomeRepository;
    @Autowired
    private TransactionService transactionService;

    @Transactional
    public Income saveIncome(Income income) {
        Income saved = incomeRepository.save(income);

        Transaction transaction = new Transaction();
        transaction.setUser(income.getUser());
        transaction.setType("INCOME");
        transaction.setCategory(income.getType());
        transaction.setAmount(income.getAmount());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceType("INCOME");
        transaction.setReferenceId(saved.getId());
        transaction.setDescription("Income: " + income.getType());

        transactionService.createTransaction(transaction);

        return saved;
    }

    @Transactional
    public Income updateIncome(Long id, Income updatedIncome) {
        Income existingIncome = getIncomeById(id);

        // Update the fields
        existingIncome.setType(updatedIncome.getType());
        existingIncome.setAmount(updatedIncome.getAmount());
        existingIncome.setFrequency(updatedIncome.getFrequency());

        // Save the updated income
        Income saved = incomeRepository.save(existingIncome);

        // Update the corresponding transaction
        Transaction transaction = new Transaction();
        transaction.setUser(saved.getUser());
        transaction.setType("INCOME");
        transaction.setCategory(saved.getType());
        transaction.setAmount(saved.getAmount());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceType("INCOME");
        transaction.setReferenceId(saved.getId());
        transaction.setDescription("Income: " + saved.getType()); // Add description

        transactionService.updateTransactionForIncome(saved);

        return saved;
    }

    public List<Income> getAllIncomes(){
        return incomeRepository.findAll();
    }

    public Income getIncomeById(Long id){
        return incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));
    }

    public void deleteIncome(Long id){
        transactionService.deleteTransactionsByReferenceTypeAndId("INCOME", id);
        incomeRepository.deleteById(id);
    }

    public List<Income> getIncomesByUser(User user){
        return incomeRepository.findByUser(user);
    }

    public BigDecimal calculateMonthlyIncome(User user) {
        return getIncomesByUser(user).stream()
                .filter(income -> "MONTHLY".equals(income.getFrequency()))
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
