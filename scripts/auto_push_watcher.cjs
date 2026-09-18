const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROJECT_DIR = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 4000; // Wait 4 seconds after last edit before pushing
const SAFETY_POLL_INTERVAL_MS = 25000; // Every 25 seconds check if there are any uncommitted changes

let timer = null;
let pendingFiles = new Set();
let isPushing = false;
let pendingPushRequested = false;

// Determine Git Binary path
let gitCmd = 'git';
const minGitPath = path.join(process.env.LOCALAPPDATA || '', 'MinGit', 'cmd', 'git.exe');
if (fs.existsSync(minGitPath)) {
    gitCmd = `"${minGitPath}"`;
}

console.log('⚡ [Auto-Push Watcher v2.0] Started...');
console.log(`📁 Monitoring project directory: ${PROJECT_DIR}`);
console.log(`🔧 Using Git Executable: ${gitCmd}`);

function pushChanges(reason = 'file change') {
    if (isPushing) {
        pendingPushRequested = true;
        return;
    }

    isPushing = true;
    const fileCount = pendingFiles.size;
    pendingFiles.clear();

    const timestamp = new Date().toLocaleString();
    const commitMsg = `auto: sync changes (${timestamp})`;
    const cmd = `${gitCmd} add . && ${gitCmd} commit -m "${commitMsg}" && ${gitCmd} push origin main`;

    console.log(`\n📦 [Auto-Push] Starting sync (${reason}, ~${fileCount} files staged)...`);

    exec(cmd, { cwd: PROJECT_DIR }, (error, stdout, stderr) => {
        isPushing = false;

        if (error) {
            const out = (stderr || stdout || error.message || '').toLowerCase();
            if (out.includes('nothing to commit') || out.includes('clean')) {
                // Nothing changed, perfectly normal
            } else {
                console.error('⚠️ [Auto-Push Warning]:', stderr || error.message);
            }
        } else {
            console.log(`✅ [Auto-Push Success] Pushed to GitHub at ${timestamp}!`);
            if (stdout && stdout.trim()) {
                console.log(stdout.trim().split('\n').slice(-3).join('\n'));
            }
        }

        // If changes arrived while pushing, trigger immediately
        if (pendingPushRequested || pendingFiles.size > 0) {
            pendingPushRequested = false;
            setTimeout(() => pushChanges('queued changes'), 1500);
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
    console.log(`📝 File modified: ${filename} (push scheduled in 4s...)`);

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => pushChanges('debounced watch event'), DEBOUNCE_MS);
}

// Watch project recursively
try {
    fs.watch(PROJECT_DIR, { recursive: true }, (eventType, filename) => {
        handleFileChange(eventType, filename);
    });
    console.log('👀 Recursive directory watcher active.');
} catch (e) {
    console.warn('Recursive watch failed, falling back to top-level watch');
    fs.watch(PROJECT_DIR, (eventType, filename) => {
        handleFileChange(eventType, filename);
    });
}

// Periodic safety sweep to catch any changes not captured by fs.watch
setInterval(() => {
    if (isPushing) return;

    exec(`${gitCmd} status --porcelain`, { cwd: PROJECT_DIR }, (err, stdout) => {
        if (!err && stdout && stdout.trim().length > 0) {
            // Filter out ignored patterns if any
            const lines = stdout.trim().split('\n').filter(l => {
                return !l.includes('.log') && !l.includes('.txt') && !l.includes('.env');
            });
            if (lines.length > 0) {
                console.log(`🔍 [Safety Sweep] Detected ${lines.length} uncommitted file(s). Triggering auto-sync...`);
                pushChanges('periodic safety sweep');
            }
        }
    });
}, SAFETY_POLL_INTERVAL_MS);

// Initial check on launch
setTimeout(() => {
    exec(`${gitCmd} status --porcelain`, { cwd: PROJECT_DIR }, (err, stdout) => {
        if (!err && stdout && stdout.trim().length > 0) {
            pushChanges('startup sync');
        }
    });
}, 2000);
