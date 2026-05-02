# Windows 10 Setup Simulator

## Overview
This project is a web-based Windows 10 simulator that recreates the complete Windows installation experience and desktop environment. It uses HTML, CSS, and JavaScript for the frontend, and a Node.js/Express server for backend functionalities, primarily Discord OAuth2 integration. The simulator aims to provide a comprehensive and interactive replica of the Windows 10 user experience, including numerous applications and system features.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Backend
- **Technology**: Node.js / Express (`server.js`).
- **Purpose**: Serves static files, handles Discord OAuth2 flows, and manages session-based user storage.
- **Port**: 5000.

### Frontend
- **Technology**: Pure HTML, CSS, and JavaScript (vanilla JS, no frameworks).
- **Design**: Multi-screen Single Page Application (SPA) using visibility toggling for screen transitions.
- **UI/UX**: Replicates Windows 10 visual design, including color schemes, window aesthetics, and application layouts.

### Application Window System
- **Window Management**: Uses `createWindow(appName)` with a lazy `appFactories` pattern, meaning app constructors run only when requested. Windows are draggable, resizable (8-edge/corner handles), z-stacked, minimizable, and maximizable.
- **Application Structure**: Each application has a `create*()` function returning an HTML string.
- **Included Applications**: Over 30 applications such as Camera, QR Code Generator, Snake, Clock, Maps, Groove Music, Solitaire, Minesweeper, Voice Recorder, To-Do, Paint v2, Calculator v2, Notepad v2, Weather v2, Microsoft Edge, Chrome, WordPad, Sticky Notes, PowerShell, Control Panel, Device Manager, Registry Editor, Media Player, Teams, Xbox, Mail, Speed Test, AI Image Generator.
- **Core Features**:
    - **Save Database**: Allows saving user data, VM specs, Discord user data, geolocation, and local storage state to a server-side `storage.json` file.
    - **Auto-save**: Configurable 5-second interval auto-saving with status indicators.
    - **Discord Integration**: Full Discord UI with channels, messages, emoji picker, typing indicators, search, and OAuth2 authentication.
    - **Camera App**: Utilizes `navigator.mediaDevices.getUserMedia` for photo snapping and download.
    - **QR Code Generator**: Integrates with `api.qrserver.com` for QR code generation.
    - **Games**: Classic Snake game, Solitaire, and Minesweeper.
    - **Productivity Tools**: Rebuilt Clock, Maps, Groove Music, Voice Recorder, and To-Do list.
    - **Desktop Interactions**: Context menus, Action Center for quick settings and notifications.
    - **Proxy Reliability**: Enhanced `/proxy?url=` endpoint for reliable fetching and rewriting of external web content, enabling browsers to load real websites.
    - **Setup Wizard**: Expanded multi-step installation wizard with various configuration options.
    - **Settings Overhaul**: Comprehensive settings panel with numerous categories and configuration options.
    - **VM Launcher**: Simulates virtual machine provisioning with selectable plans and animated boot sequence.
    - **Screen Management**: `showScreen()` function manages visibility of boot, lock, login, desktop, and setup screens.
    - **State Management**: `userData`, `openWindows`, `_discordLoggedInUser` are persisted via `localStorage`.

### VM Specifications (Simulator Internal)
- **CPU**: Intel Core i9-14900K @ 8.0 GHz (24-core)
- **RAM**: 500 GB DDR5
- **GPU**: NVIDIA RTX 4090 24 GB
- **Storage**: 100 TB Samsung 990 Pro NVMe SSD

## External Dependencies
- **Discord OAuth2**: For user authentication and profile integration.
- **Pollinations.AI**: Powers the AI Image Generator.
- **api.qrserver.com**: Used for QR code generation (proxied).
- **OpenStreetMap / Nominatim Geocoder**: Integrated into the Maps application for geographic data and search.
- **Google Fonts**: For various font styles.
- **IP-API**: For server-resolved geolocation.