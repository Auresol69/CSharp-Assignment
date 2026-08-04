FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY InteractHub_API/InteractHub_API.csproj InteractHub_API/
COPY InteractHub_Shared/InteractHub_Shared.csproj InteractHub_Shared/
RUN dotnet restore ./InteractHub_API/InteractHub_API.csproj

COPY . .
RUN dotnet publish ./InteractHub_API/InteractHub_API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Upgrade OS packages to patch known CVEs (tar, openssl, gpgv, etc.)
RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "InteractHub_API.dll"]