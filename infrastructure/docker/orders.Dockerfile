FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first (for caching)
COPY services/ShopFlow.Orders/ShopFlow.Orders.API/*.csproj            services/ShopFlow.Orders/ShopFlow.Orders.API/
COPY services/ShopFlow.Orders/ShopFlow.Orders.Application/*.csproj    services/ShopFlow.Orders/ShopFlow.Orders.Application/
COPY services/ShopFlow.Orders/ShopFlow.Orders.Domain/*.csproj         services/ShopFlow.Orders/ShopFlow.Orders.Domain/
COPY services/ShopFlow.Orders/ShopFlow.Orders.Infrastructure/*.csproj services/ShopFlow.Orders/ShopFlow.Orders.Infrastructure/

# Restore dependencies
RUN dotnet restore services/ShopFlow.Orders/ShopFlow.Orders.API/ShopFlow.Orders.API.csproj

# Copy everything and publish
COPY services/ShopFlow.Orders/ services/ShopFlow.Orders/
WORKDIR /src/services/ShopFlow.Orders/ShopFlow.Orders.API
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "ShopFlow.Orders.API.dll"]