# Hermes – LinkedIn Message Organizer (Local-Only Tool)

Hermes is a Chrome extension with an optional local desktop interface designed to help users view, organize, classify, and work with LinkedIn conversations more efficiently. It does not automate user actions and does not transfer data outside the device.

The tool is intended for users managing a high volume of LinkedIn messages, such as recruiters, consultants, and job seekers who require a clearer and more structured overview of their interactions.

---

## Features

### Conversation Import
- Import the LinkedIn conversation list (sidebar)
- Import the currently open conversation thread
- Access imported content even when LinkedIn is closed
- Reads only information already visible to the user

### Organization and Classification
- Assign custom tags to conversations
- Set priority levels (High, Medium, Low)
- Track which conversations require a response
- Filter conversations based on status and metadata

### Smart Reply Templates
- Predefined professional templates
- Supported languages: Italian, English, Spanish
- Copies the selected text to clipboard without automated sending

### Local-Only Data Storage
- No information is transferred to external servers
- All processed data remains fully on the user’s device
- Data persistence through local storage or extension storage

### Privacy and Non-Automation
- No automated actions are performed on LinkedIn
- The extension does not modify LinkedIn pages or act on behalf of the user
- No automatic message sending, scrolling, clicking, or scraping operations

---

## Technical Overview

### Chrome Extension (Manifest V3)
- Requires `scripting`, `tabs`, `activeTab`, and `clipboardWrite` permissions
- Content scripts restricted to `https://www.linkedin.com/*`
- Reads and processes only visible page data
- Stores data locally through extension storage

### Local Backend API
- Java 21
- Spring Boot
- Spring Data JPA (Specifications)
- RESTful architecture
- Maven build system

### Desktop Interface (Optional)
- Electron with integrated backend launcher
- React + TypeScript frontend
- Vite build system
- Local-only interactive interface

---

## Installation & Build Instructions (From Repository)

### Requirements
- Java 21
- Maven 3+
- Node.js 18+
- npm 8+
- Google Chrome (latest version)

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-user>/hermes-linkedin-addon.git
cd hermes-linkedin-addon


Copyright (C) 2025 Stefano Paolucci

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see:
https://www.gnu.org/licenses/gpl-3.0.html

