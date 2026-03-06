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
    role_stats = dataset.groupby(
        "role")["reply"].mean().sort_values(ascending=False)
    industry_stats = dataset.groupby(
        "industry")["reply"].mean().sort_values(ascending=False)
    source_stats = dataset.groupby("lead_source")[
        "reply"].mean().sort_values(ascending=False)

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
    lead_encoded = lead_encoded.reindex(
        columns=lead_feature_columns, fill_value=0)
    score = lead_model.predict_proba(lead_encoded)[:, 1][0]
    return float(score)


def predict_best_send_time(lead_features):
    if not send_time_model:
        return {"best_send_day": "Tuesday", "best_send_hour": 10}

    DAYS = ["Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday", "Sunday"]
    HOURS = list(range(24))
    CATEGORICAL_COLUMNS = ["role", "industry", "company_size",
                           "lead_source", "day_of_week", "timezone_region"]

    best_day = None
    best_hour = None
    best_probability = -1.0

    # Ensure required fields exist
    base_lead = dict(lead_features)
    if "timezone_region" not in base_lead:
        base_lead["timezone_region"] = "US"
    if "past_open_rate" not in base_lead:
        base_lead["past_open_rate"] = 0.5
    if "past_reply_rate" not in base_lead:
        base_lead["past_reply_rate"] = 0.1
    if "email_opened" not in base_lead:
        base_lead["email_opened"] = 0

    # Remove fields that the send time model doesn't use
    for key in ["growth_rate", "seniority"]:
        base_lead.pop(key, None)

    for day in DAYS:
        for hour in HOURS:
            candidate = dict(base_lead)
            candidate["day_of_week"] = day
            candidate["send_hour"] = hour

            candidate_df = pd.DataFrame([candidate])
            encoded = pd.get_dummies(
                candidate_df, columns=CATEGORICAL_COLUMNS, dtype=int)
            aligned = encoded.reindex(
                columns=send_time_feature_columns, fill_value=0)

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


