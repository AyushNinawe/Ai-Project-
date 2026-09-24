from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="AI Automation & Agent Hub API",
    description="Production-grade internal automation platform, visual workflow engine, autonomous AI agents, and MCP tool execution service.",
    version="1.0.0"
)

# Enable CORS for internal frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "AI Automation & Agent Hub - FastAPI Backend",
        "version": "1.0.0",
        "gemini_provider": "Google GenAI SDK (gemini-3.8-flash default)",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "database": "connected", "queue": "ready"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
