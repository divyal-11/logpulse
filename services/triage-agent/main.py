"""
LogPulse Autonomous Incident Triage Agent
LangGraph StateMachine with Read-Only SQL Diagnostics & Human-in-the-Loop Review
"""
import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")

app = FastAPI(title="LogPulse Incident Triage Agent", version="0.1.0")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "triage-agent",
        "graph_ready": False
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("TRIAGE_AGENT_PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)

