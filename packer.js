const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set([
    '.git', '.idea', '.vscode', '.vs', 
    'node_modules', '.npm', '.yarn', '.pnp',
    'bin', 'obj', 'debug', 'release', 'x64', 'x86', 'packages',
    'dist', 'build', 'out',
    'coverage', '.next', '.nuget',
    'temp', 'tmp', 'migrations', 'wwwroot', 'properties', 
    'assets', 'public', 'resources', 'lib'
]);

const ALLOWED_EXT = new Set([
    '.cs',          // Backend logic
    '.ts', '.tsx'   // Frontend logic
]);

const IGNORE_FILES = new Set([
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
    'project.lock.json', 'project.assets.json',
    'launchsettings.json',
    'reportwebvitals.ts', 'setuptests.ts', 'react-app-env.d.ts', // React boilerplate
    'weatherforecast.cs' // Common .NET template junk
]);

const isTextFile = (filePath) => {
    try {
        const buffer = Buffer.alloc(1024);
        const fd = fs.openSync(filePath, 'r');
        const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
        fs.closeSync(fd);
        if (bytesRead === 0) return true;
        for (let i = 0; i < bytesRead; i++) {
            if (buffer[i] === 0) return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

const fileStats = [];

const packRepo = (rootDir, outputFile) => {
    const outputStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

    const walk = (currentDir) => {
        const files = fs.readdirSync(currentDir);

        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            const stat = fs.statSync(fullPath);
            const fileNameLower = file.toLowerCase();

            if (stat.isDirectory()) {
                if (!IGNORE_DIRS.has(fileNameLower)) {
                    walk(fullPath);
                }
            } else {
                if (IGNORE_FILES.has(fileNameLower)) continue;
                
                const ext = path.extname(file).toLowerCase();
                if (!ALLOWED_EXT.has(ext)) continue;

                if (fileNameLower.includes('.spec.') || fileNameLower.includes('.test.')) continue;
                if (fileNameLower.includes('.min.')) continue;
                if (fileNameLower.endsWith('.d.ts')) continue;
                if (fileNameLower.includes('designer.cs')) continue; 

                if (!isTextFile(fullPath)) continue;

                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const lineCount = content.split('\n').length;
                    
                    fileStats.push({ path: path.relative(rootDir, fullPath), lines: lineCount });

                    const relativePath = path.relative(rootDir, fullPath);
                    outputStream.write(`\n${'='.repeat(50)}\n`);
                    outputStream.write(`FILE: ${relativePath}\n`);
                    outputStream.write(`${'='.repeat(50)}\n\n`);
                    outputStream.write(content);
                    outputStream.write('\n');
                } catch (e) {
                    outputStream.write(`Error reading file: ${e.message}\n`);
                }
            }
        }
    };

    walk(rootDir);
    outputStream.end();
    
    console.log(`Done. Created ${outputFile}`);
    console.log('\n--- NAJWIEKSZE PLIKI (SPRAWDZ CZY TO NIE SMIECI) ---');
    fileStats.sort((a, b) => b.lines - a.lines);
    fileStats.slice(0, 10).forEach(f => {
        console.log(`${f.lines} lines: ${f.path}`);
    });
};

const currentDir = process.cwd();
const outputFilename = 'repo_context_ultra_slim.txt';
packRepo(currentDir, outputFilename);