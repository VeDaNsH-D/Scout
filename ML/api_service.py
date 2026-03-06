"""
ML API Service
FastAPI service exposing all ML endpoints for the outreach platform.
"""

import os
import json
import joblib
import pandas as pd
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="AuraReach ML API",
    description="ML services for lead scoring, insights, send-time optimization, and workflow generation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# MODELS AND FEATURE COLUMNS LOADING
# =========================================================

ML_DIR = os.path.dirname(os.path.abspath(__file__))

# Lead Scoring Model
lead_model = None
lead_feature_columns = None

# Send Time Model
send_time_model = None
send_time_feature_columns = None

def load_models():
    global lead_model, lead_feature_columns, send_time_model, send_time_feature_columns
    
    try:
        lead_model = joblib.load(os.path.join(ML_DIR, "lead_scoring_model.pkl"))
        lead_feature_columns = joblib.load(os.path.join(ML_DIR, "feature_columns.pkl"))
        print("[ML API] Lead scoring model loaded")
    except Exception as e:
        print(f"[ML API] Warning: Could not load lead scoring model: {e}")
    
    try:
        send_time_model = joblib.load(os.path.join(ML_DIR, "send_time_model.pkl"))
        send_time_feature_columns = joblib.load(os.path.join(ML_DIR, "send_time_feature_columns.pkl"))
        print("[ML API] Send time model loaded")
    except Exception as e:
        print(f"[ML API] Warning: Could not load send time model: {e}")

load_models()

# =========================================================
# REQUEST/RESPONSE MODELS
# =========================================================

class LeadFeatures(BaseModel):
    role: str = "Unknown"
    industry: str = "Unknown"
    company_size: str = "medium"
    lead_source: str = "Website"
    company_name: str = "Unknown"
    timezone_region: Optional[str] = "US"
    past_open_rate: Optional[float] = 0.5
    past_reply_rate: Optional[float] = 0.2

class LeadScoreResponse(BaseModel):
    lead_score: float

class InsightsResponse(BaseModel):
    insights: list[str]

class SendTimeResponse(BaseModel):
    best_send_day: str
    best_send_hour: int

class WorkflowStep(BaseModel):
    step_number: int
    action: str
    email_type: Optional[str] = None
    send_day: Optional[str] = None
    send_hour: Optional[int] = None
    delay_days: Optional[int] = None
    condition: Optional[str] = None

class WorkflowResponse(BaseModel):
    workflow_name: str
    steps: list[WorkflowStep]

class AnalyzeLeadRequest(BaseModel):
    lead_features: LeadFeatures

class AnalyzeLeadResponse(BaseModel):
    lead_score: float
    insights: list[str]
    best_send_day: str
    best_send_hour: int
    workflow_template: WorkflowResponse

# =========================================================
# 1. LEAD SCORING ENDPOINT
# =========================================================

@app.post("/api/lead-score", response_model=LeadScoreResponse)
async def score_lead(lead: LeadFeatures):
    """Predict the probability that a lead will reply."""
    
    if lead_model is None or lead_feature_columns is None:
        # Return a default score if model not loaded
        return LeadScoreResponse(lead_score=0.5)
    
    try:
        lead_dict = {
            "role": lead.role,
            "industry": lead.industry,
            "company_size": lead.company_size,
            "lead_source": lead.lead_source
        }
        
        lead_df = pd.DataFrame([lead_dict])
        lead_encoded = pd.get_dummies(lead_df)
        lead_encoded = lead_encoded.reindex(columns=lead_feature_columns, fill_value=0)
        
        score = float(lead_model.predict_proba(lead_encoded)[0, 1])
        
        return LeadScoreResponse(lead_score=round(score, 4))
    
    except Exception as e:
        print(f"[ML API] Lead scoring error: {e}")
        return LeadScoreResponse(lead_score=0.5)

# =========================================================
# 2. INSIGHTS ENGINE ENDPOINT
# =========================================================

