package com.devarena.service;

import com.devarena.dtos.UserDto;
import com.devarena.exception.ResourceNotFoundException;
import com.devarena.helper.userHelper;
import com.devarena.models.Provider;
import com.devarena.models.User;
import com.devarena.repositories.UserRepository;
import com.devarena.service.interfaces.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;


    @Override
    public UserDto createUser(UserDto userDto) {
        if(userDto.getEmail()==null || userDto.getEmail().isBlank())
            throw new IllegalArgumentException("email is required");

        if(userRepository.existsByEmail(userDto.getEmail()))
        {
            throw new IllegalArgumentException("email already exists");
        }

        User user=modelMapper.map(userDto,User.class);
        User savedUser=userRepository.save(user);
        System.out.println("user saved ");
        return modelMapper.map(savedUser,UserDto.class);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(()->new ResourceNotFoundException("user not found with given email id"));
        return modelMapper.map(user,UserDto.class);
    }

    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        User existingUser=userRepository.findById(userHelper.parseUUID(userId)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        if(userDto.getDisplayName()!=null)
            existingUser.setDisplayName(userDto.getDisplayName());


        User updatedUser=userRepository.save(existingUser);
        return modelMapper.map(updatedUser,UserDto.class);
    }

    @Override
    public void deleteUser(String userId) {
        UUID uid=userHelper.parseUUID(userId);
        User user=userRepository.findById(uid).orElseThrow(()->new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public UserDto getUserById(String userId) {
        User user=userRepository.findById(userHelper.parseUUID(userId)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        return modelMapper.map(user,UserDto.class);
    }

    @Override
    public Iterable<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(user->modelMapper.map(user,UserDto.class)).toList();
    }
}
