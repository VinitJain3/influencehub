package com.influencehub.backend.controller;

import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.dto.AuthResponse;
import com.influencehub.backend.dto.BrandRegisterRequest;
import com.influencehub.backend.dto.InfluencerRegisterRequest;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    @Autowired
    private InfluencerProfileRepository influencerProfileRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register/brand")
    public ResponseEntity<?> registerBrand(@RequestBody BrandRegisterRequest request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("brand");
        user = userRepository.save(user);

        BrandProfile profile = new BrandProfile();
        profile.setUser(user);
        profile.setBrandName(request.getCompanyName());
        profile.setIndustry(request.getIndustry());
        profile.setWebsite(request.getWebsite());
        profile.setDescription(request.getDescription());
        profile.setBudgetRange(request.getBudget());
        // For lists, we should really join them or manage properly
        profile.setYoutube(request.getContentTypes() != null ? String.join(",", request.getContentTypes()) : "");
        brandProfileRepository.save(profile);

        String token = jwtUtil.generateToken(user.getEmail());
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(userDto, token, user.getRole()));
    }

    @PostMapping("/register/influencer")
    public ResponseEntity<?> registerInfluencer(@RequestBody InfluencerRegisterRequest request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("influencer");
        user = userRepository.save(user);

        InfluencerProfile profile = new InfluencerProfile();
        profile.setUser(user);
        profile.setHandle(request.getHandle());
        profile.setPrimaryPlatform(request.getPrimaryPlatform());
        profile.setFollowerCount(request.getFollowerCount());
        profile.setNiche(request.getNiche());
        profile.setLocation(request.getLocation());
        profile.setBio(request.getBio());
        profile.setOtherPlatforms(request.getOtherPlatforms() != null ? String.join(",", request.getOtherPlatforms()) : "");
        profile.setBaseRate(request.getBaseRate());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setEngagementRate(request.getEngagementRate());
        influencerProfileRepository.save(profile);

        String token = jwtUtil.generateToken(user.getEmail());
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(userDto, token, user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getEmail());
            AuthResponse.UserDto userDto = new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(userDto, token, user.getRole()));
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}