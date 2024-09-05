# 🌐 Surf Shelter: Autonomous Website Content Moderation via Machine Learning

**Surf Shelter** is a Chrome Web Extension powered by Machine Learning to autonomously moderate website content. It categorizes websites as **click-fraud**, **pay-fraud**, **malicious**, or **safe**, providing real-time protection for users as they browse the internet.

## 🚀 Overview

**Surf Shelter** uses a combination of frontend UI, background processing, and machine learning to analyze websites and provide users with instant feedback on their content safety. The extension relies on a **Frontend Client Engine** for the UI, communication with a **Data Server Engine**, and seamless data sharing between different extension components using the **Chrome Extension API**.

## 🛠 Frontend Client Engine

### Components

1. **UI Logic**:
   - Built with **React** and styled with **Tailwind CSS**, the frontend UI presents users with real-time feedback on the website's safety status (e.g., malicious, click-fraud, safe).
   - The UI dynamically updates based on the data sent from the backend engine.

2. **Data Server Engine**:
   - Part of the Frontend Client, the **Data Server Engine** acts as the bridge between the UI and the ML engine.
   - It processes data received from the **contentScript.ts**, forwards it to the ML engine, applies the latest prediction models, and returns the results to the frontend for display.

3. **Background Scripting (contentScript.ts & background.ts)**:
   - **`contentScript.ts`** extracts website data from the active page and sends it to the backend for analysis.
   - **`background.ts`** handles data processing and communication between the content script and the ML engine.

4. **Chrome Extension API**:
   - The **Chrome API** enables seamless communication between the **Frontend Client Engine**, background scripts, and active web pages.
   - The API is used to send and receive data between different extension components and interact with the browser.

### ⚡ Vite for Bundling

The project is built using **Vite**, a modern build tool that provides fast development and efficient production builds. Vite bundles the project and outputs the **`dist`** folder, which contains all the files necessary to load the extension in the browser.

- **Vite Development**: It provides a fast local development server, making it easy to see live updates during development.
- **Vite Production**: Efficiently bundles the project into optimized production code for deployment in the **Chrome Web Store**.

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** and **npm**
- **Chrome Browser** for testing the extension

### Installation

1. Clone the repository:

```bash
git clone https://github.com/KarkiAdit/surf-shelter-frontend-client-engine.git
cd surf-shelter-frontend-client-engine
