#!/usr/bin/env python3
"""
DAWG AI Module Monitoring Dashboard
Live monitoring for parallel Claude Code instances
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import re
import subprocess
from datetime import datetime
import os

class DashboardHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.serve_dashboard()
        elif self.path == '/api/status':
            self.serve_status()
        elif self.path == '/api/git':
            self.serve_git_activity()
        else:
            self.send_error(404)

    def serve_dashboard(self):
        html = """
<!DOCTYPE html>
<html>
<head>
    <title>DAWG AI Module Monitor</title>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
            background: #0a0a0a;
            color: #ffffff;
            padding: 20px;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-radius: 12px;
            border: 2px solid #333;
        }

        h1 {
            font-size: 36px;
            background: linear-gradient(90deg, #00d9ff, #ff006e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }

        .last-update {
            color: #888;
            font-size: 14px;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .summary-card {
            background: #1a1a1a;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #333;
            text-align: center;
            transition: all 0.3s;
        }

        .summary-card:hover {
            border-color: #00d9ff;
            transform: translateY(-5px);
        }

        .summary-value {
            font-size: 48px;
            font-weight: bold;
            background: linear-gradient(90deg, #00d9ff, #ff006e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
        }

        .summary-label {
            font-size: 14px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .module-card {
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .module-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #00d9ff, #ff006e);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s;
        }

        .module-card:hover {
            border-color: #00d9ff;
            transform: translateY(-5px);
        }

        .module-card:hover::before {
            transform: scaleX(1);
        }

        .module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .module-name {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
        }

        .module-number {
            font-size: 12px;
            color: #666;
            background: #2a2a2a;
            padding: 4px 8px;
            border-radius: 4px;
        }

        .status-indicator {
            font-size: 28px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .progress-bar {
            height: 12px;
            background: #2a2a2a;
            border-radius: 6px;
            overflow: hidden;
            margin: 15px 0;
            position: relative;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d9ff, #ff006e);
            border-radius: 6px;
            transition: width 0.5s ease;
            position: relative;
            overflow: hidden;
        }

        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.3),
                transparent
            );
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #888;
        }

        .module-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #2a2a2a;
        }

        .meta-item {
            font-size: 12px;
        }

        .meta-label {
            color: #666;
            display: block;
        }

        .meta-value {
            color: #fff;
            font-weight: 500;
        }

        .git-section {
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 40px;
        }

        .git-section h2 {
            color: #00d9ff;
            margin-bottom: 20px;
            font-size: 24px;
        }

        .git-commit {
            background: #0a0a0a;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 3px solid #00d9ff;
            font-size: 13px;
            font-family: 'SF Mono', monospace;
        }

        .git-commit:hover {
            background: #1a1a1a;
        }

        .commit-hash {
            color: #00d9ff;
            margin-right: 10px;
        }

        .commit-message {
            color: #fff;
        }

        .commit-time {
            color: #666;
            float: right;
            font-size: 11px;
        }

        .alert {
            background: #2a1a1a;
            border: 2px solid #ff006e;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-icon {
            font-size: 24px;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        .spinner {
            border: 3px solid #2a2a2a;
            border-top: 3px solid #00d9ff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .refresh-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            border: 2px solid #333;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 12px;
            color: #666;
            z-index: 1000;
        }

        .refresh-indicator.active {
            border-color: #00d9ff;
            color: #00d9ff;
        }
    </style>
</head>
<body>
    <div class="refresh-indicator" id="refreshIndicator">
        ⟳ Auto-refresh: <span id="countdown">30s</span>
    </div>

    <div class="container">
        <header>
            <h1>🎵 DAWG AI Module Monitor</h1>
            <div class="last-update">
                Last update: <span id="lastUpdate">Loading...</span>
            </div>
        </header>

        <div id="alerts"></div>

        <div class="summary" id="summary">
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading module status...</p>
            </div>
        </div>

        <div class="modules-grid" id="modulesGrid"></div>

        <div class="git-section">
            <h2>📝 Recent Git Activity</h2>
            <div id="gitActivity">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading git commits...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let countdown = 30;
        let countdownInterval;

        async function updateDashboard() {
            try {
                // Update status
                const statusResponse = await fetch('/api/status');
                const statusData = await statusResponse.json();
                updateSummary(statusData);
                updateModules(statusData);

                // Update git activity
                const gitResponse = await fetch('/api/git');
                const gitData = await gitResponse.json();
                updateGitActivity(gitData);

                // Update last update time
                document.getElementById('lastUpdate').textContent =
                    new Date().toLocaleTimeString();

                // Show alerts if needed
                updateAlerts(statusData);

            } catch (error) {
                console.error('Error updating dashboard:', error);
                showError('Failed to fetch data. Is the server running?');
            }
        }

        function updateSummary(data) {
            const modules = data.modules || {};
            const modulesList = Object.values(modules);

            const completed = modulesList.filter(m => m.status === '🟢').length;
            const inProgress = modulesList.filter(m => m.status === '🟡').length;
            const blocked = modulesList.filter(m => m.status === '⚠️').length;
            const total = modulesList.length || 11;
            const progress = Math.round((completed / total) * 100);

            document.getElementById('summary').innerHTML = `
                <div class="summary-card">
                    <div class="summary-value">${progress}%</div>
                    <div class="summary-label">Overall Progress</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${completed}</div>
                    <div class="summary-label">Completed</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${inProgress}</div>
                    <div class="summary-label">In Progress</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${blocked}</div>
                    <div class="summary-label">Blocked</div>
                </div>
            `;
        }

        function updateModules(data) {
            const modules = data.modules || {};
            const grid = document.getElementById('modulesGrid');

            if (Object.keys(modules).length === 0) {
                grid.innerHTML = '<div class="loading">No module data available yet</div>';
                return;
            }

            grid.innerHTML = '';

            Object.entries(modules).forEach(([num, module]) => {
                const card = document.createElement('div');
                card.className = 'module-card';
                card.innerHTML = `
                    <div class="module-header">
                        <div>
                            <div class="module-name">${module.name}</div>
                            <div class="module-number">Module ${num}</div>
                        </div>
                        <div class="status-indicator">${module.status}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${module.progress}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${module.progress}%</span>
                        <span>${module.status_text}</span>
                    </div>
                    <div class="module-meta">
                        <div class="meta-item">
                            <span class="meta-label">Commits</span>
                            <span class="meta-value">${module.commits || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Last Active</span>
                            <span class="meta-value">${module.lastActive || 'Never'}</span>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        function updateGitActivity(data) {
            const container = document.getElementById('gitActivity');

            if (!data.commits || data.commits.length === 0) {
                container.innerHTML = '<p style="color: #666">No recent commits</p>';
                return;
            }

            container.innerHTML = data.commits.map(commit => `
                <div class="git-commit">
                    <span class="commit-hash">${commit.hash}</span>
                    <span class="commit-message">${commit.message}</span>
                    <span class="commit-time">${commit.time}</span>
                </div>
            `).join('');
        }

        function updateAlerts(data) {
            const alertsDiv = document.getElementById('alerts');
            const blocked = Object.values(data.modules || {}).filter(m => m.status === '⚠️');

            if (blocked.length > 0) {
                alertsDiv.innerHTML = `
                    <div class="alert">
                        <span class="alert-icon">⚠️</span>
                        <span><strong>Warning:</strong> ${blocked.length} module(s) blocked!</span>
                    </div>
                `;
            } else {
                alertsDiv.innerHTML = '';
            }
        }

        function showError(message) {
            document.getElementById('alerts').innerHTML = `
                <div class="alert">
                    <span class="alert-icon">❌</span>
                    <span><strong>Error:</strong> ${message}</span>
                </div>
            `;
        }

        function startCountdown() {
            const indicator = document.getElementById('refreshIndicator');
            const countdownSpan = document.getElementById('countdown');

            countdownInterval = setInterval(() => {
                countdown--;
                countdownSpan.textContent = countdown + 's';

                if (countdown <= 0) {
                    countdown = 30;
                    indicator.classList.add('active');
                    updateDashboard().then(() => {
                        setTimeout(() => indicator.classList.remove('active'), 500);
                    });
                }
            }, 1000);
        }

        // Initial load
        updateDashboard();
        startCountdown();
    </script>
</body>
</html>
        """

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())

    def serve_status(self):
        """Parse MODULE_STATUS.md and return JSON"""
        try:
            with open('MODULE_STATUS.md', 'r') as f:
                content = f.read()

            modules = {}

            # Parse module table
            pattern = r'\| (\d+) \| (.+?) \| ([🔴🟡🟢🔵⚠️❌]) (.+?) \| (\d+)%'
            matches = re.findall(pattern, content)

            for match in matches:
                module_num, name, status, status_text, progress = match
                modules[module_num] = {
                    'name': name.strip(),
                    'status': status,
                    'status_text': status_text.strip(),
                    'progress': int(progress),
                    'commits': self.get_module_commits(module_num),
                    'lastActive': self.get_last_activity(module_num)
                }

            response = {
                'modules': modules,
                'updated': datetime.now().isoformat()
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            self.send_error(500, str(e))

    def serve_git_activity(self):
        """Get recent git commits"""
        try:
            result = subprocess.run(
                ['git', 'log', '--all', '--oneline', '--graph', '--decorate', '-15'],
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )

            commits = []
            for line in result.stdout.split('\n'):
                if line.strip():
                    # Parse git log format
                    parts = line.split(maxsplit=2)
                    if len(parts) >= 2:
                        commits.append({
                            'hash': parts[1][:7] if len(parts) > 1 else '',
                            'message': parts[2] if len(parts) > 2 else line,
                            'time': ''
                        })

            response = {'commits': commits}

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            self.send_error(500, str(e))

    def get_module_commits(self, module_num):
        """Get commit count for a module"""
        try:
            module_dir = f'../dawg-module-{module_num}'
            if os.path.exists(module_dir):
                result = subprocess.run(
                    ['git', 'rev-list', '--count', 'HEAD'],
                    capture_output=True,
                    text=True,
                    cwd=module_dir
                )
                return int(result.stdout.strip()) if result.returncode == 0 else 0
        except:
            pass
        return 0

    def get_last_activity(self, module_num):
        """Get last activity time for a module"""
        try:
            module_dir = f'../dawg-module-{module_num}'
            if os.path.exists(module_dir):
                result = subprocess.run(
                    ['git', 'log', '-1', '--format=%ar'],
                    capture_output=True,
                    text=True,
                    cwd=module_dir
                )
                return result.stdout.strip() if result.returncode == 0 else 'Never'
        except:
            pass
        return 'Never'

def run_server(port=8080):
    server = HTTPServer(('localhost', port), DashboardHandler)
    print(f'🎛️  DAWG AI Dashboard running at http://localhost:{port}')
    print('Press Ctrl+C to stop')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n\n✅ Dashboard stopped')

if __name__ == '__main__':
    run_server()
