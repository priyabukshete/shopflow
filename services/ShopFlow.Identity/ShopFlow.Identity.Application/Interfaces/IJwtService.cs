using ShopFlow.Identity.Domain.Entities;

namespace ShopFlow.Identity.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}