package com.tobeto.rentACar.core.exceptions;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.exceptions.types.UnauthorizedException;
import com.tobeto.rentACar.core.utilities.results.ErrorResult;
import com.tobeto.rentACar.core.utilities.results.Result;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ExceptionHandlers {
    @ExceptionHandler({BusinessException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result handleBusinessException(BusinessException exception)
    {
        return new ErrorResult(exception.getMessage());
    }

    // 404 not found
    @ExceptionHandler({NotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result handleNotFoundException(NotFoundException exception){
        return new ErrorResult(exception.getMessage());
    }

    @ExceptionHandler({UnauthorizedException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Result handleUnauthorizedException(UnauthorizedException exception) {
        return new ErrorResult(exception.getMessage());
    }

    @ExceptionHandler({AccessDeniedException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result handleAccessDeniedException(AccessDeniedException exception) {
        return new ErrorResult("Bạn không có quyền thực hiện thao tác này.");
    }

    @ExceptionHandler({MethodArgumentNotValidException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Object handleValidationException(MethodArgumentNotValidException exception){

        Map<String,String> errors = new HashMap<>();

        for(FieldError fieldError : exception.getBindingResult().getFieldErrors()){
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        return errors;
    }

}
