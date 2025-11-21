let currentSetupStep = 0;
let userData = {
    username: 'User',
    password: '',
    email: '',
    accountType: 'local',
    selectedDrive: -1,
    wifiNetwork: ''
};
let openWindows = [];
let nextWindowZ = 100;
let calculatorDisplay = '0';
let calculatorMemory = 0;
let calculatorOperator = null;
let cpuUsage = 0;
let memUsage = 0;
let processes = [];

const setupSteps = [
    'step-welcome',
    'step-region',
    'step-keyboard',
    'step-wifi',
    'step-drive',
    'step-account-type',
    'step-installing'
];

function setupNext() {
    const currentStep = setupSteps[currentSetupStep];
    
    if (currentStep === 'step-wifi') {
        if (!userData.wifiNetwork) {
            userData.wifiNetwork = 'offline';
        }
    }
    
    if (currentStep === 'step-drive') {
        if (userData.selectedDrive === -1) {
            alert('Please select a drive');
            return;
        }
    }
    
    if (currentStep === 'step-account') {
        const username = document.getElementById('username-input').value.trim();
        if (!username) {
            alert('Please enter a name');
            return;
        }
        userData.username = username;
    }
    
    if (currentStep === 'step-password') {
        const password = document.getElementById('password-input').value;
        const confirm = document.getElementById('password-confirm').value;
        if (!password) {
            alert('Please enter a password');
            return;
        }
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        userData.password = password;
    }
    
    if (currentStep === 'step-microsoft-account') {
        const email = document.getElementById('microsoft-email').value.trim();
        if (!email) {
            alert('Please enter your email');
            return;
        }
        userData.email = email;
        userData.username = email.split('@')[0];
        document.getElementById('microsoft-email-display').textContent = email;
    }
    
    if (currentStep === 'step-microsoft-password') {
        const password = document.getElementById('microsoft-password-input').value;
        if (!password) {
            alert('Please enter your password');
            return;
        }
        userData.password = password;
    }
    
    const currentStepElement = document.getElementById(currentStep);
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
    currentSetupStep++;
    
    if (currentSetupStep < setupSteps.length) {
        const nextStepElement = document.getElementById(setupSteps[currentSetupStep]);
        if (nextStepElement) {
            nextStepElement.classList.add('active');
        }
        
        if (setupSteps[currentSetupStep] === 'step-installing') {
            startInstallation();
        }
    }
}

function selectWifi(networkName) {
    userData.wifiNetwork = networkName;
    document.getElementById('wifi-network-name').textContent = networkName;
    
    if (networkName === 'Guest Network') {
        setupNext();
    } else {
        document.getElementById('step-wifi').classList.remove('active');
        document.getElementById('step-wifi-password').classList.add('active');
    }
}

function connectWifi() {
    const password = document.getElementById('wifi-password-input').value;
    if (!password) {
        alert('Please enter the network password');
        return;
    }
    
    document.getElementById('step-wifi-password').classList.remove('active');
    document.getElementById('step-wifi').classList.add('active');
    setupNext();
}

function selectDrive(driveIndex) {
    document.querySelectorAll('.drive-item').forEach((item, index) => {
        item.classList.toggle('selected', index === driveIndex);
    });
    
    userData.selectedDrive = driveIndex;
    document.getElementById('drive-next-btn').disabled = false;
}

function selectAccountType(type) {
    userData.accountType = type;
    
    if (type === 'microsoft') {
        document.getElementById('step-account-type').classList.remove('active');
        document.getElementById('step-microsoft-account').classList.add('active');
    } else {
        document.getElementById('step-account-type').classList.remove('active');
        document.getElementById('step-account').classList.add('active');
    }
}

function handleMicrosoftAccountNext() {
    document.getElementById('step-microsoft-account').classList.remove('active');
    document.getElementById('step-microsoft-password').classList.add('active');
}

function handleMicrosoftPasswordNext() {
    document.getElementById('step-microsoft-password').classList.remove('active');
    document.getElementById('step-privacy').classList.add('active');
}

