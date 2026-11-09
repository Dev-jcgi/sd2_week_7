package org.jala.edu.user.domain.exception;

/** Una regla del negocio no se cumple. */
public class DomainException extends RuntimeException {

    public DomainException(String message) {
        super(message);
    }
}
