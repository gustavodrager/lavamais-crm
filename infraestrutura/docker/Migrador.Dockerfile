FROM mcr.microsoft.com/dotnet/sdk:10.0 AS compilacao
WORKDIR /codigo
COPY . .
RUN dotnet restore src/backend/LavaMais.Crm.Migrador/LavaMais.Crm.Migrador.csproj
RUN dotnet publish src/backend/LavaMais.Crm.Migrador/LavaMais.Crm.Migrador.csproj -c Release -o /aplicacao --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS execucao
RUN apt-get update \
    && apt-get install --no-install-recommends --yes libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /aplicacao
COPY --from=compilacao /aplicacao .
ENTRYPOINT ["dotnet", "LavaMais.Crm.Migrador.dll"]
