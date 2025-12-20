package com.devarena.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userId;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @OneToMany(mappedBy = "owner")
    private List<Contest> createdContests;

    @ManyToMany
    @JoinTable(name = "users_contests",
                joinColumns = @JoinColumn(name="user_id"),
                inverseJoinColumns = @JoinColumn(name="contest_id"))
    private List<Contest> attendedContests;

    @OneToMany(mappedBy = "owner")
    private List<Question> createdQuestions;

    @ManyToMany(mappedBy = "modifiers")
    private List<Question> modifierQuestions;

}

