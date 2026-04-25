package com.influencehub.backend.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.dto.*;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    @Autowired
    private InfluencerProfileRepository influencerProfileRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User existingUser = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        if (!passwordEncoder.matches(request.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(existingUser.getEmail());

        // For brands, include companyName from BrandProfile
        String companyName = null;
        if ("brand".equalsIgnoreCase(existingUser.getRole())) {
            companyName = brandProfileRepository.findByUserId(existingUser.getId())
                    .map(bp -> bp.getBrandName())
                    .orElse(null);
        }

        return ResponseEntity.ok(LoginResponse.of(
                existingUser.getName(),
                existingUser.getEmail(),
                token,
                existingUser.getRole(),
                companyName
        ));
    }

    @PostMapping("/register/brand")
    public ResponseEntity<?> registerBrand(@RequestBody BrandRegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("brand");
        userRepository.save(user);

        BrandProfile profile = new BrandProfile();
        profile.setBrandName(request.getCompanyName());
        profile.setIndustry(request.getIndustry());
        profile.setBudgetRange(request.getBudget());
        profile.setWebsite(request.getWebsite());
        profile.setDescription(request.getDescription());
        profile.setUser(user);

        if (request.getContentTypes() != null) {
            profile.setContentTypes(String.join(",", request.getContentTypes()));
        }
        profile.setInfluencerSize(request.getInfluencerSize());
        if (request.getPlatforms() != null) {
            profile.setPlatforms(String.join(",", request.getPlatforms()));
        }

        brandProfileRepository.save(profile);

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(LoginResponse.of(
                user.getName(),
                user.getEmail(),
                token,
                "brand",
                request.getCompanyName()
        ));
    }

    @PostMapping("/register/influencer")
    public ResponseEntity<?> registerInfluencer(@RequestBody InfluencerRegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("influencer");
        userRepository.save(user);

        InfluencerProfile profile = new InfluencerProfile();
        profile.setHandle(request.getHandle());
        profile.setFollowerCount(request.getFollowerCount());
        profile.setNiche(request.getNiche());
        profile.setLocation(request.getLocation());
        profile.setBio(request.getBio());
        profile.setPrimaryPlatform(request.getPrimaryPlatform());
        profile.setBaseRate(request.getBaseRate());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setEngagementRate(request.getEngagementRate());
        profile.setUser(user);

        if (request.getOtherPlatforms() != null) {
            profile.setOtherPlatforms(String.join(",", request.getOtherPlatforms()));
        }

        influencerProfileRepository.save(profile);

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(LoginResponse.of(
                user.getName(),
                user.getEmail(),
                token,
                "influencer"
        ));
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }
}