package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
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
import com.tobeto.rentACar.services.dtos.user.request.LoginUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.RegisterUserRequest;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByNameResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;


@Service
@AllArgsConstructor
public class AuthCManager implements AuthCService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final MessageService messageService;

    @Override
    public Result register(RegisterUserRequest registerUserRequest) {
        // Chỉ cho đăng ký khách — không tin roles từ client (tránh tự gán admin).
        Role userRole = roleService.findByName("user");
        if (userRole == null) {
            throw new BusinessException("Chưa cấu hình role user trong hệ thống.");
        }
        User user = User.builder()
                .email(registerUserRequest.getEmail())
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        if (authentication.isAuthenticated()) {

            GetUserByNameResponse userResponse = userService.getByName(email);

            if (userResponse != null) {
                String token = jwtService.generateToken(email, userResponse);
                LoginResponse loginResponse = new LoginResponse();
                loginResponse.setToken(token);
                return new AuthCResult(true, messageService.getMessage(Messages.User.userLoginSuccess), loginResponse);
            } else {
                return new ErrorResult(messageService.getMessage(Messages.User.getUserNotFoundMessage));
            }
        }

        return new ErrorResult(messageService.getMessage(Messages.User.userCredentialsIncorrectMessage));
    }
}

