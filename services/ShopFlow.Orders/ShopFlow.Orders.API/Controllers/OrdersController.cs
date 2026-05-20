using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopFlow.Orders.Application.Commands;
using ShopFlow.Orders.Application.Queries;
using System.Security.Claims;

namespace ShopFlow.Orders.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // 📋 Get all orders
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null)
    {
        if (!string.IsNullOrEmpty(status))
        {
            var byStatus = await _mediator.Send(new GetOrdersByStatusQuery(status));
            return Ok(byStatus);
        }
        var orders = await _mediator.Send(new GetAllOrdersQuery());
        return Ok(orders);
    }

    // 🔎 Get one order
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _mediator.Send(new GetOrderByIdQuery(id));
        return order == null ? NotFound() : Ok(order);
    }

    // 🛒 Place new order
    [HttpPost]
    public async Task<IActionResult> Place([FromBody] PlaceOrderRequest request)
    {
        var userName = User.Identity?.Name ?? "Unknown";
        var firstName = User.FindFirst(ClaimTypes.GivenName)?.Value ?? "";
        var lastName = User.FindFirst(ClaimTypes.Surname)?.Value ?? "";
        var fullName = $"{firstName} {lastName}".Trim();
        var createdBy = !string.IsNullOrEmpty(fullName) ? fullName : userName;

        var command = new PlaceOrderCommand(
            request.OrderType,
            createdBy,
            request.CustomerName,
            request.CustomerPhone,
            request.Items.Select(i => new PlaceOrderItemDto(
                i.ProductId, i.ProductName, i.Quantity, i.UnitPrice
            )).ToList()
        );

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // ✅ Confirm pending order
    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var result = await _mediator.Send(new ConfirmOrderCommand(id));
        return Ok(result);
    }

    // ❌ Cancel order (refunds stock via event)
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelOrderRequest request)
    {
        var result = await _mediator.Send(new CancelOrderCommand(id, request.Reason));
        return Ok(result);
    }
}

// Request DTOs
public record PlaceOrderItemRequest(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice);

public record PlaceOrderRequest(
    string OrderType,
    string? CustomerName,
    string? CustomerPhone,
    List<PlaceOrderItemRequest> Items
);

public record CancelOrderRequest(string Reason);