# AI Workflow Builder (React Flow + FastAPI + PydanticAI)

An interactive **workflow builder** that allows users to design, edit, and visualize workflows manually or generate them automatically using AI.  
This project combines a **React Flow frontend** and a **FastAPI backend** powered by **PydanticAI**.

---

## 🚀 Live Demo Links

- **Frontend (React Flow App):** [https://workflow-assignment-ekxy.vercel.app/](https://workflow-assignment-ekxy.vercel.app/)
- **Backend API (FastAPI):** [https://workflow-assignment.onrender.com](https://workflow-assignment.onrender.com)

---

## 🧩 Features

### 🖥️ Frontend (React Flow + Tailwind)
- Drag-and-drop **workflow node types** (Start, Process, Decision, End)
- **Editable node properties:** name, description, category, color
- **Canvas tools:** zoom, pan, mini-map
- **Export / Import:** save and load workflows as JSON
- **AI Workflow Generation:** describe a process in text → AI auto-generates the flow
- **Persistent data:** nodes/edges auto-saved in localStorage
- **Clear** button for starting fresh

### ⚙️ Backend (FastAPI + PydanticAI + Cohere)
- `/generate_workflow` POST endpoint:
  - Accepts a natural language workflow description
  - Returns structured workflow JSON (nodes + edges)
- Uses `pydantic-ai` to run an agent powered by **Cohere Command R+ (March 2025)** model.
- CORS enabled for cross-origin requests from frontend

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React, React Flow, Tailwind CSS, Axios |
| Backend | FastAPI, PydanticAI |
| Deployment | Frontend → Vercel, Backend → Render |
| Language | Python (backend), JavaScript (frontend) |

---

## ⚙️ Local Setup Instructions

Follow these steps to run both the frontend (React Flow app) and backend (FastAPI + PydanticAI) locally.

### 1. Clone the Repository
git clone https://github.com/SahityaNaik/workflow-assignment.git  
cd workflow-assignment

---

## 2. Setup Backend (FastAPI + PydanticAI)

### Navigate to backend directory
cd backend

### Create and activate a virtual environment
python -m venv venv
### For macOS/Linux:
source venv/bin/activate
### For Windows:
venv\Scripts\activate

### Install dependencies
pip install -r requirements.txt

### Create a .env file inside backend directory (if required)
CO_API_KEY=your_cohere_api_key

### Start the FastAPI server
uvicorn main:app --reload

### Backend will be running at:
http://127.0.0.1:8000

### Test in browser or Postman
GET http://127.0.0.1:8000/
### Expected response:
{"message": "Backend is running!"}

---

## 3. Setup Frontend (React Flow App)

### Navigate to frontend directory
cd ../frontend

### Install dependencies
npm install

### Start the frontend development server
npm start

### Frontend will be running at:
http://localhost:3000

---

## 4. Connect Frontend & Backend

### Make sure both servers are running.
### The frontend sends POST requests to:
http://127.0.0.1:8000/generate_workflow

### The backend responds with structured workflow JSON (nodes + edges).

---

