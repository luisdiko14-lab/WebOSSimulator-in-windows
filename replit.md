# Windows 10 Setup Simulator

## Overview

This is a web-based Windows 10 simulator that recreates the complete Windows installation experience and desktop environment using HTML, CSS, and JavaScript with a Node.js/Express backend for Discord OAuth2.

## Recent Fixes & Features
- **Real Tabbed Browser**: Microsoft Edge and Chrome both have working tabs, bookmarks bar, history nav, new tab page with tiles, and actual iframe loading of real websites
- **30+ Apps**: WordPad (rich text + formatting), Sticky Notes, PowerShell, Control Panel, Device Manager, Registry Editor, Media Player, Teams (chat), Xbox, Mail, Speed Test, and all previous apps
- **CMD Expanded**: 30+ commands including ipconfig /all, tracert, netstat, tasklist, taskkill, systeminfo, shutdown, sfc, reg, net, cd, mkdir, tree, attrib, set, and more
- **Window Resize**: All windows have drag handles on all 8 edges/corners for resizing
- **Pinned Taskbar**: 8 pinned app icons always visible in the taskbar
- **Discord OAuth2**: Full Discord integration with client ID/secret, state parameter, and real guild data

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
