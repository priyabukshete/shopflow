using MediatR;
using ShopFlow.Identity.Application.DTOs;

namespace ShopFlow.Identity.Application.Commands;

public record LoginCommand(
    string Email,
    string Password
) : IRequest<AuthResponseDto>;