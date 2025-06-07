package com.capstone.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WithdrawalCreateRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "50000", message = "Minimum withdrawal amount is 50,000 VND")
    private BigDecimal amount;
    
    @NotBlank(message = "Bank name is required")
    private String bankName;
    
    @NotBlank(message = "Account number is required")
    private String accountNumber;
    
    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;
    
    private String note;

    // Constructors
    public WithdrawalCreateRequest() {}

    public WithdrawalCreateRequest(BigDecimal amount, String bankName, String accountNumber, String accountHolderName, String note) {
        this.amount = amount;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.note = note;
    }

    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
