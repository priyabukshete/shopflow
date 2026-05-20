namespace ShopFlow.Identity.Application.DTOs;

public record AuthResponseDto(
    string Token,
    string Email,
    string FullName,
    string Role,
    DateTime ExpiresAt
);