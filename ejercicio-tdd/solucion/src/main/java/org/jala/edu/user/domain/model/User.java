package org.jala.edu.user.domain.model;

import java.util.Objects;
import org.jala.edu.user.domain.exception.DomainException;

/** Versión reducida del agregado User del capstone: solo lo necesario para el ejercicio. */
public class User {

    private final UserId id;
    private final String email;
    private final UserRole role;
    private UserStatus status;

    private User(UserId id, String email, UserRole role, UserStatus status) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.status = status;
    }

    /** Un usuario nuevo siempre nace activo. */
    public static User register(String email, UserRole role) {
        if (email == null || !email.contains("@")) {
            throw new DomainException("Email is not valid");
        }
        return new User(UserId.newId(), email, Objects.requireNonNull(role, "Role is required"), UserStatus.ACTIVE);
    }

    public void activate() {
        status = UserStatus.ACTIVE;
    }

    public void deactivate() {
        status = UserStatus.INACTIVE;
    }

    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    public UserId getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }
}
