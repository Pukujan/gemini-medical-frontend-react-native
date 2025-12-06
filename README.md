# Gemini Medical Record Organizer  
React Native • Web • Firebase • Gemini AI Backend

A cross-platform medical record organizer that processes messy, unstructured clinical notes and converts them into structured JSON + Markdown summaries using a secure backend Gemini proxy.

The app supports:
- Android (EAS Build)
- iOS (EAS Build)
- Web (Vercel Hosting)
- Real-time Firestore storage
- AI processing routed through backend for safety

---

## 🚀 Features

### 🧠 AI-Powered Record Extraction
Extracts:
- Patient Name  
- DOB  
- Provider  
- Visit Date  
- Diagnoses  
- Medications  
- Summary  

### 📝 Markdown Summary Generator  
Generates professionally formatted medical summaries.

### 🔄 Firestore Integration  
Realtime sync with Firebase.

### ✨ Sample Data Generator  
Generated using backend:
```
POST /api/sample-note
```

### 🔐 Secure Architecture  
- No API key stored in frontend  
- Backend holds GEMINI_API_KEY securely  

---

## 📁 Project Structure

### Frontend (Expo)
```
gemini-medical-rn/
  app/
  components/medical-organizer/
    DetailModal.tsx
    InputPanel.tsx
    RecordCard.tsx
    RecordsDisplay.tsx
  constants/
    firebaseConfig.ts
    gemini.ts
    types.ts
  app.config.js
  .env
  package.json
```

### Backend (Node + Express)
```
gemini-medical-backend/
  server.js
  package.json
  .env
```

---

## 🔐 Environment Variables

### Frontend .env
```
BACKEND_URL=https://gemini-medical-backend-production.up.railway.app
```

### Backend .env
```
PORT=4000
GEMINI_API_KEY=your_google_gemini_key_here
```

---

## 🛠 Backend Setup

```bash
cd gemini-medical-backend
npm install
npm start
```

Backend endpoints:
```
POST /api/format-record   → structured JSON response  
POST /api/sample-note     → messy clinical sample note  
```

---

## ▶️ Running the App

```bash
cd gemini-medical-rn
npm install
npx expo start
```

- Press **w** → open web  
- Scan QR → open mobile  

---

## 🌐 Web Deployment (Vercel)

1. Push repo to GitHub  
2. Import into Vercel  
3. Build Command:
```
npx expo export --platform web
```
4. Output Directory:
```
dist
```
5. Env Variable:
```
BACKEND_URL=your Railway backend URL
```

Deployment result:
```
https://yourproject.vercel.app
```

---

## 📱 Android Build (EAS)

```bash
eas login
eas build --platform android
```

Produces:
- APK for direct install  
- AAB for Play Store  

---

## 🧪 Testing Backend Manually

Generate messy clinical note:
```bash
curl -X POST https://gemini-medical-backend-production.up.railway.app/api/sample-note
```

Format record:
```bash
curl -X POST https://gemini-medical-backend-production.up.railway.app/api/format-record 
  -H "Content-Type: application/json" 
  -d '{"rawInput":"messy text"}'
```

---

## 🐞 Troubleshooting

### Expo cannot reach backend:
```
Check BACKEND_URL in .env  
npx expo start --clear  
```

### Web build failing:
```
Ensure BACKEND_URL is configured on Vercel  
```

### CORS errors:
Ensure backend includes:
```js
app.use(cors());
```

---

## 📜 License
MIT License

---

## 👤 Author
Pujan Bajracharya  
AI Processing powered by Google Gemini (via backend proxy)
