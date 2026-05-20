# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore (cache layer)
COPY services/ShopFlow.Identity/ShopFlow.Identity.API/*.csproj            services/ShopFlow.Identity/ShopFlow.Identity.API/
COPY services/ShopFlow.Identity/ShopFlow.Identity.Application/*.csproj    services/ShopFlow.Identity/ShopFlow.Identity.Application/
COPY services/ShopFlow.Identity/ShopFlow.Identity.Domain/*.csproj         services/ShopFlow.Identity/ShopFlow.Identity.Domain/
COPY services/ShopFlow.Identity/ShopFlow.Identity.Infrastructure/*.csproj services/ShopFlow.Identity/ShopFlow.Identity.Infrastructure/

RUN dotnet restore services/ShopFlow.Identity/ShopFlow.Identity.API/ShopFlow.Identity.API.csproj

# Copy everything and build
COPY services/ShopFlow.Identity/ services/ShopFlow.Identity/
WORKDIR /src/services/ShopFlow.Identity/ShopFlow.Identity.API
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "ShopFlow.Identity.API.dll"]