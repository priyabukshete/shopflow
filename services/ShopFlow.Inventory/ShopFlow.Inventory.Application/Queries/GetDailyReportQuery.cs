using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetDailyReportQuery(DateTime Date) : IRequest<DailyReportDto>;