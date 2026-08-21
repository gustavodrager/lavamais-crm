FROM mcr.microsoft.com/dotnet/sdk:10.0 AS compilacao
WORKDIR /codigo
COPY . .
RUN dotnet restore src/backend/LavaMais.Crm.Worker/LavaMais.Crm.Worker.csproj
RUN dotnet publish src/backend/LavaMais.Crm.Worker/LavaMais.Crm.Worker.csproj -c Release -o /aplicacao --no-restore

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS execucao
WORKDIR /aplicacao
COPY --from=compilacao /aplicacao .
ENTRYPOINT ["dotnet", "LavaMais.Crm.Worker.dll"]
