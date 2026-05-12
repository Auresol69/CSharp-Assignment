FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY InteractHub_Worker/InteractHub_Worker.csproj InteractHub_Worker/
COPY InteractHub_Shared/InteractHub_Shared.csproj InteractHub_Shared/
RUN dotnet restore ./InteractHub_Worker/InteractHub_Worker.csproj

COPY . .
RUN dotnet publish ./InteractHub_Worker/InteractHub_Worker.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:10.0-preview
WORKDIR /app

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "InteractHub_Worker.dll"]
