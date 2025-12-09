package com.devarena.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private UUID userId;
    private String name;
    private String email;
    private String password;

    private List<Contest> createdContests;
    private List<Contest> attendedContests;
}
