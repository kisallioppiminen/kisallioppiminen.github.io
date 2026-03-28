const fs = require('fs');
const path = require('path');

// Directory containing all courses
const courseDir = path.join(__dirname, 'kurssit');
let totalUpdated = 0;
let totalSkipped = 0;

// Get all course chapter directories
function getChapterFiles(dir) {
    const files = [];
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                const subDir = path.join(dir, item.name);
                try {
                    const subItems = fs.readdirSync(subDir, { withFileTypes: true });
                    for (const subItem of subItems) {
                        if (subItem.isDirectory() && (subItem.name.startsWith('luku') || subItem.name === 'geometriaaVektoreidenAvulla')) {
                            const indexPath = path.join(subDir, subItem.name, 'index.html');
                            if (fs.existsSync(indexPath)) {
                                files.push(indexPath);
                            }
                        }
                    }
                } catch (err) {
                    // Skip directories we can't read
                }
            }
        }
    } catch (err) {
        console.error('Error reading course directory:', err.message);
    }
    return files;
}

const chapterFiles = getChapterFiles(courseDir);
console.log(`Found ${chapterFiles.length} course chapter files\n`);

chapterFiles.forEach(filePath => {
    const fileName = filePath.replace(courseDir, 'kurssit');
    let content = fs.readFileSync(filePath, 'utf8');
    let updatesApplied = 0;

    // Skip if already updated (check for emoji in objectives)
    if (content.includes('🎯 Luvun tavoitteet')) {
        console.log(`✓ SKIP: ${fileName} (already updated)`);
        totalSkipped++;
        return;
    }

    console.log(`\n⚙️  Updating: ${fileName}`);

    const backup = content; // Keep backup to verify changes

    // 1. UPDATE OBJECTIVES - Replace accordion "Luvun tavoitteet" with emoji header
    // This pattern handles variations in whitespace and IDs
    const objectivesRegex = /<a\s+data-toggle="collapse"\s+class="collapsed"\s+data-target="[^"]*">\s*Luvun\s+tavoitteet\s*<\/a>/gi;
    if (objectivesRegex.test(content)) {
        content = content.replace(objectivesRegex, '<h1>🎯 Luvun tavoitteet</h1>');
        updatesApplied++;
        console.log('  ✓ Objectives: Added emoji header');
    }

    // 2. UPDATE THEORY SECTIONS - Add emoji to section headers
    // Pattern: <a data-toggle="collapse"...>TEXT</a> inside <header class="otsikko">
    const theoryRegex = /<a\s+data-toggle="collapse"\s+class="collapsed"\s+data-target="[^"]*">([^<]+)<\/a>(?=\s*<\/h1>\s*<\/header>\s*<div[^>]*>\s*<div\s+class="teoria")/gi;
    if (theoryRegex.test(content)) {
        content = content.replace(theoryRegex, '<span>📖 $1</span>');
        updatesApplied++;
        console.log('  ✓ Theory sections: Added emoji headers');
    }

    // 3. UPDATE EXERCISES - Add emoji and fix checkboxes
    // Pattern: <a data-toggle="collapse"...>EXERCISE_NAME</a> in div.tehtava
    const exerciseRegex = /<a\s+data-toggle="collapse"\s+class="collapsed"\s+data-target="([^"]*)">\s*([^<]+)\s*<\/a>(?=\s*<\/h1>\s*<\/header>\s*<div[^>]*class="collapse")/gi;
    if (exerciseRegex.test(content)) {
        content = content.replace(exerciseRegex, '<a href="#$1" data-toggle="collapse" class="collapsed">✏️ $2</a>');
        updatesApplied++;
        console.log('  ✓ Exercises: Added emoji to exercise titles');
    }

    // 4. UPDATE ANSWERS - Add emoji to answer headers
    const answerRegex = /<a\s+data-toggle="collapse"\s+class="collapsed"\s+data-target="([^"]*)">\s*VASTAUS\s*<\/a>/gi;
    if (answerRegex.test(content)) {
        content = content.replace(answerRegex, '<a href="#$1" data-toggle="collapse" class="collapsed">💡 VASTAUS</a>');
        updatesApplied++;
        console.log('  ✓ Answers: Added emoji');
    }

    // 5. ADD LAZY LOADING TO IMAGES
    // Pattern: <img ... src="...png" ...> (with or without closing />)
    const imgRegex = /<img([^>]*?)(?<!loading="lazy")>/gi;
    const imgMatches = content.match(imgRegex) || [];
    if (imgMatches.length > 0) {
        content = content.replace(/<img([^>]*?)>/gi, (match) => {
            // Only add if not already present
            if (!match.includes('loading="lazy"')) {
                // Insert before closing /> or >
                return match.replace(/\s*(\/?)>$/, ' loading="lazy"$1>');
            }
            return match;
        });
        updatesApplied++;
        console.log(`  ✓ Images: Added lazy loading to ${imgMatches.length} images`);
    }

    // 6. REMOVE CLOSE-SECTION DIVS (old accordion remnants)
    const closeSectionRegex = /\s*<div\s+class="close-section">\s*<a[^>]*>Sulje\s+kappale<\/a>\s*<\/div>/gi;
    if (closeSectionRegex.test(content)) {
        content = content.replace(closeSectionRegex, '');
        updatesApplied++;
        console.log('  ✓ Cleanup: Removed old "close-section" divs');
    }

    // Only write if changes were made
    if (updatesApplied > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ UPDATED: ${updatesApplied} change(s) applied`);
        totalUpdated++;
    } else {
        console.log(`  ⚠️  No changes applied (may need manual review)`);
    }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`  ✅ Updated: ${totalUpdated} files`);
console.log(`  ⏭️  Skipped: ${totalSkipped} files (already done)`);
console.log(`  📝 Total: ${chapterFiles.length} files processed`);
console.log(`${'='.repeat(60)}`);