@app.route('/api/ml/score-leads-batch', methods=['POST'])
def score_leads_batch():
    """Score multiple leads in a single request for CSV upload efficiency"""
    try:
        data = request.json
        leads_list = data.get("leads", [])
        results = []
        for lead_features in leads_list:
            score = predict_score(lead_features)
            results.append({"lead_score": score})
        return jsonify({"results": results})
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
            role = lead_features.get("role", "Professional")
            industry = lead_features.get("industry", "")
            if score >= 0.7:
                insights = [
                    f"High-value lead — {role} in {industry} shows strong engagement potential",
                    "Prioritize immediate outreach with a personalized approach",
                    "Use industry-specific case studies to build credibility",
                    "Schedule a follow-up within 24-48 hours"
                ]
            elif score >= 0.4:
                insights = [
                    f"Moderate-potential lead — {role} in {industry} may need nurturing",
                    "Consider personalizing the subject line with industry relevance",
                    "Follow up after 2-3 days with additional value",
                    "Share relevant content to build trust"
                ]
            else:
                insights = [
                    f"Lower-priority lead — {role} in {industry} requires a longer nurture cycle",
                    "Use educational content to build awareness",
                    "Consider a drip campaign with longer intervals",
                    "Re-evaluate engagement after initial touchpoints"
                ]
            return jsonify({"insights": insights})

        # Get active features
        lead_df = pd.DataFrame([lead_features])
        lead_encoded = pd.get_dummies(lead_df).reindex(
            columns=lead_feature_columns, fill_value=0)
        active_features = lead_encoded.iloc[0]
        active_features = active_features[active_features == 1].index

        lead_factors = feature_importance[feature_importance["feature"].isin(
            active_features)]
        lead_factors = lead_factors.sort_values(
            by="importance", ascending=False)
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
        Predicted reply probability: {round(score, 3)}
        Top ML factors influencing this score:
        """
        for f in readable_factors:
            prompt += f"- {f}\n"

        prompt += "\nReturn the response ONLY as a JSON string containing a single array of strings with 3-5 concise, actionable insight sentences. Do NOT use markdown code blocks. Just the raw JSON array. Example: [\"Insight 1\", \"Insight 2\"]"

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            insights_array = json.loads(text)
            if isinstance(insights_array, dict):
                # Fallback if it returned the previous object format
                insights_array = []
                for val in insights_array.values():
                    if isinstance(val, list):
                        insights_array.extend(val)
                    elif isinstance(val, str):
                        insights_array.append(val)
        except:
            insights_array = [text]  # Fallback if JSON parsing fails

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
            # Fallback template personalized by score
            role = lead_features.get("role", "Professional")
            industry = lead_features.get("industry", "")

            if score >= 0.7:
                # High-priority lead: aggressive outreach
                template = {
                    "workflow_name": f"High-Priority Outreach - {role} ({industry})",
                    "steps": [
                        {"step_number": 1, "action": "send_email", "email_type": "personalized_intro",
                            "send_day": best_day, "send_hour": best_hour},
                        {"step_number": 2, "action": "wait", "delay_days": 1},
                        {"step_number": 3, "action": "send_email",
                            "email_type": "value_proposition", "condition": "if_no_reply"},
                        {"step_number": 4, "action": "wait", "delay_days": 2},
                        {"step_number": 5, "action": "send_email",
                            "email_type": "case_study", "condition": "if_no_reply"},
                        {"step_number": 6, "action": "wait", "delay_days": 2},
                        {"step_number": 7, "action": "send_email",
                            "email_type": "meeting_request", "condition": "if_no_reply"}
                    ]
                }
            elif score >= 0.4:
                # Medium-priority lead: balanced approach
                template = {
                    "workflow_name": f"Nurture Sequence - {role} ({industry})",
                    "steps": [
                        {"step_number": 1, "action": "send_email", "email_type": "cold_email",
                            "send_day": best_day, "send_hour": best_hour},
                        {"step_number": 2, "action": "wait", "delay_days": 3},
                        {"step_number": 3, "action": "send_email",
                            "email_type": "followup_1", "condition": "if_no_reply"},
                        {"step_number": 4, "action": "wait", "delay_days": 4},
                        {"step_number": 5, "action": "send_email",
                            "email_type": "followup_2", "condition": "if_no_reply"}
                    ]
                }
            else:
                # Low-priority lead: slow drip
                template = {
                    "workflow_name": f"Low-Touch Drip - {role} ({industry})",
                    "steps": [
                        {"step_number": 1, "action": "send_email", "email_type": "cold_email",
                            "send_day": best_day, "send_hour": best_hour},
                        {"step_number": 2, "action": "wait", "delay_days": 5},
                        {"step_number": 3, "action": "send_email",
                            "email_type": "followup_1", "condition": "if_no_reply"},
                        {"step_number": 4, "action": "wait", "delay_days": 7},
                        {"step_number": 5, "action": "check_condition",
                            "condition": "if_no_reply", "action_if_true": "archive"}
                    ]
                }

            return jsonify({"workflow_template": template})

        role = lead_features.get("role", "Professional")
        industry = lead_features.get("industry", "Unknown")
        company_size = lead_features.get("company_size", "Unknown")
        lead_source = lead_features.get("lead_source", "Unknown")
        seniority = lead_features.get("seniority", "Unknown")

        score_label = "high-priority" if score >= 0.7 else (
            "medium-priority" if score >= 0.4 else "low-priority")

        prompt = f"""
        Generate a personalized outreach workflow template for this specific lead:
        
        Role: {role}
        Industry: {industry}
        Company Size: {company_size}
        Lead Source: {lead_source}
        Seniority: {seniority}
        Lead Score: {score} ({score_label})
        Best Send Time: {best_day} at {best_hour}:00
        Insights: {insights}
        
        The workflow should be tailored to this lead's profile:
        - For {score_label} leads, {"use aggressive multi-touch outreach with short delays" if score >= 0.7 else ("use a balanced nurture sequence" if score >= 0.4 else "use a slow drip campaign with longer delays")}
        - Personalize the workflow name to mention the lead's role and industry
        - Choose email types appropriate for a {seniority} {role} in {industry}
        
        Output MUST be valid JSON (do not include markdown tags like ```json) in this exact format:
        {{
            "workflow_name": "Descriptive name mentioning {role} and {industry}",
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
        Create 4-6 steps. Include conditions like "if_no_reply" or "if_opened" for followups.
        Use email_types like: personalized_intro, value_proposition, case_study, followup_1, followup_2, meeting_request, breakup_email.
        """

        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )

            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            workflow_template = json.loads(text)
            return jsonify({"workflow_template": workflow_template})
        except Exception as llm_err:
            print(
                f"LLM workflow generation failed, using score-based fallback: {llm_err}")

        # Fallback to score-based template when LLM fails
        role = lead_features.get("role", "Professional")
        industry = lead_features.get("industry", "")
        if score >= 0.7:
            template = {
                "workflow_name": f"High-Priority Outreach - {role} ({industry})",
                "steps": [
                    {"step_number": 1, "action": "send_email", "email_type": "personalized_intro",
                        "send_day": best_day, "send_hour": best_hour},
                    {"step_number": 2, "action": "wait", "delay_days": 1},
                    {"step_number": 3, "action": "send_email",
                        "email_type": "value_proposition", "condition": "if_no_reply"},
                    {"step_number": 4, "action": "wait", "delay_days": 2},
                    {"step_number": 5, "action": "send_email",
                        "email_type": "meeting_request", "condition": "if_no_reply"}
                ]
            }
        elif score >= 0.4:
            template = {
                "workflow_name": f"Nurture Sequence - {role} ({industry})",
                "steps": [
                    {"step_number": 1, "action": "send_email", "email_type": "cold_email",
                        "send_day": best_day, "send_hour": best_hour},
                    {"step_number": 2, "action": "wait", "delay_days": 3},
                    {"step_number": 3, "action": "send_email",
                        "email_type": "followup_1", "condition": "if_no_reply"},
                    {"step_number": 4, "action": "wait", "delay_days": 4},
                    {"step_number": 5, "action": "send_email",
                        "email_type": "followup_2", "condition": "if_no_reply"}
                ]
            }
        else:
            template = {
                "workflow_name": f"Low-Touch Drip - {role} ({industry})",
                "steps": [
                    {"step_number": 1, "action": "send_email", "email_type": "cold_email",
                        "send_day": best_day, "send_hour": best_hour},
                    {"step_number": 2, "action": "wait", "delay_days": 5},
                    {"step_number": 3, "action": "send_email",
                        "email_type": "followup_1", "condition": "if_no_reply"}
                ]
            }
        return jsonify({"workflow_template": template})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
