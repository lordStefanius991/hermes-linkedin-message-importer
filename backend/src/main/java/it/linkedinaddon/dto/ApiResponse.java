package it.linkedinaddon.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private Instant timestamp;
}
