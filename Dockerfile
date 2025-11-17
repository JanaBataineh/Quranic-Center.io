# المرحلة 1: بناء الكود
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# نسخ ملف المشروع فقط (للاستفادة من طبقة الكاش)
COPY ["QuranCenters.API/QuranCenters.API.csproj", "QuranCenters.API/"]
RUN dotnet restore "QuranCenters.API/QuranCenters.API.csproj"

# نسخ باقي الملفات
COPY . .
WORKDIR "/src/QuranCenters.API"

# نشر التطبيق (وضع الملفات النهائية في مجلد /app/publish)
RUN dotnet publish "QuranCenters.API.csproj" -c Release -o /app/publish

# ----------------------------------------------------------------------

# المرحلة 2: تشغيل التطبيق (بيئة أخف)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# نسخ الملفات المنشورة من المرحلة 1
COPY --from=build /app/publish .

# أمر تشغيل التطبيق (يجب أن يكون اسم الـ DLL مطابق لاسم مشروعك)
ENTRYPOINT ["dotnet", "QuranCenters.API.dll"]