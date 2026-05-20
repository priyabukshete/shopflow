# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore (cache layer)
COPY services/ShopFlow.Inventory/ShopFlow.Inventory.API/*.csproj            services/ShopFlow.Inventory/ShopFlow.Inventory.API/
COPY services/ShopFlow.Inventory/ShopFlow.Inventory.Application/*.csproj    services/ShopFlow.Inventory/ShopFlow.Inventory.Application/
COPY services/ShopFlow.Inventory/ShopFlow.Inventory.Domain/*.csproj         services/ShopFlow.Inventory/ShopFlow.Inventory.Domain/
COPY services/ShopFlow.Inventory/ShopFlow.Inventory.Infrastructure/*.csproj services/ShopFlow.Inventory/ShopFlow.Inventory.Infrastructure/

RUN dotnet restore services/ShopFlow.Inventory/ShopFlow.Inventory.API/ShopFlow.Inventory.API.csproj

# Copy everything and build
COPY services/ShopFlow.Inventory/ services/ShopFlow.Inventory/
WORKDIR /src/services/ShopFlow.Inventory/ShopFlow.Inventory.API
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "ShopFlow.Inventory.API.dll"]