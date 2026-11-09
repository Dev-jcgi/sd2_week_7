package org.jala.edu.user.application.port.in;

import java.util.UUID;
import org.jala.edu.user.domain.model.UserStatus;

public record ChangeUserStatusCommand(UUID id, UserStatus status) {
}
