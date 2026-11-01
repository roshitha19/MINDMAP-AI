# MINDMAP AI — PERSONAL KNOWLEDGE UNIVERSE

> *"Your knowledge has a shape. Discover it."*

MINDMAP AI is a major academic capstone project for 3rd-year B.Tech Computer Science and Engineering students. It is a full-stack MERN application that transforms scattered lecture notes, PDFs, and curriculum syllabi into an interactive, interconnected knowledge universe using **React Flow**, **AI-assisted concept extraction**, **SuperMemo SM-2 spaced repetition**, and **Recharts telemetry**.

---

## 🌟 Key Architectural Features

1. **Futuristic Cosmic Intelligence Design System**:
   - Deep midnight background (`#030712`) with subtle violet, indigo, and cyan gradients.
   - Glassmorphic panels, glowing interactive knowledge nodes, and responsive layout across desktop, tablets, and mobile.

2. **Core Feature: My Universe (React Flow Canvas)**:
   - Interactive knowledge graphs visualizing atomic concepts and directed relationships.
   - Distinct glowing styles and color schemes for:
     - 👑 **Main Topic** (Violet)
     - 📚 **Subtopic** (Indigo)
     - 📖 **Definition** (Cyan)
     - $\sum$ **Formula** (Emerald)
     - 💡 **Example** (Amber)
     - 🔀 **Prerequisite** (Rose dashed)
     - ✨ **Advanced Concept** (Fuchsia)
   - Real-time dragging, zoom, pan, search, category filter pills, MiniMap, and controls.
   - Interactive Slide-Out Side Inspection Panel with concept definitions, formulas, examples, mastery gauge, and shortcuts.

3. **AI Knowledge Graph Generator**:
   - File dropzone supporting PDF, DOCX, TXT, and Markdown notes.
   - Backend parsing (`pdf-parse`, `mammoth`) and AI concept extraction.
   - Dual Engine Architecture: Configurable live **Google Gemini API** (`GEMINI_API_KEY`) or an automatic local **Cosmic NLP Rule Engine** with clear `isDemoMode: true` badging.
   - Pre-save candidate universe preview with ability to edit definitions and remove nodes.

4. **AI Personal Tutor**:
   - Multi-turn conversational learning assistant with persistent conversation history.
   - Context-aware responses taking into account the active subject and concept.
   - Quick prompt shortcuts: "Explain Simply (ELI5)", "Give Practical Example", "Compare with Alternatives", "Test My Understanding".

5. **AI Quiz Center & Knowledge Mastery Tracker**:
   - Generates multiple-choice questions from selected concepts with configurable difficulty and timers.
   - Automatic grading with detailed question reviews and comprehensive explanations.
   - **Algorithmic Mastery Score Formula**:
     $$\text{Mastery} = (\text{QuizAccuracy} \times 0.50) + (\text{RecencyScore} \times 0.30) + (\text{PracticeVolume} \times 0.20)$$
   - Categorizes concepts into Strong ($\ge 80\%$), Moderate ($50-79\%$), and Weak ($< 50\%$).

6. **Smart Revision Center (SuperMemo SM-2)**:
   - Implements the mathematical SM-2 spaced repetition algorithm.
   - 3D interactive flashcards with quality rating buttons:
     - **Again** (Quality 0, resets repetitions, 1 day)
     - **Difficult** (Quality 3, 2 days)
     - **Good** (Quality 4, multiplies interval by Ease Factor)
     - **Easy** (Quality 5, multiplies interval by $1.2 \times \text{Ease Factor}$)
   - Daily queue counter, weak concept detection, and overdue revision alerts.

7. **Smart Learning Path Generator**:
   - Career roadmaps (Full Stack Web Engineering, Machine Learning, Data Structures & Algorithms, etc.).
   - Prerequisite topological sorting algorithm determining optimal learning sequences.
   - Interactive milestone checklist and percentage tracking.

8. **Resource Library**:
   - Secure file storage with Multer, file type validation, and preview modal.
   - Markdown note editor and external resource links.

9. **Analytics Dashboard (Recharts)**:
   - Visual telemetry for Cumulative Knowledge Growth, Weekly Learning Minutes, Subject Proficiency Radar, and Strongest vs Weakest Concepts.

