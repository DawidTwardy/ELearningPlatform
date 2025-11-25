# Etap 1: Budowanie aplikacji
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopiujemy plik projektu (zwróæ uwagê na œcie¿ki)
COPY ["ELearning.Api/ELearning.Api.csproj", "ELearning.Api/"]
RUN dotnet restore "ELearning.Api/ELearning.Api.csproj"

# Kopiujemy resztê plików Ÿród³owych
COPY . .
WORKDIR "/src/ELearning.Api"
RUN dotnet publish "ELearning.Api.csproj" -c Release -o /app/publish

# Etap 2: Uruchamianie aplikacji
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Tworzymy folder na przesy³ane pliki (wa¿ne dla Twojego FileStorageService)
RUN mkdir -p /app/wwwroot/uploads

# Otwieramy port (Render domyœlnie u¿ywa 8080, ale .NET 8 u¿ywa 8080 domyœlnie te¿)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "ELearning.Api.dll"]