@app.post("/api/insights", response_model=InsightsResponse)
async def generate_insights(lead: LeadFeatures, lead_score: float = 0.5):
    """Generate insights based on lead features and score."""
    
    insights = []
    
    # Role-based insights
    role_insights = {
        "CTO": "Technical decision-makers respond well to ROI and efficiency metrics.",
        "CEO": "Executive messaging should focus on strategic business impact.",
        "Marketing Manager": "Marketing leads appreciate data-driven personalization.",
        "VP Sales": "Sales leaders value pipeline and revenue growth messaging.",
        "Director": "Directors prefer concise, action-oriented communication."
    }
    
    if lead.role in role_insights:
        insights.append(role_insights[lead.role])
    
    # Industry insights
    industry_insights = {
        "AI": "AI companies respond well to innovation and cutting-edge technology messaging.",
        "SaaS": "SaaS companies value scalability and integration capabilities.",
        "Finance": "Financial sector prioritizes security and compliance messaging.",
        "Healthcare": "Healthcare leads respond to patient outcome improvements.",
        "E-commerce": "E-commerce values conversion and revenue optimization."
    }
    
    if lead.industry in industry_insights:
        insights.append(industry_insights[lead.industry])
    
    # Lead source insights
    source_insights = {
        "Referral": "Referral leads have higher trust; prioritize early outreach.",
        "Website": "Website leads showed intent; reference their browsing behavior.",
        "LinkedIn": "LinkedIn leads respond well to professional networking tone.",
        "Conference": "Conference leads appreciate event-specific follow-ups.",
        "Paid Ad": "Paid leads need faster follow-up to maintain interest."
    }
    
    if lead.lead_source in source_insights:
        insights.append(source_insights[lead.lead_source])
    
    # Score-based insights
    if lead_score >= 0.7:
        insights.append("High-priority lead - recommend immediate personalized outreach.")
    elif lead_score >= 0.4:
        insights.append("Medium-priority lead - standard nurturing sequence recommended.")
    else:
        insights.append("Lower-priority lead - consider automated drip campaign.")
    
    # Company size insights
    size_insights = {
        "small": "Small companies value cost-effectiveness and quick implementation.",
        "medium": "Mid-size companies balance features with pricing considerations.",
        "large": "Enterprise leads require detailed ROI analysis and compliance info."
    }
    
    if lead.company_size in size_insights:
        insights.append(size_insights[lead.company_size])
    
    return InsightsResponse(insights=insights)

# =========================================================
# 3. SEND TIME OPTIMIZATION ENDPOINT
# =========================================================

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
HOURS = list(range(8, 18))  # 8 AM to 5 PM

CATEGORICAL_COLUMNS = [
    "role",
    "industry", 
    "company_size",
    "lead_source",
    "day_of_week",
    "timezone_region",
]

@app.post("/api/send-time", response_model=SendTimeResponse)
async def predict_send_time(lead: LeadFeatures):
    """Predict the optimal day and hour to send outreach."""
    
    if send_time_model is None or send_time_feature_columns is None:
        # Return sensible defaults if model not loaded
        return SendTimeResponse(best_send_day="Tuesday", best_send_hour=10)
    
    try:
        best_day = "Tuesday"
        best_hour = 10
        best_probability = -1.0
        
        lead_base = {
            "role": lead.role,
            "industry": lead.industry,
            "company_size": lead.company_size,
            "lead_source": lead.lead_source,
            "timezone_region": lead.timezone_region or "US",
            "past_open_rate": lead.past_open_rate or 0.5,
            "past_reply_rate": lead.past_reply_rate or 0.2,
        }
        
        for day in DAYS:
            for hour in HOURS:
                candidate = dict(lead_base)
                candidate["day_of_week"] = day
                candidate["send_hour"] = hour
                
                candidate_df = pd.DataFrame([candidate])
                encoded = pd.get_dummies(candidate_df, columns=CATEGORICAL_COLUMNS, dtype=int)
                aligned = encoded.reindex(columns=send_time_feature_columns, fill_value=0)
                
                prob = send_time_model.predict_proba(aligned)[0, 1]
                
                if prob > best_probability:
                    best_probability = prob
                    best_day = day
                    best_hour = hour
        
        return SendTimeResponse(best_send_day=best_day, best_send_hour=best_hour)
    
    except Exception as e:
        print(f"[ML API] Send time prediction error: {e}")
        return SendTimeResponse(best_send_day="Tuesday", best_send_hour=10)

