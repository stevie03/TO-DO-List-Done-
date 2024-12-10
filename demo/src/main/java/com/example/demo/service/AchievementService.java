package com.example.demo.service;

import com.example.demo.model.Achievement;
import com.example.demo.repository.AchievementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {
    private final AchievementRepository achievementRepository;

    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    public Achievement unlockAchievement(Long id) {
        return achievementRepository.findById(id).map(achievement -> {
            if (!achievement.isAlertShown()) {
                System.out.println("Unlocking achievement: " + achievement.getName());
                achievement.setUnlocked(true);
                achievement.setAlertShown(true);
            } else {
                System.out.println("Achievement already unlocked and alert shown: " + achievement.getName());
            }
            return achievementRepository.save(achievement);
        }).orElseThrow(() -> new RuntimeException("Achievement not found"));
    }



    public Optional<Achievement> updateAchievement(Long id, Achievement updatedAchievement) {
        return achievementRepository.findById(id).map(existingAchievement -> {
            existingAchievement.setAlertShown(updatedAchievement.isAlertShown());
            existingAchievement.setUnlocked(updatedAchievement.isUnlocked());
            existingAchievement.setName(updatedAchievement.getName());
            return achievementRepository.save(existingAchievement);
        });
    }





}