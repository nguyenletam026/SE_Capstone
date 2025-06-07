package com.capstone.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WithdrawalRequestDto {

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

    // Default constructor
    public WithdrawalRequestDto() {}

    // All args constructor
    public WithdrawalRequestDto(BigDecimal amount, String bankName, String accountNumber,
                                String accountHolderName, String note) {
        this.amount = amount;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.note = note;
    }    // Getters and setters
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

    // Builder pattern implementation
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private BigDecimal amount;
        private String bankName;
        private String accountNumber;
        private String accountHolderName;
        private String note;

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder bankName(String bankName) {
            this.bankName = bankName;
            return this;
        }

        public Builder accountNumber(String accountNumber) {
            this.accountNumber = accountNumber;
            return this;
        }

        public Builder accountHolderName(String accountHolderName) {
            this.accountHolderName = accountHolderName;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public WithdrawalRequestDto build() {
            return new WithdrawalRequestDto(amount, bankName, accountNumber, accountHolderName, note);
        }
    }
}
