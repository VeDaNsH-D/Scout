from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import traceback
from dotenv import load_dotenv
from google import genai
import json

app = Flask(__name__)
CORS(app)

# =========================================================
# 1. LOAD ENVIRONMENT VARIABLES & INITIALIZE
# =========================================================
load_dotenv()
api_key = os.getenv("LLM_API_KEY")

if api_key:
    client = genai.Client(api_key=api_key)
    print("LLM initialized")
else:
    client = None
    print("WARNING: LLM_API_KEY not found in environment.")

# =========================================================
# 2. LOAD MODELS
# =========================================================
try:
    lead_model = joblib.load("lead_scoring_model.pkl")
    lead_feature_columns = joblib.load("feature_columns.pkl")
    print("Lead scoring model loaded")
    
    # Extract feature importance for insights
    if hasattr(lead_model, "feature_importances_"):
        importance_values = lead_model.feature_importances_
    else:
        importance_values = abs(lead_model.coef_[0])

    feature_importance = pd.DataFrame({
        "feature": lead_feature_columns,
        "importance": importance_values
    }).sort_values(by="importance", ascending=False)
except Exception as e:
    print(f"Error loading lead scoring model: {e}")
    lead_model = None
    lead_feature_columns = None
    feature_importance = None

try:
    send_time_model = joblib.load("send_time_model.pkl")
    send_time_feature_columns = joblib.load("send_time_feature_columns.pkl")
    print("Send time model loaded")
except Exception as e:
    print(f"Error loading send time model: {e}")
    send_time_model = None
    send_time_feature_columns = None


# Load dataset stats for insights
try:
    dataset = pd.read_csv("lead_scoring_dataset.csv")
    role_stats = dataset.groupby("role")["reply"].mean().sort_values(ascending=False)
    industry_stats = dataset.groupby("industry")["reply"].mean().sort_values(ascending=False)
    source_stats = dataset.groupby("lead_source")["reply"].mean().sort_values(ascending=False)

    dataset_stats = {
        "roles": role_stats.head(3).to_dict(),
        "industries": industry_stats.head(3).to_dict(),
        "sources": source_stats.head(3).to_dict()
    }
except Exception as e:
    print(f"Error computing dataset statistics: {e}")
    dataset_stats = {"roles": {}, "industries": {}, "sources": {}}


# =========================================================
# HELPER FUNCTIONS
# =========================================================
def predict_score(lead_features):
    if not lead_model:
        return 0.5
    
    lead_df = pd.DataFrame([lead_features])
    lead_encoded = pd.get_dummies(lead_df)
    lead_encoded = lead_encoded.reindex(columns=lead_feature_columns, fill_value=0)
    score = lead_model.predict_proba(lead_encoded)[:, 1][0]
    return float(score)

def predict_best_send_time(lead_features):
    if not send_time_model:
        return {"best_send_day": "Tuesday", "best_send_hour": 10}
        
    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    HOURS = list(range(24))
    CATEGORICAL_COLUMNS = ["role", "industry", "company_size", "lead_source", "day_of_week", "timezone_region"]
    
    best_day = None
    best_hour = None
    best_probability = -1.0

    # Ensure required fields exist
    base_lead = dict(lead_features)
    if "timezone_region" not in base_lead: base_lead["timezone_region"] = "US"
    if "past_open_rate" not in base_lead: base_lead["past_open_rate"] = 0.5
    if "past_reply_rate" not in base_lead: base_lead["past_reply_rate"] = 0.1

    for day in DAYS:
        for hour in HOURS:
            candidate = dict(base_lead)
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

    return {"best_send_day": best_day, "best_send_hour": int(best_hour)}

# =========================================================
# API ENDPOINTS
# =========================================================

@app.route('/api/ml/score-lead', methods=['POST'])
def score_lead():
    try:
        data = request.json
        lead_features = data.get("lead_features", {})
        score = predict_score(lead_features)
        return jsonify({"lead_score": score})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/ml/insights', methods=['POST'])
