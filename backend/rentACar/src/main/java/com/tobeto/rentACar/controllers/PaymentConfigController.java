package com.tobeto.rentACar.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("api/payment")
@CrossOrigin
public class PaymentConfigController {

    @Value("${payment.bank.code:TCB}")
    private String bankCode;

    @Value("${payment.bank.name:Techcombank}")
    private String bankName;

    @Value("${payment.bank.account-number:}")
    private String accountNumber;

    @Value("${payment.bank.account-name:}")
    private String accountName;

    /** Trả về thông tin chuyển khoản ngân hàng — chỉ dành cho user đã đăng nhập. */
    @GetMapping("/bank-info")
    public Map<String, String> getBankInfo() {
        String display = accountNumber.length() > 4
                ? accountNumber.replaceAll("(\\d{4})(?=\\d)", "$1 ").trim()
                : accountNumber;
        return Map.of(
                "bankCode", bankCode,
                "bankName", bankName,
                "accountNumber", accountNumber,
                "accountNumberDisplay", display,
                "accountName", accountName
        );
    }
}
