FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY VibeFlow.KanbanBoard/VibeFlow.KanbanBoard.csproj VibeFlow.KanbanBoard/
RUN dotnet restore VibeFlow.KanbanBoard/VibeFlow.KanbanBoard.csproj

COPY . .
WORKDIR /src/VibeFlow.KanbanBoard
RUN dotnet build -c Release -o /app/build
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VibeFlow.KanbanBoard.dll"]