using MediatR;
using ShopFlow.Identity.Application.Common;
using ShopFlow.Identity.Application.DTOs;
using ShopFlow.Identity.Application.Queries;
using ShopFlow.Identity.Domain.Interfaces;

namespace ShopFlow.Identity.Application.Handlers;

public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id);
        return user?.ToDto();
    }
}