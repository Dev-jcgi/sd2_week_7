package org.jala.edu.user.application.usecase;

import org.jala.edu.user.application.port.in.ChangeUserStatusCommand;
import org.jala.edu.user.application.port.out.UserRepositoryPort;
import org.jala.edu.user.domain.exception.LastActiveAdminException;
import org.jala.edu.user.domain.exception.UserNotFoundException;
import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserId;
import org.jala.edu.user.domain.model.UserRole;
import org.jala.edu.user.domain.model.UserStatus;

/** FUN-003: los usuarios se desactivan, nunca se borran. FEAT-57: siempre queda un ADMIN activo. */
public class ChangeUserStatusUseCase {

    private final UserRepositoryPort userRepository;

    public ChangeUserStatusUseCase(UserRepositoryPort userRepository) {
        this.userRepository = userRepository;
    }

    public void execute(ChangeUserStatusCommand command) {
        UserId id = new UserId(command.id());
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        if (command.status() == UserStatus.ACTIVE) {
            user.activate();
        } else {
            rejectDeactivatingTheLastActiveAdmin(user);
            user.deactivate();
        }
        userRepository.save(user);
    }

    private void rejectDeactivatingTheLastActiveAdmin(User user) {
        boolean isActiveAdmin = user.isActive() && user.getRole() == UserRole.ADMIN;
        if (isActiveAdmin && userRepository.countActiveByRole(UserRole.ADMIN) <= 1) {
            throw new LastActiveAdminException();
        }
    }
}