function handleLocalAccountNext() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) {
        alert('Please enter a name');
        return;
    }
    userData.username = username;
    document.getElementById('step-account').classList.remove('active');
    document.getElementById('step-password').classList.add('active');
}

function handleLocalPasswordNext() {
    const password = document.getElementById('password-input').value;
    const confirm = document.getElementById('password-confirm').value;
    if (!password) {
        alert('Please enter a password');
        return;
    }
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    userData.password = password;
    document.getElementById('step-password').classList.remove('active');
    document.getElementById('step-privacy').classList.add('active');
}

function handleMicrosoftAccountNext() {
    const email = document.getElementById('microsoft-email').value.trim();
    if (!email) {
        alert('Please enter your email');
        return;
    }
    userData.email = email;
    userData.username = email.split('@')[0];
    document.getElementById('microsoft-email-display').textContent = email;
    document.getElementById('step-microsoft-account').classList.remove('active');
    document.getElementById('step-microsoft-password').classList.add('active');
}

function handleMicrosoftPasswordNext() {
    const password = document.getElementById('microsoft-password-input').value;
    if (!password) {
        alert('Please enter your password');
        return;
    }
    userData.password = password;
    document.getElementById('step-microsoft-password').classList.remove('active');
    document.getElementById('step-privacy').classList.add('active');
}

function handlePrivacyNext() {
    document.getElementById('step-privacy').classList.remove('active');
    currentSetupStep = setupSteps.indexOf('step-installing');
    document.getElementById('step-installing').classList.add('active');
    startInstallation();
}

function createMicrosoftAccount() {
    alert('Create account feature - redirects to Microsoft account creation page');
}

function forgotPassword() {
    alert('Forgot password feature - redirects to Microsoft account recovery');
}

function startInstallation() {
    const messages = [
        'Installing Windows...',
        'Setting up devices...',
        'Getting ready...',
        'Almost there...',
        'Finalizing setup...'
    ];
    
    let progress = 0;
    let messageIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = Math.floor(progress) + '%';
        
        if (progress > 20 * (messageIndex + 1) && messageIndex < messages.length - 1) {
            messageIndex++;
            document.getElementById('install-message').textContent = messages[messageIndex];
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showScreen('screen-lock');
                updateLockTime();
            }, 1000);
        }
    }, 500);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateLockTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    
    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('screen-lock')?.addEventListener('click', () => {
        showScreen('screen-login');
        document.getElementById('login-username').textContent = userData.username;
    });
    
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
    
    updateClock();
    setInterval(updateClock, 1000);
    
    startPerformanceMonitoring();
});

function attemptLogin() {
    const enteredPassword = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    if (enteredPassword === userData.password) {
        showScreen('screen-desktop');
        document.getElementById('start-username').textContent = userData.username;
        document.getElementById('login-password').value = '';
        errorElement.textContent = '';
    } else {
        errorElement.textContent = 'Incorrect password. Please try again.';
        document.getElementById('login-password').value = '';
    }
}

function switchUser() {
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    
    const clockElement = document.getElementById('taskbar-clock');
    if (clockElement) {
        clockElement.innerHTML = `${timeStr}<br>${dateStr}`;
    }
}

function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.toggle('active');
    
    const powerMenu = document.getElementById('power-menu');
    if (powerMenu.classList.contains('active')) {
        powerMenu.classList.remove('active');
    }
}

function togglePowerMenu() {
    const powerMenu = document.getElementById('power-menu');
    powerMenu.classList.toggle('active');
}

function toggleNotifications() {
    const notificationCenter = document.getElementById('notification-center');
    notificationCenter.classList.toggle('active');
}

function lockScreen() {
    showScreen('screen-lock');
    updateLockTime();
    closeAllWindows();
}

function signOut() {
    closeAllWindows();
    showScreen('screen-login');
    document.getElementById('login-password').value = '';
}

function restart() {
    closeAllWindows();
    showScreen('screen-shutdown');
    document.getElementById('shutdown-text').textContent = 'Restarting...';
    
    setTimeout(() => {
        showScreen('screen-lock');
        updateLockTime();
    }, 3000);
}

