package com.capstone.controller;

import com.capstone.dto.request.AuthenticationRequest;
import com.capstone.dto.request.IntrospectRequest;
import com.capstone.dto.response.AuthenticationResponse;
import com.capstone.dto.response.IntrospectResponse;
import com.capstone.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    @PostMapping("/token")
    com.capstone.dto.response.ApiResponse<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        var result = authenticationService.authenticate(request);
        return com.capstone.dto.response.ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/introspect")
    com.capstone.dto.response.ApiResponse<IntrospectResponse> authenticate(
            @RequestBody IntrospectRequest request
    ) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return com.capstone.dto.response.ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }
}