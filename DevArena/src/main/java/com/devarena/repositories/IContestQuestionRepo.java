package com.devarena.repositories;

import com.devarena.models.ContestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IContestQuestionRepo extends JpaRepository<ContestQuestion, UUID> {

}
