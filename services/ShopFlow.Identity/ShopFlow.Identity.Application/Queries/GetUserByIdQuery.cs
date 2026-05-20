using MediatR;
using ShopFlow.Identity.Application.DTOs;

namespace ShopFlow.Identity.Application.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto?>;