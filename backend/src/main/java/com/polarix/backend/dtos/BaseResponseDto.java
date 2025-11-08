package com.polarix.backend.dtos;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
public class BaseResponseDto {
    private UUID id;

    private Instant createdAt;

    private Instant updatedAt;
}
