using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetReportRangeQuery(DateTime From, DateTime To) : IRequest<IEnumerable<DailyReportDto>>;