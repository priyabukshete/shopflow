using ShopFlow.Identity.Application.DTOs;
using ShopFlow.Identity.Domain.Entities;

namespace ShopFlow.Identity.Application.Common;

public static class MappingExtensions
{
    public static UserDto ToDto(this User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        user.Role,
        user.IsActive,
        user.CreatedAt
    );
}