function shutdown() {
    closeAllWindows();
    showScreen('screen-shutdown');
    document.getElementById('shutdown-text').textContent = 'Shutting down...';
    
    setTimeout(() => {
        document.body.style.background = '#000';
        document.getElementById('screen-shutdown').style.display = 'none';
    }, 3000);
}

function closeAllWindows() {
    openWindows.forEach(win => {
        if (win.element && win.element.parentNode) {
            win.element.parentNode.removeChild(win.element);
        }
    });
    openWindows = [];
    updateTaskbar();
}

function openApp(appName) {
    const existingWindow = openWindows.find(w => w.appName === appName);
    if (existingWindow) {
        focusWindow(existingWindow);
        return;
    }
    
    const windowData = createWindow(appName);
    openWindows.push(windowData);
    updateTaskbar();
    
    const startMenu = document.getElementById('start-menu');
    if (startMenu.classList.contains('active')) {
        startMenu.classList.remove('active');
    }
}

function createWindow(appName) {
    const windowEl = document.createElement('div');
    windowEl.className = 'window active';
    windowEl.style.left = (100 + openWindows.length * 30) + 'px';
    windowEl.style.top = (80 + openWindows.length * 30) + 'px';
    windowEl.style.zIndex = nextWindowZ++;
    
    const apps = {
        calculator: { title: '🔢 Calculator', content: createCalculator() },
        notepad: { title: '📝 Notepad', content: createNotepad() },
        explorer: { title: '📁 File Explorer', content: createExplorer() },
        settings: { title: '⚙️ Settings', content: createSettings() },
        taskmgr: { title: '📊 Task Manager', content: createTaskManager() },
        browser: { title: '🌐 Microsoft Edge', content: createBrowser() },
        computer: { title: '💻 This PC', content: createComputer() },
        trash: { title: '🗑️ Recycle Bin', content: '<p>Recycle Bin is empty</p>' },
        search: { title: '🔍 Search', content: '<p>Type to search your PC...</p>' }
    };
    
    const appData = apps[appName] || { title: 'Window', content: '<p>App content</p>' };
    
    windowEl.innerHTML = `
        <div class="window-titlebar">
            <div class="window-title">${appData.title}</div>
            <div class="window-controls">
                <button class="window-control minimize" onclick="minimizeWindow('${appName}')">−</button>
                <button class="window-control maximize" onclick="maximizeWindow('${appName}')">□</button>
                <button class="window-control close" onclick="closeWindow('${appName}')">✕</button>
            </div>
        </div>
        <div class="window-content ${appName === 'notepad' ? 'notepad-content' : ''}" id="window-content-${appName}">
            ${appData.content}
        </div>
    `;
    
    document.getElementById('windows-container').appendChild(windowEl);
    
    windowEl.addEventListener('mousedown', () => focusWindow({ appName, element: windowEl }));
    
    makeDraggable(windowEl);
    
    return { appName, element: windowEl, title: appData.title };
}

function makeDraggable(element) {
    const titlebar = element.querySelector('.window-titlebar');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    titlebar.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function focusWindow(windowData) {
    openWindows.forEach(w => {
        if (w.element) w.element.classList.remove('active');
    });
    if (windowData.element) {
        windowData.element.classList.add('active');
        windowData.element.style.zIndex = nextWindowZ++;
    }
    updateTaskbar();
}

function minimizeWindow(appName) {
    const windowData = openWindows.find(w => w.appName === appName);
    if (windowData && windowData.element) {
        windowData.element.style.display = 'none';
    }
    updateTaskbar();
}

function maximizeWindow(appName) {
    const windowData = openWindows.find(w => w.appName === appName);
    if (windowData && windowData.element) {
        const win = windowData.element;
        if (win.style.width === '100%') {
            win.style.width = '';
            win.style.height = '';
            win.style.left = '';
            win.style.top = '';
        } else {
            win.style.width = '100%';
            win.style.height = 'calc(100% - 48px)';
            win.style.left = '0';
            win.style.top = '0';
        }
    }
}

function closeWindow(appName) {
    const windowData = openWindows.find(w => w.appName === appName);
    if (windowData && windowData.element) {
        windowData.element.remove();
    }
    openWindows = openWindows.filter(w => w.appName !== appName);
    updateTaskbar();
}

function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = '';
    
    openWindows.forEach(win => {
        const btn = document.createElement('button');
        btn.className = 'taskbar-app';
        btn.textContent = win.title;
        btn.onclick = () => {
            if (win.element.style.display === 'none') {
                win.element.style.display = 'flex';
                focusWindow(win);
            } else {
                focusWindow(win);
            }
        };
        
        if (win.element && win.element.classList.contains('active') && win.element.style.display !== 'none') {
            btn.classList.add('active');
        }
        
        taskbarApps.appendChild(btn);
    });
}

