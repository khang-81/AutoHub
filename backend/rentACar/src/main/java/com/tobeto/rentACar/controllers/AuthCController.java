package com.tobeto.rentACar.controllers;


import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.AuthCService;
import com.tobeto.rentACar.services.abstracts.UserService;
import com.tobeto.rentACar.services.dtos.user.request.ForgotPasswordRequest;
import com.tobeto.rentACar.services.dtos.user.request.LoginUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.RegisterUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.ResetPasswordRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/auth")
@AllArgsConstructor
@CrossOrigin
public class AuthCController {

    private final AuthCService authCService;

    @PostMapping("register")
    @ResponseStatus(HttpStatus.CREATED)
    public Result register(@RequestBody RegisterUserRequest registerUserRequest) {
        return authCService.register(registerUserRequest);
    }

    @PostMapping("login")
    @ResponseStatus(HttpStatus.OK)
    public Result login(@RequestBody LoginUserRequest loginUserRequest) {
        return authCService.login(loginUserRequest);
    }

    @PostMapping("forgot-password")
    @ResponseStatus(HttpStatus.OK)
    public Result forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        return authCService.forgotPassword(request);
    }

    @PostMapping("reset-password")
    @ResponseStatus(HttpStatus.OK)
    public Result resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        return authCService.resetPassword(request);
    }

}
