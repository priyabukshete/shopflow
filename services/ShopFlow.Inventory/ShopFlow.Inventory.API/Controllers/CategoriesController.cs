using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopFlow.Inventory.Application.Commands;
using ShopFlow.Inventory.Application.Queries;

namespace ShopFlow.Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllCategoriesQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddCategoryRequest request)
    {
        var command = new AddCategoryCommand(request.Name, request.Description);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record AddCategoryRequest(string Name, string Description);