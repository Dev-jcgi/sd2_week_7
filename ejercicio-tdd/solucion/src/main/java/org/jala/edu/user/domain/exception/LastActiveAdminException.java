package org.jala.edu.user.domain.exception;

/** FEAT-57: el sistema nunca se queda sin un administrador activo. */
public class LastActiveAdminException extends DomainException {

    public LastActiveAdminException() {
        super("There must be at least one active administrator");
    }
}
