FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /src
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "EventHive/EventHive.csproj"
RUN dotnet build "EventHive/EventHive.csproj" -c Debug -o /app/build

FROM build AS debug
RUN dotnet publish "EventHive/EventHive.csproj" -c Debug -o /app/debug
WORKDIR /app/debug
ENTRYPOINT ["dotnet", "EventHive.dll"]
