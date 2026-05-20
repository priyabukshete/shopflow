namespace ShopFlow.Orders.Application.Common;

public static class OrderNumberGenerator
{
    // Format: ORD-20260518-001
    public static string Generate(DateTime date, int sequenceNumber) =>
        $"ORD-{date:yyyyMMdd}-{sequenceNumber:D3}";
}