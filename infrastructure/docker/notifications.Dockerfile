# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY services/ShopFlow.Notifications/ShopFlow.Notifications.Worker/*.csproj         services/ShopFlow.Notifications/ShopFlow.Notifications.Worker/
COPY services/ShopFlow.Notifications/ShopFlow.Notifications.Application/*.csproj    services/ShopFlow.Notifications/ShopFlow.Notifications.Application/
COPY services/ShopFlow.Notifications/ShopFlow.Notifications.Domain/*.csproj         services/ShopFlow.Notifications/ShopFlow.Notifications.Domain/
COPY services/ShopFlow.Notifications/ShopFlow.Notifications.Infrastructure/*.csproj services/ShopFlow.Notifications/ShopFlow.Notifications.Infrastructure/

RUN dotnet restore services/ShopFlow.Notifications/ShopFlow.Notifications.Worker/ShopFlow.Notifications.Worker.csproj

COPY services/ShopFlow.Notifications/ services/ShopFlow.Notifications/
WORKDIR /src/services/ShopFlow.Notifications/ShopFlow.Notifications.Worker
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ShopFlow.Notifications.Worker.dll"]