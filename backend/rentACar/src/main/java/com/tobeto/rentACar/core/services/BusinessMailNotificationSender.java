package com.tobeto.rentACar.core.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class BusinessMailNotificationSender {

    private final MailService mailService;

    @Value("${mail.username:}")
    private String mailUsername;

    @Async
    public void sendHtmlToUser(String toEmail, String subject, String htmlBody) {
        if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(toEmail)) {
            return;
        }
        try {
            mailService.sendHtmlTo(toEmail.trim(), subject, htmlBody);
        } catch (Exception e) {
            log.warn("Business mail notification failed: {}", e.getMessage());
        }
    }

    public static String simpleHtmlEmail(String title, String plainBody) {
        String t = HtmlUtils.htmlEscape(title != null ? title : "");
        String b = HtmlUtils.htmlEscape(plainBody != null ? plainBody : "");
        return "<!DOCTYPE html><html><body style=\"font-family:sans-serif;\">"
                + "<h2>" + t + "</h2>"
                + "<p>" + b.replace("\n", "<br/>") + "</p>"
                + "</body></html>";
    }
}
