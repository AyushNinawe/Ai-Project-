from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    tags = Column(JSON, default=list)
    status = Column(String, default="draft")
    nodes = Column(JSON, default=list)
    edges = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    execution_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)

class Execution(Base):
    __tablename__ = "executions"
    id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    workflow_name = Column(String, nullable=False)
    status = Column(String, default="running")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, default=0)
    triggered_by = Column(String, default="Manual")
    input_payload = Column(JSON, nullable=True)
    output_payload = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    tokens_used = Column(Integer, default=0)
    steps = Column(JSON, default=list)

class AIAgentModel(Base):
    __tablename__ = "agents"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    goal = Column(Text, nullable=False)
    backstory = Column(Text, default="")
    model = Column(String, default="gemini-3.8-flash")
    temperature = Column(Integer, default=3)
    tools = Column(JSON, default=list)
    system_instruction = Column(Text, nullable=True)
    max_iterations = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_tasks_run = Column(Integer, default=0)

class MCPToolModel(Base):
    __tablename__ = "mcp_tools"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    category = Column(String, default="compute")
    parameters_schema = Column(JSON, default=dict)
    enabled = Column(Boolean, default=True)
    type = Column(String, default="custom")
    endpoint = Column(String, nullable=True)
