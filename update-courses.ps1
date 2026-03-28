# PowerShell script to modernize all course pages
# This script updates all course chapter index.html files to use the modern format

$courseDir = "c:\Users\03039951\Documents\Github\kisallioppiminen.github.io\kurssit"

# Get all course chapter directories
$chapterDirs = Get-ChildItem $courseDir -Directory | ForEach-Object {
    Get-ChildItem "$($_.FullName)\*\index.html" -ErrorAction SilentlyContinue
} | Where-Object { $_.FullName -match '\\kurssit\\[^\\]+\\luku\d+\\index\.html$' }

Write-Host "Found $($chapterDirs.Count) course chapter files to update"

foreach ($file in $chapterDirs) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Skip if already updated (check for emoji in objectives)
    if ($content -match "🎯 Luvun tavoitteet") {
        Write-Host "Skipping $($file.FullName) - already updated"
        continue
    }

    Write-Host "Updating $($file.FullName)"

    # 1. Update objectives section - remove accordion and add emoji
    $pattern1 = '<section class="panel">\s*<header>\s*<h1>\s*<a data-toggle="collapse" class="collapsed" data-target="[^"]*">\s*Luvun tavoitteet\s*</a>\s*</h1>\s*</header>\s*<div[^>]*>\s*<div class="objective">'
    $replacement1 = '<section class="panel" id="tavoitteet">
        <header>
            <h1>🎯 Luvun tavoitteet</h1>
        </header>
        <div>
            <div class="objective">'
    $content = $content -replace $pattern1, $replacement1

    # Remove the close-section div and closing div for objectives
    $pattern2 = '\s*<div class="close-section">\s*<a[^>]*>Sulje kappale</a>\s*</div>\s*</div>\s*</section>'
    $replacement2 = '
        </div>
    </section>'
    $content = $content -replace $pattern2, $replacement2

    # 2. Update theory sections - remove accordion and add emoji
    $pattern3 = '<section class="panel">\s*<header[^>]*>\s*<h1>\s*<a data-toggle="collapse" class="collapsed" data-target="[^"]*">\s*([^<]+)\s*</a>\s*</h1>\s*</header>\s*<div[^>]*>\s*<div class="teoria">'
    $replacement3 = '<section class="panel" id="teoria">
        <header class="otsikko">
            <h1>📖 $1</h1>
        </header>
        <div>
            <div class="teoria">'
    $content = $content -replace $pattern3, $replacement3

    # Remove closing div for theory sections
    $pattern4 = '</div>\s*</div>\s*</section>\s*<section class="tehtava'
    $replacement4 = '</div>
        </div>
    </section>

    <section class="tehtava'
    $content = $content -replace $pattern4, $replacement4

    # 3. Update exercise sections - add checkboxes and emojis
    $pattern5 = '<div class="checkbox-group"></div>\s*<a data-toggle="collapse" class="collapsed" data-target="([^"]*)">\s*([^<]+)\s*</a>'
    $replacement5 = '<div class="checkbox-group">
                                <input type="checkbox" id="exercise-$1" aria-label="Merkitse tehtävä suoritetuksi">
                            </div>
                            <a href="#$1" data-toggle="collapse" class="collapsed">
                                ✏️ $2
                            </a>'
    $content = $content -replace $pattern5, $replacement5

    # 4. Update answer sections - add emoji
    $pattern6 = '<a data-toggle="collapse" class="collapsed" data-target="([^"]*)">\s*VASTAUS\s*</a>'
    $replacement6 = '<a href="#$1" data-toggle="collapse" class="collapsed">
                                💡 VASTAUS
                            </a>'
    $content = $content -replace $pattern6, $replacement6

    # 5. Add loading="lazy" to images
    $pattern7 = '<img([^>]*src="[^"]*\.png[^"]*")([^>]*)>'
    $replacement7 = '<img$1 loading="lazy"$2>'
    $content = $content -replace $pattern7, $replacement7

    # Save the updated content
    $content | Out-File $file.FullName -Encoding UTF8 -Force

    Write-Host "Updated $($file.FullName)"
}

Write-Host "All course files have been updated!"