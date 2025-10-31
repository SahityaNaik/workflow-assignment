# AI Workflow Builder (React Flow + FastAPI + PydanticAI)

An interactive **workflow builder** that allows users to design, edit, and visualize workflows manually or generate them automatically using AI.  
This project combines a **React Flow frontend** and a **FastAPI backend** powered by **PydanticAI** and **Cohere’s LLM**.

---

## 🚀 Live Demo Links

- **Frontend (React Flow App):** [https://your-frontend-url.vercel.app](https://your-frontend-url.vercel.app)
- **Backend API (FastAPI):** [https://workflow-assignment.onrender.com](https://workflow-assignment.onrender.com)

> Both deployments are publicly accessible as required.

---

## 🧩 Features

### 🖥️ Frontend (React Flow + Tailwind)
- Drag-and-drop **workflow node types** (Start, Process, Decision, End)
- **Editable node properties:** name, description, category, color
- **Validation rules:**
  - Start node → no incoming edges
  - Decision node → max 2 outgoing edges
- **Canvas tools:** zoom, pan, mini-map
- **Export / Import:** save and load workflows as JSON
- **AI Workflow Generation:** describe a process in text → AI auto-generates the flow
- **Persistent data:** nodes/edges auto-saved in localStorage
- **Clear Canvas** button for starting fresh

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
| Backend | FastAPI, PydanticAI, Cohere API |
| Deployment | Frontend → Vercel, Backend → Render |
| Language | Python (backend), JavaScript (frontend) |

---

## ⚙️ Local Setup Instructions

Follow these steps to run both the frontend (React Flow app) and backend (FastAPI + PydanticAI) locally.

### 1. Clone the Repository
git clone https://github.com/yourusername/workflow-builder.git
cd workflow-builder

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

### Create a .env file inside backend directory
CO_API_KEY=your_cohere_api_key

### Start the FastAPI server
uvicorn main:app --reload

### Backend will be running at:
http://127.0.0.1:8000

### Test in browser or Postman
GET http://127.0.0.1:8000/
# Expected response:
{"message": "Backend is running!"}

---

## 3. Setup Frontend (React Flow App)

### Navigate to frontend directory
cd ../frontend

### Install dependencies
npm install

### (Optional) Create a .env file if your backend URL differs
REACT_APP_API_URL=http://127.0.0.1:8000

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

