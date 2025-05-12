package com.capstone.repository;

import com.capstone.entity.ClassRoom;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, String> {
    List<ClassRoom> findByTeacher(User teacher);
    
    List<ClassRoom> findByStudentsContaining(User student);
} 