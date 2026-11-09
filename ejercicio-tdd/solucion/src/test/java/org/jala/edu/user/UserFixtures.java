package org.jala.edu.user;

import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserRole;

/** Datos de prueba para el Arrange: cada prueba solo escribe el dato que le importa. */
public final class UserFixtures {

    private UserFixtures() {
    }

    public static User customer(String email) {
        return User.register(email, UserRole.CUSTOMER);
    }

    public static User admin(String email) {
        return User.register(email, UserRole.ADMIN);
    }
}
