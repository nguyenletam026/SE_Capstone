package com.capstone.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

    @GetMapping("/app")
    public ResponseEntity<Resource> downloadExecutable() {
        // thay link nay thanh link file can tai
        String filePath = "D:/PRN231/StressAnalyzerClient/StressAnalyzerClient/bin/Debug/net8.0-windows/StressAnalyzerClient.exe";
        File file = new File(filePath);

        System.out.println("File absolute path: " + file.getAbsolutePath());
        System.out.println("File exists: " + file.exists());

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentLength(file.length())
                .body(resource);
    }


}