# =========================================================
# 4. WORKFLOW STRATEGY GENERATOR ENDPOINT
# =========================================================

@app.post("/api/workflow-strategy", response_model=WorkflowResponse)
async def generate_workflow(
    lead: LeadFeatures,
    lead_score: float = 0.5,
    best_send_day: str = "Tuesday",
    best_send_hour: int = 10,
    insights: list[str] = []
):
    """Generate an AI-powered outreach workflow based on lead analysis."""
    
    # Determine workflow intensity based on lead score
    if lead_score >= 0.7:
        workflow_name = "High-Priority Outreach Sequence"
        delay_multiplier = 1  # Faster follow-ups
    elif lead_score >= 0.4:
        workflow_name = "Standard Nurturing Sequence"
        delay_multiplier = 1.5
    else:
        workflow_name = "Long-Term Drip Campaign"
        delay_multiplier = 2
    
    # Calculate follow-up days based on best send day
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    start_idx = day_order.index(best_send_day) if best_send_day in day_order else 1
    
    def get_next_day(days_ahead):
        return day_order[(start_idx + days_ahead) % 5]
    
    # Build workflow steps
    steps = [
        WorkflowStep(
            step_number=1,
            action="send_email",
            email_type="cold_email",
            send_day=best_send_day,
            send_hour=best_send_hour
        ),
        WorkflowStep(
            step_number=2,
            action="wait",
            delay_days=int(2 * delay_multiplier)
        ),
        WorkflowStep(
            step_number=3,
            action="send_email",
            email_type="followup_1",
            send_day=get_next_day(int(2 * delay_multiplier)),
            send_hour=best_send_hour,
            condition="if_no_reply"
        ),
        WorkflowStep(
            step_number=4,
            action="wait",
            delay_days=int(3 * delay_multiplier)
        ),
        WorkflowStep(
            step_number=5,
            action="send_email",
            email_type="followup_2",
            send_day=get_next_day(int(5 * delay_multiplier)),
            send_hour=best_send_hour,
            condition="if_no_reply"
        ),
        WorkflowStep(
            step_number=6,
            action="wait",
            delay_days=int(4 * delay_multiplier)
        ),
        WorkflowStep(
            step_number=7,
            action="send_email",
            email_type="final_followup",
            send_day=get_next_day(int(9 * delay_multiplier)),
            send_hour=best_send_hour,
            condition="if_no_reply"
        )
    ]
    
    return WorkflowResponse(workflow_name=workflow_name, steps=steps)

# =========================================================
# 5. UNIFIED ANALYZE-LEAD ENDPOINT
# =========================================================

@app.post("/api/analyze-lead", response_model=AnalyzeLeadResponse)
async def analyze_lead(request: AnalyzeLeadRequest):
    """
    Unified endpoint that orchestrates all ML services:
    1. Lead Scoring
    2. Insights Generation
    3. Send Time Optimization
    4. Workflow Strategy Generation
    """
    
    lead = request.lead_features
    
    # Step 1: Get lead score
    score_response = await score_lead(lead)
    lead_score = score_response.lead_score
    
    # Step 2: Generate insights
    insights_response = await generate_insights(lead, lead_score)
    insights = insights_response.insights
    
    # Step 3: Get optimal send time
    send_time_response = await predict_send_time(lead)
    best_send_day = send_time_response.best_send_day
    best_send_hour = send_time_response.best_send_hour
    
    # Step 4: Generate workflow
    workflow_response = await generate_workflow(
        lead=lead,
        lead_score=lead_score,
        best_send_day=best_send_day,
        best_send_hour=best_send_hour,
        insights=insights
    )
    
    return AnalyzeLeadResponse(
        lead_score=lead_score,
        insights=insights,
        best_send_day=best_send_day,
        best_send_hour=best_send_hour,
        workflow_template=workflow_response
    )

# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "lead_model_loaded": lead_model is not None,
        "send_time_model_loaded": send_time_model is not None
    }

# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
