package com.capstone.controller;

import com.capstone.entity.ChatMessage;
import com.capstone.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        return chatService.saveMessage(message);
    }

    @GetMapping("/{sender}/{receiver}")
    public List<ChatMessage> getChatHistory(@PathVariable String sender, @PathVariable String receiver) {
        return chatService.getChatHistory(sender, receiver);
    }
}
