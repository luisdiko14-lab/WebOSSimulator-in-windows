# Windows 10 Setup Simulator

An interactive web-based simulator that recreates the Windows 10 installation and user experience.

## Overview

This project is a fully functional Windows 10 simulator built with pure HTML, CSS, and JavaScript. It features an authentic recreation of the Windows 10 interface including setup, login, desktop environment, and working applications.

## Features

### Installation & Setup
- Windows 10 installation wizard with animated loading bars
- Multi-step setup process (region, keyboard, account creation, password setup)
- Realistic installation progress with dynamic messages

### User Management
- User account creation with username and password
- Login screen with password authentication
- Lock screen with time/date display
- Sign out, lock, restart, and shutdown functions

### Desktop Environment
- Authentic Windows 10 desktop with taskbar
- Start menu with app launcher
- System tray with clock and system icons
- Notification center
- Desktop icons (This PC, Recycle Bin)

### Working Applications
- **Calculator**: Full-featured calculator with basic operations
- **Notepad**: Simple text editor
- **File Explorer**: File and folder browsing interface
- **Settings**: System settings panel
- **Task Manager**: Real-time CPU and memory monitoring with process list
- **Microsoft Edge**: Browser simulation

### Window Management
- Draggable windows
- Minimize, maximize, and close controls
- Multiple windows can be open simultaneously
- Taskbar shows active applications

### System Functions
- Shutdown with animation
- Restart with animation
- Sign out
- Lock screen
- Real-time clock display

## Technical Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **Layout**: CSS Grid and Flexbox
- **Animations**: CSS animations and transitions
- **State Management**: JavaScript with local variables
- **Server**: Python HTTP server (development)

## Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # All JavaScript functionality
├── .gitignore          # Git ignore rules
└── replit.md           # Project documentation
```

## Recent Changes

- Initial project creation (November 21, 2025)
- Implemented complete Windows 10 UI simulation
- Fixed CSS display conflicts for proper screen rendering
- Added all core features: setup, login, desktop, apps, task manager

## Usage

The simulator runs on port 5000. Simply open the application and:

1. Click "Next" through the setup wizard
2. Select your region and keyboard layout
3. Create a user account with username and password
4. Wait for installation to complete
5. Click the lock screen to proceed to login
6. Enter your password to access the desktop
7. Explore apps, settings, and system functions

## Performance Monitoring

The Task Manager simulates web-based resource monitoring:
- CPU usage updates every 2 seconds
- Memory usage simulation
- Process list shows running applications
- Performance graphs for CPU and memory

## Notes

- Password fields show browser warnings about not being in forms - these are harmless
- All data is stored in memory and resets on page refresh
- The simulator is for educational and demonstration purposes
