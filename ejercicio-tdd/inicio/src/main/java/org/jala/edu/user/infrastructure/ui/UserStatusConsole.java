package org.jala.edu.user.infrastructure.ui;

import org.jala.edu.user.application.port.in.ChangeUserStatusCommand;
import org.jala.edu.user.application.usecase.ChangeUserStatusUseCase;
import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserRole;
import org.jala.edu.user.domain.model.UserStatus;
import org.jala.edu.user.infrastructure.persistence.InMemoryUserRepository;

/**
 * Adaptador de entrada (hace de "pantalla"). JaCoCo lo excluye en el pom.xml:
 * en el capstone las pantallas JavaFX se prueban a mano en delivery-system.
 */
public final class UserStatusConsole {

    private UserStatusConsole() {
    }

    public static void main(String[] args) {
        InMemoryUserRepository repository = new InMemoryUserRepository();
        User admin = repository.save(User.register("admin@example.com", UserRole.ADMIN));
        ChangeUserStatusUseCase changeStatus = new ChangeUserStatusUseCase(repository);
        try {
            changeStatus.execute(new ChangeUserStatusCommand(admin.getId().value(), UserStatus.INACTIVE));
        } catch (RuntimeException e) {
            System.out.println("No se pudo desactivar: " + e.getMessage());
        }
    }
}
