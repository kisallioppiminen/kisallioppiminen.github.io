@echo off
REM Batch script to modernize all course pages
REM This script updates all course chapter index.html files to use the modern format

echo Starting course modernization...

REM Get all course chapter directories and process them
for /d %%d in (kurssit\*) do (
    for /d %%c in ("%%d\*") do (
        if exist "%%c\index.html" (
            echo Processing %%c\index.html
            REM Use PowerShell for string replacements
            powershell -Command "& { $content = Get-Content '%%c\index.html' -Raw -Encoding UTF8; $content = $content -replace '(?s)<section class=\"panel\">\s*<header>\s*<h1>\s*<a data-toggle=\"collapse\" class=\"collapsed\" data-target=\"[^\"]*\">\s*Luvun tavoitteet\s*</a>\s*</h1>\s*</header>\s*<div[^>]*>\s*<div class=\"objective\">', '<section class=\"panel\" id=\"tavoitteet\"><header><h1>🎯 Luvun tavoitteet</h1></header><div><div class=\"objective\">'; $content = $content -replace '(?s)\s*<div class=\"close-section\">\s*<a[^>]*>Sulje kappale</a>\s*</div>\s*</div>\s*</section>', '</div></section>'; $content | Out-File '%%c\index.html' -Encoding UTF8 }"
        )
    )
)

echo Course modernization completed!