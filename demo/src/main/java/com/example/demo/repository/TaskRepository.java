package com.example.demo.repository;

import com.example.demo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t ORDER BY " +
            "CASE t.priority " +
            "WHEN 'high' THEN 1 " +
            "WHEN 'medium' THEN 2 " +
            "WHEN 'low' THEN 3 END, t.id")
    List<Task> findAllOrderedByPriority();

}