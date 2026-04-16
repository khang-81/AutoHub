package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.dtos.user.request.ForgotPasswordRequest;
import com.tobeto.rentACar.services.dtos.user.request.LoginUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.RegisterUserRequest;
import com.tobeto.rentACar.services.dtos.user.request.ResetPasswordRequest;

public interface AuthCService {

    Result register(RegisterUserRequest request);
    Result login(LoginUserRequest request);

    Result forgotPassword(ForgotPasswordRequest request);

    Result resetPassword(ResetPasswordRequest request);

}
