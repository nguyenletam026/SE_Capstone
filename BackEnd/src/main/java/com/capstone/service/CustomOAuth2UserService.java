package com.capstone.service;

import com.capstone.entity.User;
import com.capstone.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user = existingUser.orElseGet(() -> User.builder()
                .email(email)
                .firstName((String) attributes.get("given_name"))
                .lastName((String) attributes.get("family_name"))
                .username(email.split("@")[0])
                .build());

        userRepository.save(user);
        return oAuth2User;
    }
}
