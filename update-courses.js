const fs = require('fs');
const path = require('path');

// Directory containing all courses
const courseDir = path.join(__dirname, 'kurssit');

// Get all course chapter directories
function getChapterFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            const subDir = path.join(dir, item.name);
            const subItems = fs.readdirSync(subDir, { withFileTypes: true });

            for (const subItem of subItems) {
                if (subItem.isDirectory() && subItem.name.startsWith('luku')) {
                    const indexPath = path.join(subDir, subItem.name, 'index.html');
                    if (fs.existsSync(indexPath)) {
                        files.push(indexPath);
                    }
                }
            }
        }
    }

    return files;
}

const chapterFiles = getChapterFiles(courseDir);
console.log(`Found ${chapterFiles.length} course chapter files to update`);

chapterFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already updated (check for emoji in objectives)
    if (content.includes('🎯 Luvun tavoitteet')) {
        console.log(`Skipping ${filePath} - already updated`);
        return;
    }

    console.log(`Updating ${filePath}`);

    // 1. Update objectives section - remove accordion and add emoji
    content = content.replace(
        /<section class="panel">\s*<header>\s*<h1>\s*<a data-toggle="collapse" class="collapsed" data-target="[^"]*">\s*Luvun tavoitteet\s*<\/a>\s*<\/h1>\s*<\/header>\s*<div[^>]*>\s*<div class="objective">/gs,
        `<section class="panel" id="tavoitteet">
        <header>
            <h1>🎯 Luvun tavoitteet</h1>
        </header>
        <div>
            <div class="objective">`
    );

    // Remove the close-section div and closing div for objectives
    content = content.replace(
        /\s*<div class="close-section">\s*<a[^>]*>Sulje kappale<\/a>\s*<\/div>\s*<\/div>\s*<\/section>/gs,
        `
        </div>
    </section>`
    );

    // 2. Update theory sections - remove accordion and add emoji
    content = content.replace(
        /<section class="panel">\s*<header[^>]*>\s*<h1>\s*<a data-toggle="collapse" class="collapsed" data-target="[^"]*">\s*([^<]+)\s*<\/a>\s*<\/h1>\s*<\/header>\s*<div[^>]*>\s*<div class="teoria">/gs,
        `<section class="panel" id="teoria">
        <header class="otsikko">
            <h1>📖 $1</h1>
        </header>
        <div>
            <div class="teoria">`
    );

    // Remove closing div for theory sections
    content = content.replace(
        /<\/div>\s*<\/div>\s*<\/section>\s*<section class="tehtava/gs,
        `</div>
        </div>
    </section>

    <section class="tehtava`
    );

    // 3. Update exercise sections - add checkboxes and emojis
    content = content.replace(
        /<div class="checkbox-group"><\/div>\s*<a data-toggle="collapse" class="collapsed" data-target="([^"]*)">\s*([^<]+)\s*<\/a>/gs,
        `<div class="checkbox-group">
                                <input type="checkbox" id="exercise-$1" aria-label="Merkitse tehtävä suoritetuksi">
                            </div>
                            <a href="#$1" data-toggle="collapse" class="collapsed">
                                ✏️ $2
                            </a>`
    );

    // 4. Update answer sections - add emoji
    content = content.replace(
        /<a data-toggle="collapse" class="collapsed" data-target="([^"]*)">\s*VASTAUS\s*<\/a>/gs,
        `<a href="#$1" data-toggle="collapse" class="collapsed">
                                💡 VASTAUS
                            </a>`
    );

    // 5. Add loading="lazy" to images
    content = content.replace(
        /<img([^>]*src="[^"]*\.png[^"]*"[^>]*)>/g,
        '<img$1 loading="lazy">'
    );

    // Save the updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
});

console.log('All course files have been updated!');