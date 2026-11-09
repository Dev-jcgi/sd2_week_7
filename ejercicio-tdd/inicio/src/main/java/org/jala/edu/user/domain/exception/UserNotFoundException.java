package org.jala.edu.user.domain.exception;

import org.jala.edu.user.domain.model.UserId;

public class UserNotFoundException extends DomainException {

    public UserNotFoundException(UserId id) {
        super("User not found: " + id.value());
    }
}
