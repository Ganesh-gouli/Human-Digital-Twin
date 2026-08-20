<div align="center">

# 🧬 Human Digital Twin — AI & Quantum Health Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Engine-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Studio-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision_AI-0097A7?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <b>A next-generation, AI-driven, 3D Interactive Human Digital Twin and Quantum Bio-Analysis Ecosystem for personalized health monitoring, medical imaging diagnostics, and predictive disease analytics.</b>
</p>

---

</div>

## 🌟 Key Features

### 🧍 3D Interactive Human Digital Twin
- **Dynamic 3D Anatomy Rendering**: Interactive rendering of bones, muscles, nervous system, and internal organs using **Three.js** and **React Three Fiber**.
- **Organ-Level Inspection**: Clickable 3D anatomical structures with real-time health score overlays, bio-signal simulations, and anatomical landmark highlights.

### 🧠 Medical Imaging & AI Diagnostics
- **Brain MRI Analyzer**: Detects pituitary tumors, gliomas, and meningiomas from MRI scans using Google Gemini Vision AI.
- **Skin Lesion & Cancer Detection**: Image-based dermatological analysis for early anomaly identification.
- **Disease Analytics Suites**:
  - 🫀 **Heart Disease Risk Analyzer**
  - 🩸 **Diabetes Prediction Engine**
  - 🩺 **Kidney Disease Diagnostic Suite**
  - 🎗️ **Multi-Organ Cancer Detection**

### ⚡ QuantumPulse Bio-Analytics Engine
- **Hybrid Quantum-Inspired Simulator**: High-dimensional bio-metric tensor calculation for personal health trajectory prediction.
- **Multi-Variate Risk Modeling**: Simulates cellular and metabolic markers against environmental and physiological strain vectors.

### 💊 3D Drug Impact & Pharmacological Heatmaps
- **Interactive Organ Impact Heatmaps**: Visualizes organ absorption rates, metabolic toxicity profiles, and drug interactions directly on the 3D digital twin.

### 🧘 MediaPipe Vision AI (Pose & Form Tracking)
- **Yoga Pose Detection**: Real-time skeletal tracking for posture alignment, joint angles, and pose correction via webcam.
- **Exercise Form Monitoring**: Live tracking of rep counts, movement ranges, and biomechanical feedback during workouts.

### 📊 Health Intelligence & Emergency Services
- **AI Medical Report Analyzer**: Extracts data from lab reports and PDFs to deliver actionable medical summaries.
- **Location Tracker & SOS Emergency**: Real-time Leaflet map integration locating nearby hospital facilities, emergency care centers, and dispatch alerts.
- **Smart Diet & Calorie Hub**: Tailored meal plans, USDA food data integration, and daily fitness tracking.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **3D Rendering & Animation** | Three.js, `@react-three/fiber`, `@react-three/drei`, GSAP, Framer Motion |
| **AI & Computer Vision** | Google Gemini AI (`@google/genai`), MediaPipe Hands & Pose |
| **Geospatial & Mapping** | Leaflet, `react-leaflet`, Turf.js |
| **Styling & Icons** | Tailwind CSS, Lucide React, Glassmorphism UI |
| **Backend & Services** | Express.js, Python (Quantum Hybrid Engine), SendGrid API |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- *(Optional)* **Python 3.10+** for running the optional local Python backend engine.

### 1. Clone the Repository

```bash
git clone https://github.com/Ganesh-gouli/Human-Digital-Twin.git
cd Human-Digital-Twin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and set your API keys:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Backend Server Port
PORT=5000
```

### 4. Run the Application

Start the local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```
Human-Digital-Twin/
├── assets/                  # Training datasets, medical imagery & 3D models
├── components/              # Reusable UI components & 3D canvases
│   ├── MagicBento/          # Interactive bento grid UI elements
│   ├── Chatbot.tsx          # AI Medical Chatbot component
│   └── StoryScene.tsx       # 3D Spline / Canvas viewports
├── data/                    # Anatomical landmark maps & health datasets
├── features/                # Core application features & modules
│   ├── MedicalImaging.tsx   # MRI & CT scan AI diagnostic interface
│   ├── MedicalModel3D.tsx   # 3D Interactive Human Anatomy Viewer
│   ├── QuantumPulse.tsx     # Quantum-inspired bio-tensor analytics
│   ├── DrugImpactVisualizer # 3D Drug impact heatmaps
│   ├── YogaPoseDetector.tsx # MediaPipe live pose tracking
│   └── ...                  # Disease modules (Heart, Kidney, Diabetes, Skin)
├── public/                  # 3D .glb / .obj anatomical models
├── services/                # Gemini AI service, USDA API & user data helpers
├── types.ts                 # TypeScript type definitions & interfaces
├── App.tsx                  # Root application router & context provider
└── vite.config.ts           # Vite build configuration
```

---

## 🔒 Security & Privacy

- **Local Processing**: Video feeds processed via MediaPipe run entirely inside your browser client; no video frames are transmitted to external servers.
- **API Protection**: Ensure your `.env.local` file is excluded from version control (already configured in `.gitignore`).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <b>Ganesh Gouli</b> for Hackathons & Future Healthcare Innovation</sub>
</div>
