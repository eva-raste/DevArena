package com.devarena.security;

import com.devarena.helper.userHelper;
import com.devarena.repositories.UserRepository;
import io.jsonwebtoken.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private Logger logger= LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                if (!jwtService.isAccessToken(token)) {
                    filterChain.doFilter(request, response);
                    return;
                }

            try {
                Jws<Claims> parse = jwtService.parse(token);
                Claims payload = parse.getPayload();
                String userId = payload.getSubject();
                UUID userUuid = userHelper.parseUUID(userId);

                userRepository.findById(userUuid)
                        .ifPresent(user -> {

                            if (!user.isEnabled()) {
                                try {
                                    filterChain.doFilter(request, response);
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                } catch (ServletException e) {
                                    throw new RuntimeException(e);
                                }
                                return;
                            }

                            if (user.isEnabled()) {

                                List<GrantedAuthority> authorities =
                                        List.of(new SimpleGrantedAuthority("ROLE_USER"));

                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        authorities
                                );


                                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                                if (SecurityContextHolder.getContext().getAuthentication() == null)
                                    SecurityContextHolder.getContext().setAuthentication(authentication);

                            }
                        });

            } catch (ExpiredJwtException e) {
                request.setAttribute("error","token expired");
                //e.printStackTrace();
            } catch (JwtException e) {
                request.setAttribute("error","invalid token");
                //e.printStackTrace();
            } catch (Exception e) {
                request.setAttribute("error","invalid token");
//                e.printStackTrace();
            }


        } catch (JwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("""
        { "status": 401, "message": "Invalid or expired JWT" }
    """);
                return;
            }
        }
        filterChain.doFilter(request, response);

    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException{
        return request.getRequestURI().startsWith("/api/auth/");
    }
}