function createCalculator() {
    setTimeout(() => {
        calculatorDisplay = '0';
        updateCalculatorDisplay();
    }, 10);
    
    return `
        <div class="calculator-grid">
            <div class="calculator-display" id="calc-display">0</div>
            <button class="calc-btn" onclick="calcClear()">C</button>
            <button class="calc-btn" onclick="calcClearEntry()">CE</button>
            <button class="calc-btn operator" onclick="calcDelete()">⌫</button>
            <button class="calc-btn operator" onclick="calcOperation('/')">÷</button>
            <button class="calc-btn" onclick="calcNumber('7')">7</button>
            <button class="calc-btn" onclick="calcNumber('8')">8</button>
            <button class="calc-btn" onclick="calcNumber('9')">9</button>
            <button class="calc-btn operator" onclick="calcOperation('*')">×</button>
            <button class="calc-btn" onclick="calcNumber('4')">4</button>
            <button class="calc-btn" onclick="calcNumber('5')">5</button>
            <button class="calc-btn" onclick="calcNumber('6')">6</button>
            <button class="calc-btn operator" onclick="calcOperation('-')">−</button>
            <button class="calc-btn" onclick="calcNumber('1')">1</button>
            <button class="calc-btn" onclick="calcNumber('2')">2</button>
            <button class="calc-btn" onclick="calcNumber('3')">3</button>
            <button class="calc-btn operator" onclick="calcOperation('+')">+</button>
            <button class="calc-btn" onclick="calcNumber('0')">0</button>
            <button class="calc-btn" onclick="calcDecimal()">.</button>
            <button class="calc-btn equals" onclick="calcEquals()" style="grid-column: span 2">=</button>
        </div>
    `;
}

function calcNumber(num) {
    if (calculatorDisplay === '0' || calculatorDisplay === 'Error') {
        calculatorDisplay = num;
    } else {
        calculatorDisplay += num;
    }
    updateCalculatorDisplay();
}

function calcOperation(op) {
    if (calculatorOperator && calculatorDisplay !== '') {
        calcEquals();
    }
    calculatorMemory = parseFloat(calculatorDisplay);
    calculatorOperator = op;
    calculatorDisplay = '';
}

function calcEquals() {
    if (calculatorOperator && calculatorDisplay !== '') {
        const current = parseFloat(calculatorDisplay);
        let result = 0;
        
        switch (calculatorOperator) {
            case '+': result = calculatorMemory + current; break;
            case '-': result = calculatorMemory - current; break;
            case '*': result = calculatorMemory * current; break;
            case '/': result = calculatorMemory / current; break;
        }
        
        calculatorDisplay = result.toString();
        calculatorOperator = null;
        updateCalculatorDisplay();
    }
}

function calcClear() {
    calculatorDisplay = '0';
    calculatorMemory = 0;
    calculatorOperator = null;
    updateCalculatorDisplay();
}

function calcClearEntry() {
    calculatorDisplay = '0';
    updateCalculatorDisplay();
}

function calcDelete() {
    if (calculatorDisplay.length > 1) {
        calculatorDisplay = calculatorDisplay.slice(0, -1);
    } else {
        calculatorDisplay = '0';
    }
    updateCalculatorDisplay();
}

