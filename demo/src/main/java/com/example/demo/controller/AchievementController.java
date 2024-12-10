package com.example.demo.controller;

import com.example.demo.model.Achievement;
import com.example.demo.service.AchievementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public List<Achievement> getAllAchievements() {
        return achievementService.getAllAchievements();
    }


    @PostMapping("/{id}/unlock")
    public ResponseEntity<Achievement> unlockAchievement(@PathVariable Long id) {
        Achievement achievement = achievementService.unlockAchievement(id);
        return ResponseEntity.ok(achievement);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Achievement> updateAchievement(@PathVariable Long id, @RequestBody Achievement updatedAchievement) {
        return achievementService.updateAchievement(id, updatedAchievement)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
