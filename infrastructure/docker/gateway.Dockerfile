# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY gateway/ShopFlow.Gateway/*.csproj gateway/ShopFlow.Gateway/
RUN dotnet restore gateway/ShopFlow.Gateway/ShopFlow.Gateway.csproj

COPY gateway/ShopFlow.Gateway/ gateway/ShopFlow.Gateway/
WORKDIR /src/gateway/ShopFlow.Gateway
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "ShopFlow.Gateway.dll"]