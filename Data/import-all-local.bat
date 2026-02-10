@echo off
REM Sanity Portfolio Data Import Script (Local)
REM Uses npx sanity to avoid global install requirement

setlocal enabledelayedexpansion
cd /d "%~dp0"


REM Default dataset name
set DATASET=%1
if "%DATASET%"=="" set DATASET=production

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   Sanity Portfolio Data Import Script (Local)     ║
echo ╚════════════════════════════════════════════════════╝
echo.

echo Dataset: %DATASET%
echo Import Mode: Replace existing documents
echo.

REM Confirm before proceeding
set /p CONFIRM="Continue with import? This will replace existing documents. [y/N]: "
if /i not "%CONFIRM%"=="y" (
    echo Import cancelled.
    exit /b 0
)

echo.
echo Starting import...
echo.

REM Import files in order
set FILES=skills.ndjson profile.ndjson education.ndjson experience.ndjson projects.ndjson blog.ndjson services.ndjson achievements.ndjson certifications.ndjson testimonials.ndjson navigation.ndjson siteSettings.ndjson contact.ndjson

set COUNT=0
for %%F in (%FILES%) do (
    set /a COUNT+=1
    if exist "%%F" (
        echo [!COUNT!] Importing %%F...
        call npx sanity dataset import "%%F" "%DATASET%" --replace
        if errorlevel 1 (
            echo [ERROR] Failed to import %%F
        ) else (
            echo [SUCCESS] Successfully imported %%F
        )
        echo.
    ) else (
        echo [WARNING] %%F not found, skipping...
        echo.
    )
)

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   ✓ Import Complete!                              ║
echo ╚════════════════════════════════════════════════════╝
echo.
pause
