package org.jala.edu.user.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import org.jala.edu.user.domain.exception.DomainException;
import org.junit.jupiter.api.Test;

class UserTest {

    @Test
    void aNewUserIsActive() {
        // Act
        User user = User.register("ana@example.com", UserRole.CUSTOMER);

        // Assert
        assertThat(user.isActive()).isTrue();
    }

    @Test
    void rejectsAnEmailWithoutAt() {
        // Act
        Throwable thrown = catchThrowable(() -> User.register("ana.example.com", UserRole.CUSTOMER));

        // Assert
        assertThat(thrown).isInstanceOf(DomainException.class).hasMessage("Email is not valid");
    }
}
