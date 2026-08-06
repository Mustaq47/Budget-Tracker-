const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'www', 'index.html');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

// Precise line ranges to remove (based on the 715-line git-restored file)
const toRemove = [
    [230, 251], // Home nav
    [330, 351], // Budget nav
    [378, 399], // Insights nav
    [419, 440], // Recurring nav
    [561, 582], // Settings nav
    [675, 696]  // Report nav
];

// Mark lines to keep
const keep = new Array(lines.length).fill(true);
toRemove.forEach(([start, end]) => {
    for (let i = start - 1; i < end; i++) {
        keep[i] = false;
    }
});

let newLines = lines.filter((_, i) => keep[i]);
let html = newLines.join('\n');

// 1. Add Permissions section to Settings (Screen 5)
const permissionsSection = `\n        <!-- Permissions -->
        <div class="settings-section">
          <div class="settings-label">Permissions</div>
          <div class="settings-row" onclick="manageCameraPermission()">
            <span class="sr-icon">📷</span>
            <span class="sr-label">Camera Access</span>
            <span class="sr-value" id="settingsCameraPerm" style="color:var(--text-muted)">Verify</span>
            <span class="sr-arrow">›</span>
          </div>
        </div>\n`;

html = html.replace(/<!-- Report -->/, permissionsSection + '        <!-- Report -->');

// 2. Insert Global Nav before app-shell closing
const globalNav = `\n\n    <!-- ──────────────────────────────────────────────
     GLOBAL BOTTOM NAV (single instance, shared by all screens)
     ────────────────────────────────────────────── -->
    <div class="global-spacer"></div>
    <div class="bottom-nav" id="globalNav">
      <div class="nav-item active" data-screen="screen-home" onclick="goTo('screen-home')">
        <div class="nav-icon">🏠</div>
        <div class="nav-label">Home</div>
      </div>
      <div class="nav-item" data-screen="screen-budget" onclick="goTo('screen-budget')">
        <div class="nav-icon">📊</div>
        <div class="nav-label">Budget</div>
      </div>
      <div class="nav-item" id="navCamera" onclick="startScanner()">
        <div class="nav-icon" style="filter:none; transform: scale(1.2)">📷</div>
        <div class="nav-label">Camera</div>
      </div>
      <div class="nav-item" data-screen="screen-recurring" onclick="goTo('screen-recurring')">
        <div class="nav-icon">🔁</div>
        <div class="nav-label">Recurring</div>
      </div>
      <div class="nav-item" data-screen="screen-report" onclick="goTo('screen-report')">
        <div class="nav-icon">📈</div>
        <div class="nav-label">Report</div>
      </div>
    </div>\n`;

html = html.replace(/<\/div><!-- \/app-shell -->/, globalNav + '    </div><!-- /app-shell -->');

// 3. Insert Scanner Overlay before Scripts
const scannerOverlay = `\n  <!-- Scanner Overlay -->
  <div id="scannerOverlay" class="scanner-overlay hidden">
    <div class="scanner-top-bar">
      <span>Scan UPI QR Code</span>
      <button class="scanner-close" onclick="stopScanner()">✕</button>
    </div>
    <div class="scanner-target">
      <div class="scanner-corner tl"></div>
      <div class="scanner-corner tr"></div>
      <div class="scanner-corner bl"></div>
      <div class="scanner-corner br"></div>
    </div>
  </div>\n`;

html = html.replace(/<!-- Scripts -->/, scannerOverlay + '  <!-- Scripts -->');

// 4. Update Version and ensure Scripts are correct
html = html.replace(/<span class="sr-value">6\.0\.0<\/span>/, '<span class="sr-value">6.1.0</span>');

fs.writeFileSync(filePath, html);
console.log('Reconstructed index.html accurately from git state');
