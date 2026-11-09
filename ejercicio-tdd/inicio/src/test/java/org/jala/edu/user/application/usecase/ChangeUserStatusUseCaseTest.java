package org.jala.edu.user.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.jala.edu.user.UserFixtures.customer;

import org.jala.edu.user.application.port.in.ChangeUserStatusCommand;
import org.jala.edu.user.domain.model.User;
import org.jala.edu.user.domain.model.UserStatus;
import org.jala.edu.user.infrastructure.persistence.InMemoryUserRepository;
import org.junit.jupiter.api.Test;

/*
 * Ciclo TDD, una regla a la vez (ver README):
 *   1. Escribe UNA prueba nueva y córrela: tiene que fallar (rojo).   -> commit "FEAT-57: Add test ..."
 *   2. Escribe el código mínimo en ChangeUserStatusUseCase (verde).    -> commit "FEAT-57: ..."
 *   3. Si hace falta, limpia el código sin romper las pruebas.         -> commit "FEAT-57: Refactor ..."
 */
class ChangeUserStatusUseCaseTest {

    private final InMemoryUserRepository repository = new InMemoryUserRepository();
    private final ChangeUserStatusUseCase changeStatus = new ChangeUserStatusUseCase(repository);

    // Regla 1 (ya escrita para que veas el formato): desactivar a un usuario activo.
    @Test
    void deactivatesAnActiveUser() {
        // Arrange
        User ana = repository.save(customer("ana@example.com"));

        // Act
        changeStatus.execute(new ChangeUserStatusCommand(ana.getId().value(), UserStatus.INACTIVE));

        // Assert
        assertThat(repository.findById(ana.getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.INACTIVE);
    }

    // TODO Regla 2: activatesAnInactiveUser
    //      Un usuario INACTIVE pasa a ACTIVE.

    // TODO Regla 3: throwsWhenTheUserDoesNotExist
    //      Con un id que no existe se lanza UserNotFoundException y el mensaje contiene el id.

    // TODO Regla 4: rejectsDeactivatingTheOnlyActiveAdmin
    //      Si es el único ADMIN activo se lanza LastActiveAdminException
    //      ("There must be at least one active administrator") y el usuario sigue activo.
    //      Pista: la excepción todavía no existe; la prueba en rojo es la que te pide crearla.

    // TODO Regla 5: deactivatesAnAdminWhenAnotherAdminIsActive
    //      Si hay otro ADMIN activo, sí se puede desactivar.
}
