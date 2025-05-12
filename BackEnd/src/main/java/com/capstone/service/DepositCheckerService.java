package com.capstone.service;

import com.capstone.entity.PendingDeposit;
import com.capstone.entity.User;
import com.capstone.repository.PendingDepositRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepositCheckerService {

    private final PendingDepositRepository pendingDepositRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;

    @Scheduled(fixedDelay = 3000)
    public void checkDeposits() {
        Date fiveMinutesAgo = new Date(System.currentTimeMillis() - 5 * 60 * 1000);
        List<PendingDeposit> pendingList = pendingDepositRepository.findByCompletedFalseAndCreatedAtAfter(fiveMinutesAgo);

        if (pendingList.isEmpty()) return;

        webClient.get()
                .uri("/userapi/transactions/list")
                .retrieve()
                .bodyToMono(Map.class)
                .subscribe(responseMap -> {
                    log.info("📥 SePay response: {}", responseMap);

                    List<Map<String, Object>> transactions = (List<Map<String, Object>>) responseMap.get("transactions");
                    if (transactions == null) {
                        log.warn("⚠️ Không tìm thấy 'transactions' trong phản hồi SePay");
                        return;
                    }

                    for (PendingDeposit deposit : pendingList) {
                        for (Map<String, Object> tx : transactions) {
                            String content = (String) tx.get("transaction_content");
                            Object amountObj = tx.get("amount_in");

                            if (content == null || amountObj == null) continue;

                            double money = Double.parseDouble(amountObj.toString());

                            if (content.trim().toLowerCase().contains(deposit.getTransactionContent().toLowerCase())
                                    && money >= deposit.getAmount()
                                    && !deposit.isCompleted()) {

                                User user = deposit.getUser();
                                user.setBalance(user.getBalance() + deposit.getAmount());
                                userRepository.save(user);

                                deposit.setCompleted(true);
                                pendingDepositRepository.save(deposit);


                                log.info("✅ Nạp tiền thành công cho user '{}', số tiền: {}, nội dung: {}",
                                        user.getUsername(), deposit.getAmount(), content);
                                break;
                            }
                        }
                    }
                }, error -> {
                    log.error("Lỗi gọi SePay API: {}", error.getMessage(), error);
                });
    }
}
