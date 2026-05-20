using MediatR;
using ShopFlow.Identity.Application.Commands;
using ShopFlow.Identity.Application.Common;
using ShopFlow.Identity.Application.DTOs;
using ShopFlow.Identity.Application.Interfaces;
using ShopFlow.Identity.Domain.Entities;
using ShopFlow.Identity.Domain.Exceptions;
using ShopFlow.Identity.Domain.Interfaces;

namespace ShopFlow.Identity.Application.Handlers;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;

    public RegisterUserHandler(IUserRepository userRepository, IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
    }

    public async Task<UserDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.ExistsAsync(request.Email))
            throw new DomainException($"User with email {request.Email} already exists");

        var passwordHash = _passwordService.HashPassword(request.Password);

        var user = User.Create(
            request.FirstName,
            request.LastName,
            request.Email,
            passwordHash,
            request.Role
        );

        await _userRepository.AddAsync(user);

        return user.ToDto();
    }
}