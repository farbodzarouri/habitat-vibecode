package com.habitat.vibecode.controller;

import com.habitat.vibecode.dto.LoginRequest;
import com.habitat.vibecode.entity.Admin;
import com.habitat.vibecode.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/admin")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        Optional<Admin> adminOptional = adminService.login(loginRequest);
        if (adminOptional.isPresent()) {
            return new ResponseEntity<>("Login successful", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
    }
}