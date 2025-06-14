package com.capstone.service;

import com.capstone.dto.request.AuthenticationRequest;
import com.capstone.dto.request.ExchangeTokenRequest;
import com.capstone.dto.request.IntrospectRequest;
import com.capstone.dto.response.AuthenticationResponse;
import com.capstone.dto.response.IntrospectResponse;
import com.capstone.dto.response.OutboundUserResponse;
import com.capstone.entity.User;
import com.capstone.enums.Role;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.httpclient.OutboundIdentityClient;
import com.capstone.repository.UserRepository;
import com.capstone.repository.httpclient.OutboundUserClient;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.nimbusds.jose.crypto.MACSigner;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {
    UserRepository userRepository;
    OutboundIdentityClient outboundIdentityClient;
    OutboundUserClient outboundUserClient;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
        protected String CLIENT_ID = "964382509869-hik85ja05qv6ddk6puctvvp9ackik4jn.apps.googleusercontent.com";

    @NonFinal
    protected String CLIENT_SECRET = "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";

    @NonFinal
    protected String REDIRECT_URI = "https://stresshelper.store/authenticate";

    @NonFinal
    protected String GRANT_TYPE = "authorization_code";


    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);
        return IntrospectResponse.builder()
                .valid(verified && expiryTime.after(new Date()))
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Check if user is banned
        if (user.getBanned()) {
            throw new AppException(ErrorCode.USER_BANNED); // You'll need to define this ErrorCode
        }

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        // Check if email is verified
        if (!user.getEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        
        var token = generateToken(user);
        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }
    public String generateToken(User user){
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(10, ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        }
        catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }
    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (user.getRole() != null) {
            stringJoiner.add("ROLE_" + user.getRole().getName());
            if (!CollectionUtils.isEmpty(user.getRole().getPermissions())) {
                user.getRole().getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            }
        }

        return stringJoiner.toString();
    }

    public AuthenticationResponse authenticateOutbound(String code) {
        var response = outboundIdentityClient.exchangeToken(ExchangeTokenRequest.builder()
                .code(code)
                .clientId(CLIENT_ID)
                .clientSecret(CLIENT_SECRET)
                .grantType(GRANT_TYPE)
                .redirectUri(REDIRECT_URI)
                .build());
        var userInfo = outboundUserClient.getUserInfo("json", response.getAccessToken());

        log.info("User info before setting: {}", userInfo);
        log.info(userInfo.getGivenName());
        var user = userRepository.findByUsername(userInfo.getEmail())
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(userInfo.getEmail())
                        .firstName(userInfo.getGivenName())
                        .lastName(userInfo.getFamilyName())
                        .role(com.capstone.entity.Role.builder()
                                .name(Role.USER.name())
                                .build())
                        .build()));
        log.info("User info after setting: {}", userInfo);
        log.info("User entity after save/retrieve: {}", user);
        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

}
