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

    @Column(length = 500)
    private String description;

    private String instagramHandle;
    private String location;
    private String logoUrl;

    private String budgetRange;
    private String linkedin;
    private String youtube;
    private Integer followers;
    private Boolean verified;

    // Fields sent by frontend registration form
    private String contentTypes;       // stored as comma-separated
    private String influencerSize;
    private String platforms;          // stored as comma-separated

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}