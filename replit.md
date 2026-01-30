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