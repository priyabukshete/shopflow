using MediatR;
using ShopFlow.Identity.Application.DTOs;

namespace ShopFlow.Identity.Application.Queries;

public record GetAllUsersQuery() : IRequest<IEnumerable<UserDto>>;