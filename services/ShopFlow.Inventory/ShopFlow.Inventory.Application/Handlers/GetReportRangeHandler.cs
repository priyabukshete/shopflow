using MediatR;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Enums;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class GetReportRangeHandler : IRequestHandler<GetReportRangeQuery, IEnumerable<DailyReportDto>>
{
    private readonly IStockMovementRepository _movementRepository;
    private readonly IProductRepository _productRepository;

    public GetReportRangeHandler(IStockMovementRepository movementRepository, IProductRepository productRepository)
    {
        _movementRepository = movementRepository;
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<DailyReportDto>> Handle(GetReportRangeQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetAllAsync();
        var reports = new List<DailyReportDto>();

        for (var date = request.From.Date; date <= request.To.Date; date = date.AddDays(1))
        {
            var dayEnd = date.AddDays(1).AddTicks(-1);
            var movements = await _movementRepository.GetByDateRangeAsync(date, dayEnd);

            var productReports = products.Select(p =>
            {
                var productMovements = movements.Where(m => m.ProductId == p.Id).ToList();
                return new ProductDailyMovementDto(
                    p.Id,
                    p.Name,
                    Delivered: productMovements.Where(m => m.Type == StockMovementType.Delivery).Sum(m => m.Quantity),
                    Produced: productMovements.Where(m => m.Type == StockMovementType.Production).Sum(m => m.Quantity),
                    Sold: Math.Abs(productMovements.Where(m => m.Type == StockMovementType.Sale).Sum(m => m.Quantity)),
                    Wasted: Math.Abs(productMovements.Where(m => m.Type == StockMovementType.Waste).Sum(m => m.Quantity)),
                    Returned: productMovements.Where(m => m.Type == StockMovementType.Return).Sum(m => m.Quantity),
                    CurrentStock: p.CurrentStock
                );
            });

            reports.Add(new DailyReportDto(date, productReports));
        }

        return reports;
    }
}