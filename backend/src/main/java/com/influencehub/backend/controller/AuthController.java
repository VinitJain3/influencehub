package com.influencehub.backend.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        // 🔐 Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        return "User registered successfully";
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }




    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        User existingUser = userRepository.findByEmail(user.getEmail())
                .orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        if (passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {

            // 🔑 Generate JWT
            String token = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}