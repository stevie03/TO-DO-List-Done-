package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private boolean unlocked;

    @Column(name = "alert_shown", nullable = false)
    private boolean alertShown;

    public Achievement(String name, boolean unlocked) {
        this.name = name;
        this.unlocked = unlocked;
        this.alertShown = false;
    }

    public Achievement() {
        this.alertShown = false;

    }
}