import pandas as pd
import joblib
import os

from dotenv import load_dotenv
from google import genai


# =========================================================
# 1. LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

api_key = os.getenv("LLM_API_KEY")

client = genai.Client(api_key=api_key)

print("LLM initialized")


# =========================================================
# 2. LOAD LEAD SCORING MODEL
# =========================================================

model = joblib.load("lead_scoring_model.pkl")
feature_columns = joblib.load("feature_columns.pkl")

print("Lead scoring model loaded")


# =========================================================
# 3. EXTRACT FEATURE IMPORTANCE
# =========================================================

if hasattr(model, "feature_importances_"):
    importance_values = model.feature_importances_
else:
    importance_values = abs(model.coef_[0])

feature_importance = pd.DataFrame({
    "feature": feature_columns,
    "importance": importance_values
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)


# =========================================================
# 4. LOAD HISTORICAL DATASET
# =========================================================

dataset = pd.read_csv("lead_scoring_dataset.csv")

print("Dataset loaded:", dataset.shape)


# =========================================================
# 5. COMPUTE DATASET STATISTICS
# =========================================================

def compute_dataset_statistics(df):

    role_stats = df.groupby("role")["reply"].mean().sort_values(ascending=False)
    industry_stats = df.groupby("industry")["reply"].mean().sort_values(ascending=False)
    source_stats = df.groupby("lead_source")["reply"].mean().sort_values(ascending=False)

    stats = {
        "roles": role_stats.head(3).to_dict(),
        "industries": industry_stats.head(3).to_dict(),
        "sources": source_stats.head(3).to_dict()
    }

    return stats


dataset_stats = compute_dataset_statistics(dataset)


# =========================================================
# 6. BUILD LLM PROMPT
# =========================================================

def build_prompt(lead_features, score, factors, dataset_stats):

    prompt = f"""
You are an AI sales outreach strategist.

Lead Features:
{lead_features}

Predicted reply probability: {round(score,3)}

Top ML factors influencing this score:
"""

    for f in factors:
        prompt += f"- {f}\n"

    prompt += "\nHistorical dataset insights:\n"

    prompt += "\nTop responding roles:\n"
    for r, v in dataset_stats["roles"].items():
        prompt += f"- {r} reply rate {round(v,2)}\n"

    prompt += "\nTop responding industries:\n"
    for r, v in dataset_stats["industries"].items():
        prompt += f"- {r} reply rate {round(v,2)}\n"

    prompt += "\nTop responding lead sources:\n"
    for r, v in dataset_stats["sources"].items():
        prompt += f"- {r} reply rate {round(v,2)}\n"

    prompt += """

Return the response ONLY in JSON format.

{
"lead_quality":"",
"messaging_strategy":[],
"personalization":[],
"outreach_workflow":[],
"risks_opportunities":[]
}

Each list should contain 3-4 short bullet points.
Do not write explanations.
""" 

    return prompt


# =========================================================
# 7. GENERATE INSIGHTS
# =========================================================

def generate_insights(lead_dict):

    lead_df = pd.DataFrame([lead_dict])

    # encode
    lead_encoded = pd.get_dummies(lead_df)

    lead_encoded = lead_encoded.reindex(
        columns=feature_columns,
        fill_value=0
    )

    # score prediction
    score = model.predict_proba(lead_encoded)[:, 1][0]

    # active features
    active_features = lead_encoded.iloc[0]
    active_features = active_features[active_features == 1].index

    lead_factors = feature_importance[
        feature_importance["feature"].isin(active_features)
    ]

    lead_factors = lead_factors.sort_values(
        by="importance",
        ascending=False
    )

    top_factors = lead_factors.head(4)["feature"].tolist()

    readable_factors = []

    for f in top_factors:

        parts = f.split("_")

        if len(parts) >= 2:
            readable_factors.append(
                f"{parts[0]} = {' '.join(parts[1:])}"
            )

    prompt = build_prompt(
        lead_dict,
        score,
        readable_factors,
        dataset_stats
    )

    print("\nPrompt sent to LLM:\n")
    print(prompt)

    # ===== Gemini API Call =====

    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )

    try:
        insights = response.text
    except:
        insights = "LLM response could not be parsed."

    return score, readable_factors, insights


# =========================================================
# 8. TEST WITH ONE LEAD
# =========================================================

leads = pd.read_csv("lead.csv")

print("Leads loaded:", leads.shape)

test_lead = leads.iloc[0].to_dict()

print("\nTesting Lead:")
print(test_lead)

score, factors, insights = generate_insights(test_lead)

print("\nLead Score:", round(score,3))

print("\nTop Factors:")

for f in factors:
    print("-", f)

print("\nAI Insights:\n")
print(insights)


# =========================================================
# 9. SYSTEM PIPELINE (OPTIONAL)
# =========================================================

"""
def generate_insights_pipeline(input_file):

    leads = pd.read_csv(input_file)

    results = []

    for _, lead in leads.iterrows():

        lead_dict = lead.to_dict()

        score, factors, insights = generate_insights(lead_dict)

        lead_dict["lead_score"] = score
        lead_dict["top_factors"] = "; ".join(factors)
        lead_dict["insights"] = insights

        results.append(lead_dict)

    result_df = pd.DataFrame(results)

    result_df = result_df.sort_values(
        by="lead_score",
        ascending=False
    )

    return result_df


scored = generate_insights_pipeline("lead.csv")

scored.to_csv("leads_with_insights.csv", index=False)

print(scored.head())
"""