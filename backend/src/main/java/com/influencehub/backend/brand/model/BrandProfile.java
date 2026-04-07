package com.influencehub.backend.brand.model;

import com.influencehub.backend.model.User;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "brand_profiles")
public class BrandProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brandName;
    private String website;
    private String industry;
    private String description;
    private String instagramHandle;
    private String location;
    private String logoUrl;
    // optional
    private String budgetRange;
    private String linkedin;
    private String youtube;
    private Integer followers;
    private Boolean verified;

    //One-to-One with User
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}