def get_insights():
    try:
        data = request.json
        lead_features = data.get("lead_features", {})
        score = data.get("lead_score", predict_score(lead_features))
        
        if not client or feature_importance is None:
            return jsonify({"insights": ["High quality lead", "Consider personalizing the subject line", "Follow up after 2 days"]})
            
        # Get active features
        lead_df = pd.DataFrame([lead_features])
        lead_encoded = pd.get_dummies(lead_df).reindex(columns=lead_feature_columns, fill_value=0)
        active_features = lead_encoded.iloc[0]
        active_features = active_features[active_features == 1].index

        lead_factors = feature_importance[feature_importance["feature"].isin(active_features)]
        lead_factors = lead_factors.sort_values(by="importance", ascending=False)
        top_factors = lead_factors.head(4)["feature"].tolist()

        readable_factors = []
        for f in top_factors:
            parts = f.split("_")
            if len(parts) >= 2:
                readable_factors.append(f"{parts[0]} = {' '.join(parts[1:])}")

        # Build prompt
        prompt = f"""
        You are an AI sales outreach strategist.
        Lead Features: {lead_features}
        Predicted reply probability: {round(score,3)}
        Top ML factors influencing this score:
        """
        for f in readable_factors: prompt += f"- {f}\n"
        
        prompt += "\nReturn the response ONLY as a JSON string containing a single array of strings with 3-5 concise, actionable insight sentences. Do NOT use markdown code blocks. Just the raw JSON array. Example: [\"Insight 1\", \"Insight 2\"]"
        
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )
        
        text = response.text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        text = text.strip()
        
        try:
            insights_array = json.loads(text)
            if isinstance(insights_array, dict):
                # Fallback if it returned the previous object format
                insights_array = []
                for val in insights_array.values():
                    if isinstance(val, list): insights_array.extend(val)
                    elif isinstance(val, str): insights_array.append(val)
        except:
            insights_array = [text] # Fallback if JSON parsing fails
            
        return jsonify({"insights": insights_array[:5]})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/ml/best-send-time', methods=['POST'])
def best_send_time():
    try:
        data = request.json
        lead_features = data.get("lead_features", {})
        result = predict_best_send_time(lead_features)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/ml/workflow-strategy', methods=['POST'])
def workflow_strategy():
    try:
        data = request.json
        lead_features = data.get("lead_features", {})
        score = data.get("lead_score", 0.5)
        best_day = data.get("best_send_day", "Tuesday")
        best_hour = data.get("best_send_hour", 10)
        insights = data.get("insights", [])
        
        if not client:
            # Fallback mock template if no LLM
            return jsonify({
                "workflow_template": {
                    "workflow_name": "Standard Outreach",
                    "steps": [
                        {"step_number": 1, "action": "send_email", "email_type": "cold_email", "send_day": best_day, "send_hour": best_hour},
                        {"step_number": 2, "action": "wait", "delay_days": 3},
                        {"step_number": 3, "action": "send_email", "email_type": "followup_1", "condition": "if_no_reply"}
                    ]
                }
            })
            
        prompt = f"""
        Generate an outreach workflow template for a lead.
        
        Lead Features: {lead_features}
        Lead Score: {score}
        Best Send Time: {best_day} at {best_hour}:00
        Insights: {insights}
        
        Output MUST be valid JSON (do not include markdown tags like ```json) in this exact format:
        {{
            "workflow_name": "Name of workflow",
            "steps": [
                {{
                    "step_number": 1,
                    "action": "send_email",
                    "email_type": "cold_email",
                    "send_day": "{best_day}",
                    "send_hour": {best_hour}
                }},
                {{
                    "step_number": 2,
                    "action": "wait",
                    "delay_days": 2
                }}
            ]
        }}
        Create 3-4 steps. Include a condition like "if_no_reply" for followups.
        """
        
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )
        
        text = response.text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        text = text.strip()
        
        workflow_template = json.loads(text)
        return jsonify({"workflow_template": workflow_template})
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
