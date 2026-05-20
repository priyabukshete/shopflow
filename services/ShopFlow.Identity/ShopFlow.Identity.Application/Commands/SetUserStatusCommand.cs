using MediatR;
using ShopFlow.Identity.Application.DTOs;

namespace ShopFlow.Identity.Application.Commands;

public record SetUserStatusCommand(
    Guid UserId,
    bool IsActive
) : IRequest<UserDto>;