function calcDecimal() {
    if (!calculatorDisplay.includes('.')) {
        calculatorDisplay += '.';
        updateCalculatorDisplay();
    }
}

function updateCalculatorDisplay() {
    const display = document.getElementById('calc-display');
    if (display) {
        display.textContent = calculatorDisplay;
    }
}

function createNotepad() {
    return '<textarea class="notepad-textarea" placeholder="Start typing..."></textarea>';
}

function createExplorer() {
    return `
        <div class="explorer-toolbar">
            <button class="explorer-btn">← Back</button>
            <button class="explorer-btn">→ Forward</button>
            <button class="explorer-btn">↑ Up</button>
        </div>
        <div class="explorer-content">
            <div class="explorer-sidebar">
                <div class="folder-item">📁 Desktop</div>
                <div class="folder-item">📁 Documents</div>
                <div class="folder-item">📁 Downloads</div>
                <div class="folder-item">📁 Pictures</div>
                <div class="folder-item">💻 This PC</div>
            </div>
            <div class="explorer-main">
                <div class="file-item">📁 <strong>My Documents</strong></div>
                <div class="file-item">📁 <strong>My Pictures</strong></div>
                <div class="file-item">📄 <strong>example.txt</strong></div>
            </div>
        </div>
    `;
}

function createSettings() {
    setTimeout(() => {
        const menuItems = document.querySelectorAll('.settings-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');
                
                const contentArea = this.closest('.window-content').querySelector('.settings-content');
                const section = this.textContent;
                
                let content = '';
                
                switch(section) {
                    case 'System':
                        content = `
                            <h2>System</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Display brightness</div>
                                    <div class="setting-description">Adjust the brightness level</div>
                                </div>
                                <input type="range" min="0" max="100" value="80" style="width: 200px;">
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Night light</div>
                                    <div class="setting-description">Reduce blue light at night</div>
                                </div>
                                <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Sound</div>
                                    <div class="setting-description">Volume: 70%</div>
                                </div>
                                <input type="range" min="0" max="100" value="70" style="width: 200px;">
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Storage</div>
                                    <div class="setting-description">C: Drive - 237 GB free of 476 GB</div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'Personalization':
                        content = `
                            <h2>Personalization</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Background</div>
                                    <div class="setting-description">Choose your desktop background</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px;">
                                    <option>Picture</option>
                                    <option>Solid color</option>
                                    <option>Slideshow</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Colors</div>
                                    <div class="setting-description">Choose your accent color</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <div style="width: 30px; height: 30px; background: #0078d4; border-radius: 4px; cursor: pointer;"></div>
                                    <div style="width: 30px; height: 30px; background: #e81123; border-radius: 4px; cursor: pointer;"></div>
                                    <div style="width: 30px; height: 30px; background: #107c10; border-radius: 4px; cursor: pointer;"></div>
                                    <div style="width: 30px; height: 30px; background: #ff8c00; border-radius: 4px; cursor: pointer;"></div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Themes</div>
                                    <div class="setting-description">Light, Dark, or Custom</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px;">
                                    <option>Light</option>
                                    <option selected>Dark</option>
                                    <option>Custom</option>
                                </select>
                            </div>
                        `;
                        break;
                    case 'Apps':
                        content = `
                            <h2>Apps & features</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Calculator</div>
                                    <div class="setting-description">Installed - 125 MB</div>
                                </div>
                                <button style="padding: 6px 12px; border-radius: 4px; background: #0078d4; color: white; border: none; cursor: pointer;">Uninstall</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Microsoft Edge</div>
                                    <div class="setting-description">Installed - 1.2 GB</div>
                                </div>
                                <button style="padding: 6px 12px; border-radius: 4px; background: #0078d4; color: white; border: none; cursor: pointer;">Uninstall</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Default apps</div>
                                    <div class="setting-description">Choose default apps for file types</div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'Accounts':
                        content = `
                            <h2>Your info</h2>
                            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                                <div style="width: 80px; height: 80px; background: #0078d4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px;">👤</div>
                                <div>
                                    <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">${userData.username}</div>
                                    <div style="font-size: 14px; color: #666;">${userData.email || 'Local Account'}</div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Sign-in options</div>
                                    <div class="setting-description">Password, PIN, Windows Hello</div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Family & other users</div>
                                    <div class="setting-description">Add family members or other users</div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'Time & Language':
                        content = `
                            <h2>Date & time</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Set time automatically</div>
                                    <div class="setting-description">Sync with internet time servers</div>
                                </div>
                                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Time zone</div>
                                    <div class="setting-description">Current time zone</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px; width: 250px;">
                                    <option>(UTC-08:00) Pacific Time</option>
                                    <option>(UTC-05:00) Eastern Time</option>
                                    <option>(UTC+00:00) London</option>
                                    <option>(UTC+01:00) Paris, Berlin</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Language</div>
                                    <div class="setting-description">Windows display language</div>
                                </div>
                                <div>English (United States)</div>
                            </div>
                        `;
                        break;
                    case 'Privacy':
                        content = `
                            <h2>Privacy</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Location</div>
                                    <div class="setting-description">Let apps use your location</div>
                                </div>
                                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Camera</div>
                                    <div class="setting-description">Let apps use your camera</div>
                                </div>
                                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Microphone</div>
                                    <div class="setting-description">Let apps use your microphone</div>
                                </div>
                                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Diagnostics & feedback</div>
                                    <div class="setting-description">Send diagnostic data to Microsoft</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px;">
                                    <option>Required</option>
                                    <option selected>Optional</option>
                                </select>
                            </div>
                        `;
                        break;
                    case 'Update & Security':
                        content = `
                            <h2>Windows Update</h2>
                            <div style="background: #f0f0f0; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                                <div style="font-size: 18px; margin-bottom: 8px;">✓ You're up to date</div>
                                <div style="font-size: 14px; color: #666;">Last checked: Today, ${new Date().toLocaleTimeString()}</div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Check for updates</div>
                                    <div class="setting-description">Get the latest features and security improvements</div>
                                </div>
                                <button style="padding: 8px 16px; border-radius: 4px; background: #0078d4; color: white; border: none; cursor: pointer;">Check for updates</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Windows Security</div>
                                    <div class="setting-description">Virus & threat protection</div>
                                </div>
                                <button style="padding: 8px 16px; border-radius: 4px; background: white; border: 1px solid #d0d0d0; cursor: pointer;">Open Security</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Backup</div>
                                    <div class="setting-description">Back up your files with File History</div>
                                </div>
                            </div>
                        `;
                        break;
                }
                
                contentArea.innerHTML = content;
            });
        });
    }, 100);
    
    return `
        <div style="display: flex; height: 100%;">
            <div class="settings-sidebar">
                <div class="settings-menu-item active">System</div>
                <div class="settings-menu-item">Personalization</div>
                <div class="settings-menu-item">Apps</div>
                <div class="settings-menu-item">Accounts</div>
                <div class="settings-menu-item">Time & Language</div>
                <div class="settings-menu-item">Privacy</div>
                <div class="settings-menu-item">Update & Security</div>
            </div>
            <div class="settings-content">
                <h2>System</h2>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Display brightness</div>
                        <div class="setting-description">Adjust the brightness level</div>
                    </div>
                    <input type="range" min="0" max="100" value="80" style="width: 200px;">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Night light</div>
                        <div class="setting-description">Reduce blue light at night</div>
                    </div>
                    <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Sound</div>
                        <div class="setting-description">Volume: 70%</div>
                    </div>
                    <input type="range" min="0" max="100" value="70" style="width: 200px;">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Storage</div>
                        <div class="setting-description">C: Drive - 237 GB free of 476 GB</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createTaskManager() {
    updateProcessList();
    
    return `
        <div class="taskmgr-tabs">
            <button class="taskmgr-tab active" onclick="switchTaskMgrTab('processes')">Processes</button>
            <button class="taskmgr-tab" onclick="switchTaskMgrTab('performance')">Performance</button>
        </div>
        <div class="taskmgr-content">
            <div id="taskmgr-processes">
                <table class="process-list">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>CPU</th>
                            <th>Memory</th>
                        </tr>
                    </thead>
                    <tbody id="process-tbody"></tbody>
                </table>
            </div>
            <div id="taskmgr-performance" style="display: none;">
                <div class="performance-grid">
                    <div class="performance-card">
                        <h3>CPU</h3>
                        <div class="performance-value" id="perf-cpu">0%</div>
                        <div class="performance-graph">
                            <div class="graph-line" id="cpu-graph"></div>
                        </div>
                    </div>
                    <div class="performance-card">
                        <h3>Memory</h3>
                        <div class="performance-value" id="perf-memory">0 MB</div>
                        <div class="performance-graph">
                            <div class="graph-line" id="mem-graph"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchTaskMgrTab(tab) {
    document.querySelectorAll('.taskmgr-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'processes') {
        document.getElementById('taskmgr-processes').style.display = 'block';
        document.getElementById('taskmgr-performance').style.display = 'none';
    } else {
        document.getElementById('taskmgr-processes').style.display = 'none';
        document.getElementById('taskmgr-performance').style.display = 'block';
    }
}

function updateProcessList() {
    processes = [
        { name: 'System', cpu: Math.random() * 5, memory: 150 + Math.random() * 50 },
        { name: 'Windows Explorer', cpu: Math.random() * 10, memory: 80 + Math.random() * 40 },
        { name: 'Microsoft Edge', cpu: Math.random() * 15, memory: 200 + Math.random() * 100 }
    ];
    
    openWindows.forEach(win => {
        processes.push({
            name: win.title,
            cpu: Math.random() * 8,
            memory: 50 + Math.random() * 100
        });
    });
    
    const tbody = document.getElementById('process-tbody');
    if (tbody) {
        tbody.innerHTML = processes.map(p => `
            <tr>
                <td>${p.name}</td>
                <td class="cpu-usage">${p.cpu.toFixed(1)}%</td>
                <td class="mem-usage">${p.memory.toFixed(0)} MB</td>
            </tr>
        `).join('');
    }
}

function startPerformanceMonitoring() {
    setInterval(() => {
        cpuUsage = Math.random() * 50 + 10;
        memUsage = 2000 + Math.random() * 2000;
        
        const perfCpu = document.getElementById('perf-cpu');
        const perfMemory = document.getElementById('perf-memory');
        const cpuGraph = document.getElementById('cpu-graph');
        const memGraph = document.getElementById('mem-graph');
        
        if (perfCpu) perfCpu.textContent = cpuUsage.toFixed(1) + '%';
        if (perfMemory) perfMemory.textContent = memUsage.toFixed(0) + ' MB';
        if (cpuGraph) cpuGraph.style.height = cpuUsage + '%';
        if (memGraph) memGraph.style.height = (memUsage / 80) + '%';
        
        updateProcessList();
    }, 2000);
}

function createBrowser() {
    return `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="background: #f3f3f3; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                <input type="text" value="https://www.bing.com" style="width: 100%; padding: 8px; border: 1px solid #d0d0d0; border-radius: 4px;">
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: white;">
                <div style="text-align: center;">
                    <h2 style="color: #0078d4;">Microsoft Edge</h2>
                    <p>The fast and secure browser for Windows 10</p>
                </div>
            </div>
        </div>
    `;
}

function createComputer() {
    return `
        <div class="explorer-content">
            <div class="explorer-sidebar">
                <div class="folder-item">💻 This PC</div>
                <div class="folder-item">📁 Desktop</div>
                <div class="folder-item">📁 Documents</div>
                <div class="folder-item">📁 Downloads</div>
            </div>
            <div class="explorer-main">
                <h3 style="margin-bottom: 20px;">Devices and drives</h3>
                <div class="file-item">💿 <strong>Local Disk (C:)</strong><br><small>237 GB free of 476 GB</small></div>
                <div class="file-item">💿 <strong>Local Disk (D:)</strong><br><small>150 GB free of 500 GB</small></div>
            </div>
        </div>
    `;
}
