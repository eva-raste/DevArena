package com.devarena.exception;

import com.devarena.dtos.errors.ApiError;
import com.devarena.dtos.errors.ErrorResponse;
import com.devarena.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Logger logger= LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @ExceptionHandler(
            {
                UsernameNotFoundException.class,
                BadCredentialsException.class,
                CredentialsExpiredException.class,
                DisabledException.class
            }
    )
    public ResponseEntity<ApiError> handleAuthException(Exception e, HttpServletRequest request){

        logger.info("Exception :{}",e.getClass().getName());
        var apiError=ApiError.of(HttpStatus.BAD_REQUEST.value(),"Bad request",e.getMessage(),request.getRequestURI());

        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceFoundException(ResourceNotFoundException exception)
    {
        ErrorResponse internalServerError=new ErrorResponse(exception.getMessage(), HttpStatus.NOT_FOUND);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(internalServerError);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException exception)
    {
        ErrorResponse error=new ErrorResponse(exception.getMessage(), HttpStatus.BAD_REQUEST);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
