package com.example.demo.service;

import com.example.demo.model.Achievement;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    private final AchievementRepository achievementRepository;
    private int deletedTaskCount = 0;

    public TaskService(TaskRepository taskRepository, AchievementRepository achievementRepository) {
        this.taskRepository = taskRepository;
        this.achievementRepository = achievementRepository;


        if (achievementRepository.count() == 0) {
            achievementRepository.save(new Achievement("Érj el 5 befejezett feladatot", false));
            achievementRepository.save(new Achievement("Érj el 5 magas prioritású befejezett feladatot", false));
            achievementRepository.save(new Achievement("Hozz létre 5 feladatot", false));
            achievementRepository.save(new Achievement("Törölj 5 feladatot", false));
            achievementRepository.save(new Achievement("Jelölj befejezettként egy feladatot kevesebb, mint 5 perccel azután, hogy létrehoztad", false));
        }
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAllOrderedByPriority();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        if (task.getPriority() == null || task.getPriority().isEmpty()) {
            task.setPriority("medium");
        }
        long taskCount = taskRepository.count();
        if (taskCount >= 4) {
            Achievement achievement = achievementRepository.findAll().stream()
                    .filter(a -> a.getName().equals("Hozz létre 5 feladatot"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Achievement not found"));

            if (!achievement.isUnlocked()) {
                achievement.setUnlocked(true);
                achievementRepository.save(achievement);
            }
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails) {
        return taskRepository.findById(id).map(task -> {
            boolean wasCompleted = task.isCompleted();
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setDeadline(taskDetails.getDeadline());
            task.setCompleted(taskDetails.isCompleted());
            task.setPriority(taskDetails.getPriority());


            if (taskDetails.isCompleted()) {
                long completedCount = taskRepository.findAll().stream().filter(Task::isCompleted).count();
                if (completedCount >= 5) {
                    Achievement achievement = achievementRepository.findAll().get(0);
                    if (!achievement.isUnlocked()) {
                        achievement.setUnlocked(true);
                        achievementRepository.save(achievement);
                    }
                }
            }
            long highPriorityCompletedCount = taskRepository.findAll().stream()
                    .filter(t -> t.isCompleted() && "high".equals(t.getPriority()))
                    .count();

            if (highPriorityCompletedCount >= 5) {
                Achievement secondAchievement = achievementRepository.findAll().stream()
                        .filter(a -> a.getName().equals("Érj el 5 magas prioritású befejezett feladatot"))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Achievement not found"));

                if (!secondAchievement.isUnlocked()) {
                    secondAchievement.setUnlocked(true);
                    achievementRepository.save(secondAchievement);
                }
            }
            if (!wasCompleted && task.isCompleted()) {
                long timeDifference = System.currentTimeMillis() - task.getCreatedAt().getTime();
                if (timeDifference <= 5 * 60 * 1000) { // 5 perc
                    Achievement achievement = achievementRepository.findAll().stream()
                            .filter(a -> a.getName().equals("Jelölj befejezettként egy feladatot kevesebb, mint 5 perccel azután, hogy létrehoztad"))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Achievement not found"));

                    if (!achievement.isUnlocked()) {
                        achievement.setUnlocked(true);
                        achievementRepository.save(achievement);
                    }
                }
            }

            return taskRepository.save(task);
        }).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);

        deletedTaskCount++;
        if (deletedTaskCount >= 5) {
            Achievement achievement = achievementRepository.findAll().stream()
                    .filter(a -> a.getName().equals("Törölj 5 feladatot"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Achievement not found"));

            if (!achievement.isUnlocked()) {
                achievement.setUnlocked(true);
                achievementRepository.save(achievement);
            }
        }
    }
}
