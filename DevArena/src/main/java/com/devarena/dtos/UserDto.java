package com.devarena.dtos;

import com.devarena.models.Contest;
import com.devarena.models.Provider;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private UUID userId;
    private String username;
    private String email;

    private String password;

    private boolean enable=true;
    private Instant createdAt=Instant.now();
    private Instant updatesAt=Instant.now();

    private Provider provider=Provider.LOCAL;

    private List<Contest> createdContests;

    private List<Contest> attendedContests;
}
