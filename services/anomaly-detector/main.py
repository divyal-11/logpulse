"""
LogPulse Machine Learning Anomaly Detection Service
Isolation Forest on LogHub Event Sequences
"""
import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")

app = FastAPI(title="LogPulse Anomaly Detector", version="0.1.0")

class AnomalyScoreRequest(BaseModel):
    session_id: str
    event_templates: list[str]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "anomaly-detector",
        "model_loaded": False
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ANOMALY_DETECTOR_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

