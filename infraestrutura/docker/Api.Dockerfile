FROM mcr.microsoft.com/dotnet/sdk:10.0 AS compilacao
WORKDIR /codigo
COPY . .
RUN dotnet restore src/backend/LavaMais.Crm.Api/LavaMais.Crm.Api.csproj
RUN dotnet publish src/backend/LavaMais.Crm.Api/LavaMais.Crm.Api.csproj -c Release -o /aplicacao --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS execucao
RUN apt-get update \
    && apt-get install --no-install-recommends --yes libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /aplicacao
COPY --from=compilacao /aplicacao .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet LavaMais.Crm.Api.dll"]
