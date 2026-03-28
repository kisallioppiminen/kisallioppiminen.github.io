# PowerShell script to modernize all course pages
# This script updates all course chapter index.html files to use the modern format

$baseDir = "c:\Users\03039951\Documents\Github\kisallioppiminen.github.io\kurssit"

# Get all course chapter directories
$chapterDirs = Get-ChildItem $baseDir -Directory | ForEach-Object {
    $courseDir = $_.FullName
    Get-ChildItem $courseDir -Directory | Where-Object {
        Test-Path "$($_.FullName)\index.html"
    } | ForEach-Object {
        "$($_.FullName)\index.html"
    }
}

Write-Host "Found $($chapterDirs.Count) course chapter files to update"

foreach ($filePath in $chapterDirs) {
    Write-Host "Processing $filePath"

    $content = Get-Content $filePath -Raw -Encoding UTF8

    # Skip if already updated (check for emoji in objectives)
    if ($content -match [regex]::Escape("🎯 Luvun tavoitteet")) {
        Write-Host "  Skipping - already updated"
        continue
    }

    # 1. Update objectives section - remove accordion and add emoji
    $content = $content -replace '(?s)<section class="panel">\s*<header>\s*<h1>\s*<a data-toggle="collapse" class="collapsed" data-target="[^"]*">\s*Luvun tavoitteet\s*</a>\s*</h1>\s*</header>\s*<div[^>]*>\s*<div class="objective">', '<section class="panel" id="tavoitteet">
        <header>
            <h1>🎯 Luvun tavoitteet</h1>
        </header>
        <div>
            <div class="objective">'

    # Remove the close-section div and closing div for objectives
    $content = $content -replace '(?s)\s*<div class="close-section">\s*<a[^>]*>Sulje kappale</a>\s*</div>\s*</div>\s*</section>', '
        </div>
    </section>'

    # 2. Update theory sections - remove accordion and add emoji
    $content = $content -replace '(?s)<section class="panel">\s*<header[^>]*>\s*<h1>\s*<a data-toggle="collapse" class="collapsed" data-target="[^"]*">\s*([^<]+)\s*</a>\s*</h1>\s*</header>\s*<div[^>]*>\s*<div class="teoria">', '<section class="panel" id="teoria">
        <header class="otsikko">
            <h1>📖 $1</h1>
        </header>
        <div>
            <div class="teoria">'

    # Remove closing div for theory sections
    $content = $content -replace '(?s)</div>\s*</div>\s*</section>\s*<section class="tehtava', '</div>
        </div>
    </section>

    <section class="tehtava'

    # 3. Update exercise sections - add checkboxes and emojis
    $content = $content -replace '(?s)<div class="checkbox-group"></div>\s*<a data-toggle="collapse" class="collapsed" data-target="([^"]*)">\s*([^<]+)\s*</a>', '<div class="checkbox-group">
                                <input type="checkbox" id="exercise-$1" aria-label="Merkitse tehtävä suoritetuksi">
                            </div>
                            <a href="#$1" data-toggle="collapse" class="collapsed">
                                ✏️ $2
                            </a>'

    # 4. Update answer sections - add emoji
    $content = $content -replace '(?s)<a data-toggle="collapse" class="collapsed" data-target="([^"]*)">\s*VASTAUS\s*</a>', '<a href="#$1" data-toggle="collapse" class="collapsed">
                                💡 VASTAUS
                            </a>'

    # 5. Add loading="lazy" to images
    $content = $content -replace '<img([^>]*src="[^"]*\.png[^"]*"[^>]*)>', '<img$1 loading="lazy">'

    # Save the updated content
    $content | Out-File $filePath -Encoding UTF8 -Force

    Write-Host "  Updated successfully"
}

Write-Host "All course files have been updated!"