const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROJECT_DIR = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 5000; // Wait 5 seconds after last edit before pushing

let timer = null;
let pendingFiles = new Set();

// Determine Git Binary path
let gitCmd = 'git';
const minGitPath = path.join(process.env.LOCALAPPDATA || '', 'MinGit', 'cmd', 'git.exe');
if (fs.existsSync(minGitPath)) {
    gitCmd = `"${minGitPath}"`;
}

console.log('⚡ [Auto-Push Watcher] Started...');
console.log(`📁 Monitoring project directory: ${PROJECT_DIR}`);
console.log(`🔧 Using Git Executable: ${gitCmd}`);

function pushChanges() {
    console.log(`\n📦 [Auto-Push] Syncing ${pendingFiles.size} modified file(s) to GitHub...`);
    pendingFiles.clear();

    const timestamp = new Date().toLocaleString();
    const commitMsg = `auto: sync changes (${timestamp})`;
    const cmd = `${gitCmd} add . && ${gitCmd} commit -m "${commitMsg}" && ${gitCmd} push origin main`;

    exec(cmd, { cwd: PROJECT_DIR }, (error, stdout, stderr) => {
        if (error) {
            if (stderr.includes('nothing to commit') || stdout.includes('nothing to commit')) {
                console.log('ℹ️ [Auto-Push] Working tree clean, nothing new to push.');
            } else {
                console.error('❌ [Auto-Push Error]:', stderr || error.message);
            }
        } else {
            console.log('✅ [Auto-Push Success] Pushed latest changes to GitHub!');
            console.log(stdout.trim());
        }
    });
}

function handleFileChange(eventType, filename) {
    if (!filename) return;

    // Ignore non-relevant files & directories
    if (
        filename.includes('node_modules') ||
        filename.includes('.git') ||
        filename.includes('dist') ||
        filename.endsWith('.log') ||
        filename.endsWith('.txt') ||
        filename.includes('.env')
    ) {
        return;
    }

    pendingFiles.add(filename);
    console.log(`📝 File modified: ${filename} (push scheduled in 5s...)`);

    if (timer) clearTimeout(timer);
    timer = setTimeout(pushChanges, DEBOUNCE_MS);
}

// Watch project recursively
try {
    fs.watch(PROJECT_DIR, { recursive: true }, (eventType, filename) => {
        handleFileChange(eventType, filename);
    });
} catch (e) {
    console.warn('Recursive watch failed, falling back to top-level watch');
    fs.watch(PROJECT_DIR, (eventType, filename) => {
        handleFileChange(eventType, filename);
    });
}
