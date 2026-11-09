package org.jala.edu.user.application.port.out;

import java.util.Optional;
import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserId;
import org.jala.edu.user.domain.model.UserRole;

/** Puerto de salida: el caso de uso no sabe si los usuarios viven en memoria o en MySQL. */
public interface UserRepositoryPort {

    User save(User user);

    Optional<User> findById(UserId id);

    long countActiveByRole(UserRole role);
}
