package com.jfallon.finance_app.controller;

import com.jfallon.finance_app.dto.PortfolioDTO;
import com.jfallon.finance_app.service.PortfolioService;
import com.jfallon.finance_app.service.UserService;
import com.jfallon.finance_app.userauth.model.User;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<PortfolioDTO> getPortfolio(Authentication auth){
        User user = userService.getCurrentUser(auth.getName());
        PortfolioDTO portfolio = portfolioService.getPortfolioWithPrices(user);
        return ResponseEntity.ok(portfolio);
    }

    @PostMapping
    public ResponseEntity<?> addStock(@RequestBody StockRequest request, Authentication auth){
        try {
            User user = userService.getCurrentUser(auth.getName());
            portfolioService.addStock(user, request.getSymbol(), request.getShares());
            return ResponseEntity.ok().build();
        }
        catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{symbol}")
    public ResponseEntity<?> updateShares(
            @PathVariable String symbol,
            @RequestBody StockRequest request,
            Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth.getName());
            portfolioService.updateShares(user, symbol, request.getShares());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<?> deleteStock(
            @PathVariable String symbol,
            Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth.getName());
            portfolioService.deleteStock(user, symbol);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    static
    class StockRequest {
        private String symbol;
        private BigDecimal shares;
    }
}
