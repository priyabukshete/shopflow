using MediatR;
using ShopFlow.Identity.Application.Common;
using ShopFlow.Identity.Application.DTOs;
using ShopFlow.Identity.Application.Queries;
using ShopFlow.Identity.Domain.Interfaces;

namespace ShopFlow.Identity.Application.Handlers;

public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => u.ToDto());
    }
}