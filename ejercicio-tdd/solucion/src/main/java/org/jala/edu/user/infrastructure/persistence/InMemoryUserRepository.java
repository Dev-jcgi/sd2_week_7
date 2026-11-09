package org.jala.edu.user.infrastructure.persistence;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.jala.edu.user.application.port.out.UserRepositoryPort;
import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserId;
import org.jala.edu.user.domain.model.UserRole;

/** Adaptador de salida en memoria. En las pruebas lo usamos como "fake": se comporta como el real. */
public class InMemoryUserRepository implements UserRepositoryPort {

    private final Map<UserId, User> users = new LinkedHashMap<>();

    @Override
    public User save(User user) {
        users.put(user.getId(), user);
        return user;
    }

    @Override
    public Optional<User> findById(UserId id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public long countActiveByRole(UserRole role) {
        return users.values().stream().filter(u -> u.isActive() && u.getRole() == role).count();
    }
}
