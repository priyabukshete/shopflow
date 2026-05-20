using MediatR;
using ShopFlow.Identity.Application.Commands;
using ShopFlow.Identity.Application.DTOs;
using ShopFlow.Identity.Application.Interfaces;
using ShopFlow.Identity.Domain.Exceptions;
using ShopFlow.Identity.Domain.Interfaces;

namespace ShopFlow.Identity.Application.Handlers;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public LoginHandler(IUserRepository userRepository, IPasswordService passwordService, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new DomainException("Invalid email or password");

        if (!user.IsActive)
            throw new DomainException("User account is deactivated");

        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            throw new DomainException("Invalid email or password");

        var token = _jwtService.GenerateToken(user);

        return new AuthResponseDto(
            token,
            user.Email,
            $"{user.FirstName} {user.LastName}",
            user.Role,
            DateTime.UtcNow.AddHours(24)
        );
    }
}