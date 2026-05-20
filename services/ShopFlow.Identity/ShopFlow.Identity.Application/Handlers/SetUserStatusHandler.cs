using MediatR;
using ShopFlow.Identity.Application.Commands;
using ShopFlow.Identity.Application.Common;
using ShopFlow.Identity.Application.DTOs;
using ShopFlow.Identity.Domain.Exceptions;
using ShopFlow.Identity.Domain.Interfaces;

namespace ShopFlow.Identity.Application.Handlers;

public class SetUserStatusHandler : IRequestHandler<SetUserStatusCommand, UserDto>
{
    private readonly IUserRepository _userRepository;

    public SetUserStatusHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto> Handle(SetUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId)
            ?? throw new DomainException("User not found");

        if (request.IsActive)
            user.Activate();
        else
            user.Deactivate();

        await _userRepository.UpdateAsync(user);
        return user.ToDto();
    }
}