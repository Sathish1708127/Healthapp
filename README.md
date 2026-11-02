# HealthAI — AI-Powered Health Triage App

A full-featured health app with AI symptom checking powered by Claude (Anthropic API).

## Features
- 🔍 AI Symptom Checker (powered by Claude API)
- 📓 Symptom Journal with trend analysis
- 👁️ Skin & Rash Analyser (CNN-based)
- 🗺️ Geo-based Outbreak Alerts (Bengaluru)
- 💓 Vitals Monitor (wearable sync)
- 💊 Treatment & Care Guide (WHO/NHS/CDC)
- 🥗 Nutrition Plan (Indian cuisine)
- 📋 Shareable Health Report
- 👨‍👩‍👧 Family Profiles
- ⚙️ Privacy & Settings

## Setup Instructions

### Prerequisites
- Node.js 16+ ([download](https://nodejs.org))
- VS Code ([download](https://code.visualstudio.com))
- Anthropic API key ([get one](https://console.anthropic.com))

### Step 1 — Open in VS Code
1. Unzip the downloaded folder
2. Open VS Code
3. File → Open Folder → select the `healthai` folder

### Step 2 — Add your API key
1. Open the `.env` file in VS Code
2. Replace `your_api_key_here` with your actual Anthropic API key:
   ```
   REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
   ```

### Step 3 — Install dependencies
Open the VS Code terminal (Ctrl+` or View → Terminal) and run:
```bash
npm install
```
Wait for it to finish (may take 1-2 minutes).

### Step 4 — Start the app
```bash
npm start
```
The app will open automatically at http://localhost:3000

## Getting an Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" → "Create Key"
4. Copy and paste it into your `.env` file

## Project Structure
```
healthai/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── UI.jsx           # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── SymptomChecker.jsx  # AI chat (Claude API)
│   │   └── Pages.jsx        # All other pages
│   ├── App.jsx              # Root component + routing
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── .env                     # API key (DO NOT commit to git)
├── .gitignore
└── package.json
```

## Customisation
- **Change location**: Search for "Bengaluru" in the code to update location-specific content
- **Add real wearable data**: Update `VitalsMonitor` in `Pages.jsx` to connect to HealthKit/Google Fit APIs
- **Real skin analysis**: Replace `simulateAnalysis` in `SkinAnalyser` with a real CNN API call
- **Real outbreak data**: Connect `OutbreakAlerts` to WHO/IDSP/CDC APIs

## ⚠️ Medical Disclaimer
This app is a **triage and guidance tool only**. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.
