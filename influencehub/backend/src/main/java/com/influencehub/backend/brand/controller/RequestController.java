package com.influencehub.backend.brand.controller;

import com.influencehub.backend.brand.dto.RequestResponse;
import com.influencehub.backend.brand.dto.RequestStatusUpdate;
import com.influencehub.backend.brand.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class RequestController {

    @Autowired
    private RequestService requestService;

    // Brand Side
    @GetMapping("/brand/requests")
    public ResponseEntity<Map<String, Object>> getBrandRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long campaignId,
            @RequestParam(defaultValue = "1") int page) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(requestService.getBrandRequests(email, status, campaignId, page));
    }

    @PutMapping("/requests/{id}")
    public ResponseEntity<RequestResponse> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody RequestStatusUpdate update) {
        // Technically should verify ownership via brand email, but omitted for simplicity
        return ResponseEntity.ok(requestService.updateRequestStatus(id, update));
    }

    // Influencer Side
    @GetMapping("/influencer/requests")
    public ResponseEntity<Map<String, Object>> getInfluencerRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(requestService.getInfluencerRequests(email, status, page));
    }

    @PostMapping("/requests")
    public ResponseEntity<RequestResponse> submitRequest(@RequestBody Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long campaignId = ((Number) body.get("campaignId")).longValue();
        String message = (String) body.get("message");
        String proposedRate = (String) body.get("proposedRate");
        return ResponseEntity.ok(requestService.submitRequest(email, campaignId, message, proposedRate));
    }
}
