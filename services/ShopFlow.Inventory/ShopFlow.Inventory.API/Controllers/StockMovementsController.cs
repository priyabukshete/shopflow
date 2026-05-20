using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopFlow.Inventory.Application.Commands;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Enums;
using System.Security.Claims;

namespace ShopFlow.Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockMovementsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StockMovementsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("delivery")]
    public Task<IActionResult> RecordDelivery([FromBody] RecordMovementRequest request) =>
        RecordMovement(StockMovementType.Delivery, request);

    [HttpPost("production")]
    public Task<IActionResult> RecordProduction([FromBody] RecordMovementRequest request) =>
        RecordMovement(StockMovementType.Production, request);

    [HttpPost("sale")]
    public Task<IActionResult> RecordSale([FromBody] RecordMovementRequest request) =>
        RecordMovement(StockMovementType.Sale, request);

    [HttpPost("waste")]
    public Task<IActionResult> RecordWaste([FromBody] RecordMovementRequest request) =>
        RecordMovement(StockMovementType.Waste, request);

    [HttpPost("return")]
    public Task<IActionResult> RecordReturn([FromBody] RecordMovementRequest request) =>
        RecordMovement(StockMovementType.Return, request);

    [HttpPost("adjustment")]
    public Task<IActionResult> RecordAdjustment([FromBody] RecordMovementRequest request) =>
        RecordMovement(StockMovementType.Adjustment, request);

    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId)
    {
        var result = await _mediator.Send(new GetProductMovementsQuery(productId));
        return Ok(result);
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 50)
    {
        var result = await _mediator.Send(new GetRecentMovementsQuery(limit));
        return Ok(result);
    }

    // Common helper
    private async Task<IActionResult> RecordMovement(StockMovementType type, RecordMovementRequest request)
    {
        var firstName = User.FindFirst(ClaimTypes.GivenName)?.Value ?? "";
        var lastName = User.FindFirst(ClaimTypes.Surname)?.Value ?? "";
        var recordedBy = $"{firstName} {lastName}".Trim();
        if (string.IsNullOrEmpty(recordedBy)) recordedBy = User.Identity?.Name ?? "Unknown";

        var command = new RecordStockMovementCommand(
            request.ProductId,
            type,
            request.Quantity,
            request.Reference,
            recordedBy,
            request.Notes
        );
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record RecordMovementRequest(
    Guid ProductId,
    int Quantity,
    string Reference,
    string? Notes
);