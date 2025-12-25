package com.devarena.controller;

import com.devarena.dtos.LoginRequest;
import com.devarena.dtos.TokenResponse;
import com.devarena.dtos.UserDto;
import com.devarena.models.User;
import com.devarena.repositories.UserRepository;
import com.devarena.security.JwtService;
import com.devarena.service.interfaces.IAuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final IAuthService authService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ModelMapper mapper;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerUser(userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest)
    {
        Authentication authenticate=authenticate(loginRequest);
        User user=userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(()-> new BadCredentialsException("Invalid username or password"));
        //System.out.println("email is : "+ user.getEmail());
        if(!user.isEnabled())
            throw new DisabledException("User is disabled");

        String accessToken= jwtService.generateAccessToken(user);
        TokenResponse tokenResponse=TokenResponse.of(accessToken,"",jwtService.getAccessTtlSeconds(),"Bearer",mapper.map(user,UserDto.class));

        return ResponseEntity.ok(tokenResponse);
    }

    private Authentication authenticate(LoginRequest loginRequest) {
        try{
            return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),loginRequest.getPassword()));
        }catch(Exception e){
            throw new BadCredentialsException("Invalid username or password !!");
        }
    }
//    @PostMapping("/login")
//    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
//
//        Authentication authentication = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(
//                        request.getEmail(),
//                        request.getPassword()
//                )
//        );
//
//        return ResponseEntity.ok("Login successful");
//    }
}
