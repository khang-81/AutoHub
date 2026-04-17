package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.services.MailService;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.results.ErrorResult;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Role;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.services.abstracts.AuthCService;
import com.tobeto.rentACar.services.abstracts.RoleService;
import com.tobeto.rentACar.services.abstracts.UserService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.authentication.AuthCResult;
import com.tobeto.rentACar.services.dtos.authentication.LoginResponse;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.dtos.user.request.ForgotPasswordRequest;
import com.tobeto.rentACar.services.dtos.user.request.LoginUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.RegisterUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.ResetPasswordRequest;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByNameResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthCManager implements AuthCService {

    private static final String FORGOT_PASSWORD_SUCCESS =
            "Nếu email đã đăng ký, bạn sẽ nhận mã OTP 6 số qua email.";

    private static final int OTP_EXPIRE_MINUTES = 15;
    private final SecureRandom secureRandom = new SecureRandom();

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final MessageService messageService;
    private final UserRepository userRepository;
    private final MailService mailService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public Result register(RegisterUserRequest registerUserRequest) {
        // Chỉ cho đăng ký khách — không tin roles từ client (tránh tự gán admin).
        Role userRole = roleService.findByName("user");
        if (userRole == null) {
            throw new BusinessException("Chưa cấu hình role user trong hệ thống.");
        }
        String email = registerUserRequest.getEmail() != null ? registerUserRequest.getEmail().trim() : "";
        if (email.isEmpty()) {
            throw new BusinessException("Vui lòng nhập email.");
        }
        User user = User.builder()
                .email(email)
                .authorities(Set.of(userRole))
                .password(passwordEncoder.encode(registerUserRequest.getPassword()))
                .build();
        userService.add(user);

        return new SuccessResult(messageService.getMessage(Messages.User.userRegisterSuccess));
    }


    @Override
    public Result login(LoginUserRequest loginUserRequest) {
        String email = loginUserRequest.getEmail() != null ? loginUserRequest.getEmail().trim() : "";
        String password = loginUserRequest.getPassword() != null ? loginUserRequest.getPassword() : "";
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            if (!authentication.isAuthenticated()) {
                return new ErrorResult(messageService.getMessage(Messages.User.userCredentialsIncorrectMessage));
            }

            GetUserByNameResponse userResponse = userService.getByName(email);

            if (userResponse != null) {
                String token = jwtService.generateToken(email, userResponse);
                LoginResponse loginResponse = new LoginResponse();
                loginResponse.setToken(token);
                return new AuthCResult(true, messageService.getMessage(Messages.User.userLoginSuccess), loginResponse);
            }
            return new ErrorResult(messageService.getMessage(Messages.User.getUserNotFoundMessage));
        } catch (AuthenticationException e) {
            return new ErrorResult(messageService.getMessage(Messages.User.userCredentialsIncorrectMessage));
        }
    }

    @Override
    public Result forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new SuccessResult(FORGOT_PASSWORD_SUCCESS);
        }
        User user = userOpt.get();
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        user.setPasswordResetToken(otp);
        user.setPasswordResetExpires(Instant.now().plus(OTP_EXPIRE_MINUTES, ChronoUnit.MINUTES));
        userRepository.save(user);

        String base = frontendBaseUrl != null ? frontendBaseUrl.replaceAll("/+$", "") : "http://localhost:5173";
        String resetPath = base + "/reset-password?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8);
        String html = buildPasswordResetOtpEmailHtml(otp, resetPath, OTP_EXPIRE_MINUTES);

        try {
            mailService.sendHtmlTo(email, "Mã OTP đặt lại mật khẩu — AutoHub", html);
        } catch (IllegalStateException e) {
            log.error(
                    "Không gửi được OTP: chưa cấu hình SMTP. Với Docker, thêm MAIL_USERNAME và MAIL_PASSWORD (Gmail: App Password) vào file .env cùng docker-compose.yml rồi khởi động lại service api. OTP tạm (chỉ log): {} — email: {}",
                    otp, email);
        } catch (Exception e) {
            log.error("Không gửi được email OTP tới {}: {} — OTP (xem log để debug): {} — {}",
                    email, e.getMessage(), otp, resetPath, e);
        }
        return new SuccessResult(FORGOT_PASSWORD_SUCCESS);
    }

    @Override
    public Result resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String otp = request.getOtp() != null ? request.getOtp().trim() : "";
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(
                        "Email hoặc mã OTP không đúng, hoặc mã đã hết hạn."));
        if (user.getPasswordResetToken() == null
                || !user.getPasswordResetToken().equals(otp)) {
            throw new BusinessException("Email hoặc mã OTP không đúng, hoặc mã đã hết hạn.");
        }
        if (user.getPasswordResetExpires() == null
                || user.getPasswordResetExpires().isBefore(Instant.now())) {
            throw new BusinessException("Email hoặc mã OTP không đúng, hoặc mã đã hết hạn.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        userRepository.save(user);
        return new SuccessResult("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.");
    }

    private static String buildPasswordResetOtpEmailHtml(String otp, String resetPageUrl, int expireMinutes) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body style=\"font-family:sans-serif;line-height:1.5;\">"
                + "<h2 style=\"color:#1e3a5f;\">Đặt lại mật khẩu AutoHub</h2>"
                + "<p>Mã xác thực OTP của bạn là:</p>"
                + "<p style=\"font-size:28px;font-weight:bold;letter-spacing:8px;color:#0d9488;\">" + otp + "</p>"
                + "<p>Mã có hiệu lực trong <strong>" + expireMinutes + " phút</strong>.</p>"
                + "<p>Quay lại trang web và nhập email cùng mã OTP để đặt mật khẩu mới:</p>"
                + "<p><a href=\"" + resetPageUrl + "\" style=\"color:#0d9488;\">" + resetPageUrl + "</a></p>"
                + "<p style=\"color:#64748b;font-size:14px;\">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>"
                + "</body></html>";
    }
}

