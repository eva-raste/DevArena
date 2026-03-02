package com.devarena.service;

import com.devarena.dtos.users.UserDto;
import com.devarena.dtos.users.UserResponseDto;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.exception.ResourceNotFoundException;
import com.devarena.helper.userHelper;
import com.devarena.models.Provider;
import com.devarena.models.User;
import com.devarena.repositories.UserRepository;
import com.devarena.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponseDto createUser(UserDto userDto) {
        if(userDto.getEmail()==null || userDto.getEmail().isBlank())
            throw new IllegalArgumentException("email is required");

        if(userRepository.existsByEmail(userDto.getEmail()))
        {
            throw new IllegalArgumentException("email already exists");
        }

        User user=toUserEntity(userDto);
        User savedUser=userRepository.save(user);
        System.out.println("user saved ");
        return toUserResponseDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getUserByEmail(String email) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(()->new ResourceNotFoundException("user not found with given email id"));
        return toUserResponseDto(user);
    }

    @Override
    @Transactional
    public UserResponseDto updateUser(UserDto userDto, String userId) {
        User existingUser=userRepository.findById(userHelper.parseUUID(userId)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        if(userDto.getDisplayName()!=null)
            existingUser.setDisplayName(userDto.getDisplayName());


        User updatedUser=userRepository.save(existingUser);
        return toUserResponseDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
        UUID uid=userHelper.parseUUID(userId);
        User user=userRepository.findById(uid).orElseThrow(()->new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getUserById(String userId) {
        User user=userRepository.findById(userHelper.parseUUID(userId)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        return toUserResponseDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserVerifyDto verifyUserByEmail(String email,User currentUser) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (email.equals(currentUser.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OWNER_CANNOT_BE_MODIFIER"
            );
        }

        UserVerifyDto dto = new UserVerifyDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());

        return dto;
    }


    private User toUserEntity(UserDto dto) {

        User user = new User();

        user.setDisplayName(dto.getDisplayName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setProvider(Provider.LOCAL);
        user.setEnable(true);

        return user;
    }

    private UserResponseDto toUserResponseDto(User user) {

        return UserResponseDto.builder()
                .userId(user.getUserId())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .build();
    }
}
