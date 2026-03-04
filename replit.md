# Windows 10 Setup Simulator

## Overview

This is a web-based Windows 10 simulator that recreates the complete Windows installation experience and desktop environment using pure HTML, CSS, and JavaScript.

## Recent Fixes
- **Paint App**: Fixed duplicate `paintColor` declaration and improved drawing logic with `paintIsDrawing` flag.
- **Login System**: Restored login functionality, added multi-user selection support, and fixed password validation.
- **UI & Cleanup**: Updated login screen UI, removed duplicate `S.js`, and unified clock/lock-screen time logic.
- **Setup Flow**: Verified setup redirection and persistence between `setup_1.html`, `setup_2.html`, and the main desktop.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend-Only Architecture
- **Technology Stack**: Pure HTML, CSS, and JavaScript with no frameworks
- **Design Pattern**: Multi-screen single-page application using visibility toggling

### Screen Management System
- Multiple "screen" divs represent different states (boot, lock, login, desktop, setup steps)
- Screens are toggled via CSS classes (`.active`) controlled by JavaScript

### State Management
- Global JavaScript variables track application state (`userData`, `openWindows`, `calculatorDisplay`, etc.)
- User data object stores: username, password, email, account type, selected drive, WiFi network

### File Structure
- `index.html` - Main desktop and login experience
- `setup_1.html`, `setup_2.html` - Windows installation wizard steps
- `styles.css` - All styling including Windows 10 visual design
- `script.js` - Core application logic and interactivity

## Features
- Desktop Experience with shortcuts and context menu
- System Tray (WiFi, Volume, Battery, Action Center)
- Working Apps: Calculator, Notepad, File Explorer, Settings, Task Manager, Edge, Paint, etc.
- Security Simulations: Ransomware and BSOD for educational purposes
- Persistent Data: Users and settings saved in `localStorage`
