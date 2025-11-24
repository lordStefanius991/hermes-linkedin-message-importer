package it.linkedinaddon.mapper;

import it.linkedinaddon.dto.MessageDto;
import it.linkedinaddon.entity.MessageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface MessageMapper {

    MessageDto toDto(MessageEntity entity);

    MessageEntity toEntity(MessageDto dto);
}