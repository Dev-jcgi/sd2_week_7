package org.jala.edu.user.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.jala.edu.user.UserFixtures.admin;
import static org.jala.edu.user.UserFixtures.customer;

import java.util.UUID;
import org.jala.edu.user.application.port.in.ChangeUserStatusCommand;
import org.jala.edu.user.domain.exception.LastActiveAdminException;
import org.jala.edu.user.domain.exception.UserNotFoundException;
import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserStatus;
import org.jala.edu.user.infrastructure.persistence.InMemoryUserRepository;
import org.junit.jupiter.api.Test;

class ChangeUserStatusUseCaseTest {

    private final InMemoryUserRepository repository = new InMemoryUserRepository();
    private final ChangeUserStatusUseCase changeStatus = new ChangeUserStatusUseCase(repository);

    @Test
    void deactivatesAnActiveUser() {
        // Arrange
        User ana = repository.save(customer("ana@example.com"));

        // Act
        changeStatus.execute(new ChangeUserStatusCommand(ana.getId().value(), UserStatus.INACTIVE));

        // Assert
        assertThat(repository.findById(ana.getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.INACTIVE);
    }

    @Test
    void activatesAnInactiveUser() {
        // Arrange
        User ana = customer("ana@example.com");
        ana.deactivate();
        repository.save(ana);

        // Act
        changeStatus.execute(new ChangeUserStatusCommand(ana.getId().value(), UserStatus.ACTIVE));

        // Assert
        assertThat(repository.findById(ana.getId()).orElseThrow().isActive()).isTrue();
    }

    @Test
    void throwsWhenTheUserDoesNotExist() {
        // Arrange
        UUID unknown = UUID.randomUUID();

        // Act
        Throwable thrown = catchThrowable(() ->
                changeStatus.execute(new ChangeUserStatusCommand(unknown, UserStatus.INACTIVE)));

        // Assert
        assertThat(thrown).isInstanceOf(UserNotFoundException.class).hasMessageContaining(unknown.toString());
    }

    @Test
    void rejectsDeactivatingTheOnlyActiveAdmin() {
        // Arrange
        User onlyAdmin = repository.save(admin("admin@example.com"));

        // Act
        Throwable thrown = catchThrowable(() ->
                changeStatus.execute(new ChangeUserStatusCommand(onlyAdmin.getId().value(), UserStatus.INACTIVE)));

        // Assert
        assertThat(thrown).isInstanceOf(LastActiveAdminException.class)
                .hasMessage("There must be at least one active administrator");
        assertThat(repository.findById(onlyAdmin.getId()).orElseThrow().isActive()).isTrue();
    }

    @Test
    void deactivatesAnAdminWhenAnotherAdminIsActive() {
        // Arrange
        User admin = repository.save(admin("admin@example.com"));
        repository.save(admin("second-admin@example.com"));

        // Act
        changeStatus.execute(new ChangeUserStatusCommand(admin.getId().value(), UserStatus.INACTIVE));

        // Assert
        assertThat(repository.findById(admin.getId()).orElseThrow().isActive()).isFalse();
    }
}
