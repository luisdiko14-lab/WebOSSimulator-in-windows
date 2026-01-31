# Windows 10 Setup Simulator

## Overview

This is a web-based Windows 10 simulator that recreates the complete Windows installation experience and desktop environment using pure HTML, CSS, and JavaScript. The project simulates the entire Windows 10 user journey from initial setup (region selection, keyboard layout, WiFi connection, drive selection, account creation) through to a functional desktop with working applications like Calculator, Notepad, File Explorer, and Settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend-Only Architecture
- **Technology Stack**: Pure HTML, CSS, and JavaScript with no frameworks
- **Rationale**: Keeps the project lightweight and easily deployable as static files
- **Design Pattern**: Multi-screen single-page application using visibility toggling

### Screen Management System
- Multiple "screen" divs represent different states (boot, lock, login, desktop, setup steps)
- Screens are toggled via CSS classes (`.active`) controlled by JavaScript
- Setup wizard uses a step-based navigation system stored in `setupSteps` array

### State Management
- Global JavaScript variables track application state (`userData`, `openWindows`, `calculatorDisplay`, etc.)
- User data object stores: username, password, email, account type, selected drive, WiFi network
- Window management tracks z-index ordering and open application windows

### Build System
- Simple Node.js build script (`build.js`) that copies files to a `dist` folder
- Excludes development files (node_modules, .git, package files)
- No transpilation or bundling - files are served as-is

### File Structure
- `index.html` - Main desktop and login experience
- `setup_1.html`, `setup_2.html` - Windows installation wizard steps
- `styles.css` - All styling including Windows 10 visual design
- `script.js` - Core application logic and interactivity
- Utility pages: `updater.html`, `windows_defender.html`, `Select_vm.html`

## Features

### Desktop Experience
- 8 desktop shortcuts (This PC, Recycle Bin, Edge, Chrome Setup, Documents, Notes.txt, Terminal, Microsoft Store)
- Desktop icon hover effects and animations
- Right-click context menu with Refresh, New Folder, Personalize options
- Smooth window open/close animations

### System Tray
- WiFi menu with network list, toggle switch, and connection simulation
- Volume menu with slider control
- Battery popup showing charge status and estimated time
- Action Center with quick toggles (Night light, Wi-Fi, Bluetooth, Location, Airplane mode, Battery saver, Game mode, Focus assist)
- Brightness slider that actually dims the screen
- Night light mode with warm orange overlay

### Applications
- Calculator, Notepad, File Explorer, Settings, Task Manager
- Edge browser, Command Prompt (with working commands)
- Paint (drawing app), Weather, Snipping Tool
- Photos, Calendar, Clock, Maps, Microsoft Store
- Network & Internet settings
- Google Chrome installer with download simulation and functional browser

### Boot Sequence
- Multi-stage boot: Boot screen → Lock screen → Login → "Logging in" → "Getting ready" → Desktop
- All stages have spinning circle animations
- Sound effects for startup, error, notification, shutdown

### URL Parameters
- Deep linking support (?opened=appname) to auto-open apps
- URL updates when apps are opened

### Notifications
- Dynamic notifications that appear randomly
- Click to dismiss notifications
- Clear all button

## External Dependencies

### NPM Packages (package.json)
- `discord.js` - Discord bot library (appears unused in the simulator itself)
- `web` - Generic web utilities package
- `windows` - Windows-related utilities package

### No Backend Required
- Project runs entirely client-side
- No database or server-side processing
- No external API integrations for core functionality

### Deployment
- Can be served as static files from any web server
- Build output goes to `/dist` directory
- No environment variables or configuration required