10. **Gamification & Achievements**:
    - XP points, level progression (e.g. *Cosmic Scholar Tier IV*), daily learning streaks, and verifiable achievement badges (*First Galaxy*, *Brain Builder*, *Cosmic Momentum*, *Quiz Prodigy*).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, `@xyflow/react` (React Flow), `recharts`, `lucide-react`, `framer-motion`, `axios`, `canvas-confetti`.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, `pdf-parse`, `mammoth`, `nodemailer`, `helmet`.
- **AI Engine**: Google Gemini API (`@google/genai` / REST) with local Cosmic NLP Rule Engine fallback.

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js**: v18.0.0 or higher.
2. **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string).

### Installation

From the project root directory:

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
```

### Database Seeding (Pre-loaded Academic B.Tech Coursework)

To populate the database with complete sample subjects (*Data Structures & Algorithms*, *Operating Systems*, *Machine Learning Fundamentals*), interactive React Flow graphs, flashcards, quizzes, and analytics:

```bash
cd server
npm run seed
```

This creates the default demo account:
- **Email**: `demo@mindmap.ai`
- **Password**: `Mindmap@2026`

### Running the Application

In terminal 1 (Backend API):
```bash
cd server
npm start
# Server will start on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Client will start on http://localhost:3000
```

Or run concurrently from the root directory:
```bash
npm run dev
```

---

## 🔒 Environment Configuration

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mindmap_ai
JWT_SECRET=cosmic_mindmap_jwt_secret_key_2026_super_secure_academic_token
JWT_EXPIRE=30d

# (Optional) Remote AI Service:
# Provide a Google Gemini API Key or leave empty to use the local Cosmic NLP Engine
GEMINI_API_KEY=
```

---

## 📂 Project Structure

```
mindmap-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CosmicNode.jsx        # Custom React Flow glowing node
│   │   │   └── NodeDetailPanel.jsx   # Slide-out concept inspector
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # JWT auth & session management
│   │   │   └── NotificationContext.jsx # Floating toast alerts
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx         # Collapsible sidebar & topbar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # SaaS marketing homepage
│   │   │   ├── LoginPage.jsx         # Authentication & 1-click demo
│   │   │   ├── RegisterPage.jsx      # Password meter & signup
│   │   │   ├── VerifyOtpPage.jsx     # Email OTP verification
│   │   │   ├── DashboardPage.jsx     # Telemetry & quick actions
│   │   │   ├── UniversePage.jsx      # React Flow interactive graph
│   │   │   ├── SubjectsPage.jsx      # Coursework & semester manager
│   │   │   ├── GraphGeneratorPage.jsx# AI PDF/text extraction
│   │   │   ├── AITutorPage.jsx       # Conversational AI assistant
│   │   │   ├── QuizCenterPage.jsx    # Timed MCQs & instant feedback
│   │   │   ├── RevisionCenterPage.jsx# SM-2 3D flashcards
│   │   │   ├── LearningPathsPage.jsx # Prerequisite milestone DAG
│   │   │   ├── ResourceLibraryPage.jsx# Document vault & notes
│   │   │   ├── AnalyticsPage.jsx     # Recharts radar & growth charts
│   │   │   ├── AchievementsPage.jsx  # Gamified badges & XP
│   │   │   └── ProfileSettingsPage.jsx # Preferences & avatars
│   │   ├── services/
│   │   │   └── api.js                # Axios client with bearer tokens
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── config/
│   │   └── db.js                     # Mongoose connection
│   ├── controllers/                  # 12 REST API controllers
│   ├── middleware/                   # JWT auth, Multer upload, errors
│   ├── models/                       # 15 Mongoose schemas
│   ├── routes/                       # Express router modules
│   ├── services/
│   │   ├── aiService.js              # Gemini API + Cosmic NLP engine
│   │   ├── spacedRepetitionService.js# SuperMemo SM-2 implementation
│   │   ├── masteryService.js         # Weighted mastery calculation
│   │   └── pathService.js            # Topological sorting DAG
│   ├── utils/
│   │   └── seeder.js                 # Academic demo seeder
│   ├── uploads/                      # Uploaded study documents
│   ├── server.js                     # Express entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
├── README.md
└── package.json
```

---

## 🎓 Academic Presentation Information

- **Degree**: Bachelor of Technology (B.Tech) in Computer Science & Engineering
- **Project Title**: MINDMAP AI — PERSONAL KNOWLEDGE UNIVERSE
- **Demo Account**: `demo@mindmap.ai` / `Mindmap@2026`
- **Verification**: Fully functioning REST backend and compiled Vite frontend with persistent MongoDB storage.
