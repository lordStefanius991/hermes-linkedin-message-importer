package it.linkedinaddon.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CustomListRequest {
    private String tag;
    private List<Long> messageIds;
    // getter/setter
}

