using MediatR;
using ShopFlow.Identity.Application.DTOs;

namespace ShopFlow.Identity.Application.Commands;

public record RegisterUserCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Role
) : IRequest<UserDto>;