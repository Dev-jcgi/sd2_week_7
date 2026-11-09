package org.jala.edu.user.application.usecase;

import org.jala.edu.user.application.port.in.ChangeUserStatusCommand;
import org.jala.edu.user.application.port.out.UserRepositoryPort;

/** FUN-003: los usuarios se desactivan, nunca se borran. FEAT-57: siempre queda un ADMIN activo. */
public class ChangeUserStatusUseCase {

    private final UserRepositoryPort userRepository;

    public ChangeUserStatusUseCase(UserRepositoryPort userRepository) {
        this.userRepository = userRepository;
    }

    public void execute(ChangeUserStatusCommand command) {
        // TODO (TDD): no escribas código aquí hasta tener una prueba en rojo que lo pida.
        throw new UnsupportedOperationException("Todavía no implementado");
    }
}
