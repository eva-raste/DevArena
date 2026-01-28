package com.devarena.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="users")
public class User implements UserDetails
{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userId;

    @Column(unique = true)
    private String displayName;

    @Column(unique = true)
    private String email;

    private String password;

    private boolean enable=true;
    private Instant createdAt=Instant.now();
    private Instant updatesAt=Instant.now();

    @Enumerated(EnumType.STRING)
    private Provider provider=Provider.LOCAL;

    @OneToMany(mappedBy = "owner")
    private List<Contest> createdContests = new ArrayList<>();

    @ManyToMany(mappedBy = "modifiers")
    private List<Contest> modifierContests = new ArrayList<>();

    @ManyToMany(mappedBy = "attendees")
    private List<Contest> attendedContests = new ArrayList<>();

    @OneToMany(mappedBy = "owner")
    private List<Question> createdQuestions = new ArrayList<>();

    @ManyToMany(mappedBy = "modifiers")
    private List<Question> modifierQuestions = new ArrayList<>();

    @PrePersist
    protected void onCreate()
    {
        Instant now=Instant.now();
        enable = true;
        if(createdAt==null)
            createdAt=now;
        updatesAt=now;
    }

    @PreUpdate
    protected void onUpdate()
    {
        updatesAt=Instant.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enable;
    }


}

