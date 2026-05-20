using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopFlow.Inventory.Application.Commands;
using ShopFlow.Inventory.Application.Queries;

namespace ShopFlow.Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllProductsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddProductRequest request)
    {
        var command = new AddProductCommand(
            request.Name,
            request.Description,
            request.Price,
            request.InitialStock,
            request.LowStockThreshold,
            request.CategoryId
        );
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var command = new UpdateProductCommand(
            id,
            request.Name,
            request.Description,
            request.Price,
            request.LowStockThreshold
        );
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record AddProductRequest(
    string Name,
    string Description,
    decimal Price,
    int InitialStock,
    int LowStockThreshold,
    Guid CategoryId
);

public record UpdateProductRequest(
    string Name,
    string Description,
    decimal Price,
    int LowStockThreshold
);