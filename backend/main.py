from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from dotenv import load_dotenv
import os
import re   

# Setup FastAPI
 
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env 
load_dotenv()

# Check API key
if "CO_API_KEY" not in os.environ:
    raise RuntimeError("CO_API_KEY not found. Please set it in your environment or .env file.")

# Define Request Model
 
class WorkflowRequest(BaseModel):
    description: str


# Create Agent using Cohere

agent = Agent(model="cohere:command-a-03-2025")

@agent.tool
def generate_workflow_from_description(ctx: RunContext, description: str):
    """Extracts steps and connections from plain text descriptions."""
    desc = description.lower()
    nodes = [{"id": "start", "type": "start", "data": {"label": "Start"}}]
    edges = []

    if "review" in desc or "approve" in desc:
        nodes.append({"id": "review", "type": "process", "data": {"label": "Review"}})
        edges.append({"source": "start", "target": "review"})

    if "decision" in desc or "yes" in desc or "no" in desc:
        nodes.append({"id": "decision", "type": "decision", "data": {"label": "Decision"}})
        edges.append({"source": nodes[-2]["id"], "target": "decision"})

    nodes.append({"id": "end", "type": "end", "data": {"label": "End"}})
    if not any(e["target"] == "end" for e in edges):
        edges.append({"source": nodes[-2]["id"], "target": "end"})

    return {"nodes": nodes, "edges": edges}

# Routes

@app.get("/")
def root():
    return {"message": "Backend is running!"}


@app.post("/generate_workflow")
async def generate_workflow(request: WorkflowRequest):
    """Run PydanticAI agent to generate a workflow."""
    prompt = f"""
    You are a workflow designer AI.
    Based on the following description, create a logical workflow (steps, decisions, and connections):

    Description: {request.description}

    Respond as JSON with keys: nodes and edges.
    """
    try:
        result = await agent.run(prompt)

        workflow_json = None

        # Access message history
        if result._state and result._state.message_history:
            for msg in result._state.message_history:
                if msg.parts:
                    for part in msg.parts:
                        if part.part_kind == "tool-return" and part.content:
                            workflow_json = part.content
                            break
                if workflow_json:
                    break

        # fallback: use output text
        if not workflow_json:
            workflow_json = result.output_text if hasattr(result, "output_text") else result.output

        # Clean up ```json ... ``` wrapper if present
        if isinstance(workflow_json, str):
            workflow_json = re.sub(r"^```json\s*|\s*```$", "", workflow_json.strip())

        return {"workflow": workflow_json}

    except Exception as e:
        return {"error": str(e)}