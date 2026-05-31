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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthCManager implements AuthCService {

    private static final String FORGOT_PASSWORD_SUCCESS =
            "Nếu email đã đăng ký, bạn sẽ nhận mã OTP 6 số qua email.";

    private static final int OTP_EXPIRE_MINUTES = 5;
    /** Cooldown giữa 2 lần "Gửi lại mã" theo đặc tả UC Quên mật khẩu. */
    private static final int OTP_RESEND_COOLDOWN_SECONDS = 60;
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

        // Chặn tài khoản bị khóa SỚM trước khi authenticate (UC Đăng nhập — điều kiện tiên quyết).
        var preCheck = userRepository.findByEmail(email);
        if (preCheck.isPresent() && !preCheck.get().isEnabled()) {
            return new ErrorResult("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            if (!authentication.isAuthenticated()) {
                return new ErrorResult(messageService.getMessage(Messages.User.userCredentialsIncorrectMessage));
            }

            if (!(authentication.getPrincipal() instanceof User authenticatedUser)) {
                return new ErrorResult(messageService.getMessage(Messages.User.userCredentialsIncorrectMessage));
            }

            GetUserByNameResponse userResponse = userService.getByName(email);

            if (userResponse != null) {
                String token = jwtService.generateToken(email, userResponse, userResponse.getTokenVersion());
                LoginResponse loginResponse = new LoginResponse();
                loginResponse.setToken(token);
                List<String> roleNames = authenticatedUser.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .filter(a -> a != null && !a.isBlank())
                        .toList();
                loginResponse.setRoles(roleNames);

                boolean isAdmin = roleNames.stream()
                        .anyMatch(r -> r != null && r.equalsIgnoreCase("admin"));
                String portal = loginUserRequest.getPortal() != null
                        ? loginUserRequest.getPortal().trim().toUpperCase()
                        : "USER";
                if (!portal.equals("USER") && !portal.equals("ADMIN")) {
                    return new ErrorResult("Portal đăng nhập không hợp lệ.");
                }
                if ("USER".equals(portal) && isAdmin) {
                    return new ErrorResult(
                            "Tài khoản quản trị không thể đăng nhập tại đây. Vui lòng dùng trang /admin/login.");
                }
                if ("ADMIN".equals(portal) && !isAdmin) {
                    return new ErrorResult("Tài khoản này không có quyền truy cập trang quản trị.");
                }

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
            // Trả message trung tính để không lộ user-enumeration.
            return new SuccessResult(FORGOT_PASSWORD_SUCCESS);
        }
        User user = userOpt.get();

        // Cooldown chống spam "Gửi lại mã" (đặc tả UC Quên mật khẩu).
        Instant lastSent = user.getPasswordResetLastSentAt();
        if (lastSent != null) {
            long secondsSince = ChronoUnit.SECONDS.between(lastSent, Instant.now());
            if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
                long wait = OTP_RESEND_COOLDOWN_SECONDS - secondsSince;
                throw new BusinessException("Vui lòng đợi " + wait + " giây trước khi gửi lại mã OTP.");
            }
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        user.setPasswordResetToken(otp);
        user.setPasswordResetExpires(Instant.now().plus(OTP_EXPIRE_MINUTES, ChronoUnit.MINUTES));
        user.setPasswordResetLastSentAt(Instant.now());
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
        user.setPasswordResetLastSentAt(null);
        // Tăng tokenVersion → mọi JWT cũ trên thiết bị khác sẽ bị reject ở JwtAuthFilter.
        user.setTokenVersion(user.getTokenVersion() + 1);
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

