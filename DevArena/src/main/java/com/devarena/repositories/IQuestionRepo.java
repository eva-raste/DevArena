package com.devarena.repositories;

import com.devarena.models.Question;
import com.devarena.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IQuestionRepo extends JpaRepository<Question, UUID> {

    boolean existsByQuestionSlug(String questionSlug);


    List<Question> findAllByQuestionSlugIn(List<String> questionSlugs);

    Optional<Question> findByQuestionSlug(String slug);

    List<Question> findAllByOwner(User owner);

    Optional<Question> findByQuestionSlugAndOwner(
            String slug
            , User owner);

    Optional<Question> findByQuestionSlugAndDeletedFalse(String questionSlug);

    Page<Question> findAllByDeletedFalseAndOwner(User owner, Pageable pageable);

}
