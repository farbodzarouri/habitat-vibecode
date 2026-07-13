package com.habitat.vibecode.service;

import com.habitat.vibecode.dto.LoginRequest;
import com.habitat.vibecode.entity.Admin;
import com.habitat.vibecode.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Admin addAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    public Optional<Admin> login(LoginRequest loginRequest) {
        Optional<Admin> adminOptional = adminRepository.findByUsername(loginRequest.getUsername());
        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            if (admin.getPassword().equals(loginRequest.getPassword())) {
                return Optional.of(admin);
            }
        }
        return Optional.empty();
    }
}