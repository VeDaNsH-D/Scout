# FastAPI Backend Routes for Extension Integration
# Add these routes to your Backend/index.js or create a new file: Backend/routes/extension.routes.js

"""
IMPORTANT: Add these FastAPI endpoints to your Backend/main.py or similar FastAPI app

This file provides example implementations for the extension to work properly.
Copy and paste these into your main FastAPI application.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter(prefix="/api", tags=["extension"])

# ============================================
# Data Models
# ============================================

class LeadEnrollment(BaseModel):
    name: str
    role: str
    company: str
    email: str = ""
    profileUrl: str
    outreachPath: str = "technical"
    source: str = "extension"
    recentPost: str = ""
    timestamp: str

class InsightRequest(BaseModel):
    name: str
    role: str
    company: str
    recentPost: str = ""

# ============================================
# Routes
# ============================================

@router.post("/enroll-lead")
async def enroll_lead(lead: LeadEnrollment):
    """
    Enrolls a lead captured from the extension into the workflow system.
    
    Flow:
    1. Save lead to database
    2. Determine workflow based on outreachPath
    3. Trigger workflow engine
    4. Return workflow ID to extension
    """
    try:
        # Validation
        if not lead.name or not lead.company:
            raise HTTPException(status_code=400, detail="Name and company are required")
        
        # TODO: Implement your database save logic
        # Example (MongoDB):
        # await db.leads.insert_one({
        #     "name": lead.name,
        #     "role": lead.role,
        #     "company": lead.company,
        #     "email": lead.email,
        #     "profileUrl": lead.profileUrl,
        #     "outreachPath": lead.outreachPath,
        #     "source": lead.source,
        #     "createdAt": datetime.now(),
        #     "status": "pending"
        # })
        
        # TODO: Trigger workflow engine based on outreachPath
        # Example:
        # workflow_id = await trigger_workflow({
        #     "lead_name": lead.name,
        #     "workflow_type": lead.outreachPath,
        #     "lead_data": lead.dict()
        # })
        
        # Mock response (replace with actual)
        workflow_id = f"wf_{datetime.now().timestamp()}"
        
        return {
            "success": True,
            "message": f"Lead {lead.name} enrolled successfully",
            "leadId": f"lead_{datetime.now().timestamp()}",
            "workflowId": workflow_id,
            "outreachPath": lead.outreachPath,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enrolling lead: {str(e)}")

@router.post("/generate-insight")
async def generate_insight(request: InsightRequest):
    """
    Generates AI-powered insights about a lead using your ML model.
    
    This endpoint should:
    1. Analyze the lead's role and company
    2. Call your lead scoring ML model
    3. Determine optimal outreach path
    4. Generate personalized messaging insights
    """
    try:
        if not request.name or not request.role:
            raise HTTPException(status_code=400, detail="Name and role are required")
        
        # TODO: Call your ML model here
        # Example:
        # lead_score = await ml_model.score_lead({
        #     "name": request.name,
        #     "role": request.role,
        #     "company": request.company
        # })
        
        # Determine recommended path based on role keywords
        recommended_path = determine_outreach_path(request.role, request.company)
        
        # Generate insight based on recent post
        insight = generate_personalized_insight(
            request.name,
            request.role,
            request.company,
            request.recentPost
        )
        
        return {
            "success": True,
            "insight": insight,
            "recommendedPath": recommended_path,
            "confidence": 0.85,
            "reasoning": f"Based on {request.role} role at {request.company}, {recommended_path} approach is optimal"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insight: {str(e)}")

@router.get("/activity-log")
async def get_activity_log(limit: int = 50):
    """
    Returns recent lead enrollment activity for analytics.
    """
    try:
        # TODO: Query your database for recent enrollments
        # Example:
        # logs = await db.leads.find().sort("createdAt", -1).limit(limit).to_list(limit)
        
        return {
            "success": True,
            "logs": [],
            "total": 0
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching logs: {str(e)}")

# ============================================
# Helper Functions
# ============================================

def determine_outreach_path(role: str, company: str) -> str:
    """
    Determines optimal outreach path based on lead role.
    """
    role_lower = role.lower()
    
    # Technical path keywords
    technical_keywords = [
        'engineer', 'architect', 'developer', 'cto', 'vp of engineering',
        'tech lead', 'devops', 'infrastructure', 'python', 'java', 'golang',
        'cloud', 'kubernetes', 'database', 'ml engineer', 'data scientist'
    ]
    
    # Business path keywords
    business_keywords = [
        'manager', 'director', 'vp', 'head of', 'product manager',
        'operations', 'finance', 'cfo', 'coo', 'vp of operations'
    ]
    
    # Executive path keywords
    executive_keywords = [
        'ceo', 'cto', 'cfo', 'coo', 'president', 'founder',
        'executive', 'chief', 'chairman'
    ]
    
    if any(keyword in role_lower for keyword in executive_keywords):
        return 'executive'
    elif any(keyword in role_lower for keyword in technical_keywords):
        return 'technical'
    elif any(keyword in role_lower for keyword in business_keywords):
        return 'business'
    else:
        return 'business'  # Default to business

def generate_personalized_insight(name: str, role: str, company: str, recent_post: str = "") -> str:
    """
    Generates a personalized insight message for the extension.
    """
    base_insight = f"I noticed you're a {role} at {company}. "
    
    if recent_post:
        return base_insight + f"Your recent post about '{recent_post[:40]}...' shows you're focused on innovation. We can help accelerate that."
    else:
        return base_insight + f"Based on your role, we recommend a technical-focused approach to discuss how we can help."

# ============================================
# Integration Instructions
# ============================================
"""
To integrate these routes into your FastAPI app:

1. If using main.py:
   from fastapi import FastAPI
   from routes.extension_routes import router
   
   app = FastAPI()
   app.include_router(router)

2. Enable CORS (for extension):
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["chrome-extension://YOUR_EXTENSION_ID"],
       allow_methods=["*"],
       allow_headers=["*"],
   )

3. Database integration:
   - Connect to MongoDB/PostgreSQL
   - Create 'leads' collection/table
   - Add indexed fields: name, company, email, createdAt

4. ML Model Integration:
   - Load your lead_scoring model in generate_insight
   - Ensure model inference is fast (<1 second)

5. Workflow Engine Integration:
   - Call your workflow engine after enroll_lead
   - Pass lead data and outreachPath
   - Return workflow_id to extension
"""
