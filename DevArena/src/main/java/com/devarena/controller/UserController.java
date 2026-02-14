package com.devarena.controller;

import com.devarena.dtos.users.UserDto;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.service.interfaces.IQuesitonService;
import com.devarena.service.interfaces.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;
    private final IQuesitonService questionService;

    @PostMapping
    public ResponseEntity<UserDto> crateUser(@RequestBody UserDto userDto)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }

    @GetMapping
    public ResponseEntity<Iterable<UserDto>> getAllUsers()
    {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable("email") String email)
    {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("userId") String userId)
    {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable("userId") String userId)
    {
        userService.deleteUser(userId);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@RequestBody UserDto userDto,@PathVariable("userId") String userId)
    {
        return ResponseEntity.ok(userService.updateUser(userDto,userId));
    }

    @GetMapping("/verify-email")
    public UserVerifyDto verifyUser(@RequestParam String email) {
        return questionService.verifyUserByEmail(email);
    }

}
