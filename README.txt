# Hermes – LinkedIn Message Importer

Hermes is a Chrome extension with an optional local interface designed to help users view, organize, and work with LinkedIn conversations more efficiently. It does not automate user actions and does not transfer data outside the device.

The tool is intended for users who manage a high volume of messages on LinkedIn, such as recruiters, consultants, and job seekers, and who require a clearer overview of their interactions.

---

## Features

### Conversation Import
- Import the LinkedIn conversation list (sidebar)
- Import the currently open conversation thread
- View imported content even when LinkedIn is not open
- Data processed only from content already visible to the user

### Organization and Classification
- Apply custom tags to conversations
- Filter based on user-defined priority levels
- Track which conversations require a reply

### Smart Reply Templates
- Predefined professional message templates
- Available in multiple languages (Italian, English, Spanish)
- Copies text to clipboard without automated sending

### Local-Only Data Storage
- No information is sent to external servers
- All processed data remains on the user’s device
- Local storage or extension storage is used depending on configuration

### Privacy and Non-Automation
- No automated actions are performed on LinkedIn
- The extension does not modify LinkedIn pages or interact on behalf of the user
- No actions such as sending messages, clicking, or scrolling are performed automatically

---

## Technical Overview

### Chrome Extension (Manifest V3)
- Uses `scripting`, `tabs`, `activeTab` and `clipboardWrite` for limited user-triggered operations
- Content scripts restricted to `https://www.linkedin.com/*`
- Reads only data visible on the page at the time of user interaction
- Uses extension storage for local data retention

### Optional Local Backend and Interface
- Java 21
- Spring Boot
- Spring Data JPA with Specifications
- REST architecture
- Maven build system

### Optional Frontend Interface
- React
- TypeScript
- Custom CSS styles
- Internationalization support

---

## Purpose

LinkedIn does not provide tools for structured organization of messages. Hermes is focused on improving message management by allowing:

- Clear separation of conversations by level of importance
- Identification of contacts awaiting a response
- Faster and more consistent replies through predefined templates
- A more structured overview of ongoing communication, similar to basic CRM workflow management

---

## Project Status

- MVP implemented and working
- Privacy policy and permissions adapted to platform requirements
- Under review for publication on the Chrome Web Store
- Planned future improvements include:
  - Export of conversation data (CSV and JSON formats)
  - Extended filtering and saved lists
  - Enhanced optional desktop interface

---

## Legal Notice

Hermes is an independent tool. It is not affiliated with, endorsed, or sponsored by LinkedIn Corporation.

The tool does not automate interactions, modify LinkedIn behavior, or transfer user data outside the device. All data is entirely stored and processed locally.




##  Autor

Developed from **Stefano Paolucci** – Java / Spring / Full-Stack Developer.

- LinkedIn: https://www.linkedin.com/in/-stefanopaolucci-/
- Email: Stefano.paolucci91@gmail.com
