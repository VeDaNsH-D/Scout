import os
import json
import re
import argparse
from dotenv import load_dotenv

# Keep imports light at module import time. The SDK import happens lazily so
# this file can still be imported even when dependencies are missing.

MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-flash-latest"]
EMAIL_TYPES = ("cold_email", "followup_1", "followup_2", "final_followup")

# ======================================================
# LOAD API KEY FROM .env
# ======================================================

load_dotenv()


# ======================================================
# INITIALIZE GEMINI CLIENT
# ======================================================

def get_client():
    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        raise ValueError("LLM_API_KEY not found in .env file")

    try:
        from google import genai
    except Exception as exc:
        raise ImportError(
            "google-genai package is not installed. Install with: pip install google-genai"
        ) from exc

    return genai.Client(api_key=api_key)


# ======================================================
# PROMPT BUILDER
# ======================================================

def build_prompt(lead, insights, campaign_context, email_type):

    email_instruction = ""

    if email_type == "cold_email":
        email_instruction = "Write the first cold outreach email."

    elif email_type == "followup_1":
        email_instruction = "Write a polite follow-up email if the lead has not replied."

    elif email_type == "followup_2":
        email_instruction = "Write a short second follow-up email reminding the lead."

    elif email_type == "final_followup":
        email_instruction = "Write a final short follow-up email before closing the outreach."

    prompt = f"""
You are an expert B2B sales outreach assistant.

{email_instruction}

-------------------------
LEAD DETAILS
-------------------------
Role: {lead.get('role', 'Unknown')}
Industry: {lead.get('industry', 'Unknown')}
Company Size: {lead.get('company_size', 'Unknown')}
Lead Source: {lead.get('lead_source', 'Unknown')}
Company Name: {lead.get('company_name', 'Unknown')}
Lead Score: {lead.get('lead_score', 'Unknown')}

-------------------------
AI INSIGHTS
-------------------------
{chr(10).join(insights or [])}

-------------------------
OUR TEAM
-------------------------
Team Name: {campaign_context.get('team_name', 'Unknown')}
Product Name: {campaign_context.get('product_name', 'Unknown')}
Product Description: {campaign_context.get('product_description', 'Unknown')}

-------------------------
CAMPAIGN CONTEXT
-------------------------
Pain Point: {campaign_context.get('pain_point', 'Unknown')}
Goal: {campaign_context.get('goal', 'Unknown')}

-------------------------
CONSTRAINTS
-------------------------
- Maximum 80 words
- Friendly and conversational tone
- Personalized to the lead
- Avoid spammy language
- End with a call-to-action
- Return only the email text
"""

    return prompt


# ======================================================
# EMAIL GENERATOR
# ======================================================

def extract_text(response):
    text = getattr(response, "text", None)
    if text:
        return text.strip()

    # Fallback for SDK responses that don't expose `response.text`.
    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if part_text:
                return part_text.strip()
    return ""


def is_quota_error(message):
    msg = (message or "").lower()
    return "resource_exhausted" in msg or "quota" in msg or "429" in msg


def get_retry_seconds(message):
    if not message:
        return None
    match = re.search(r"retry in ([0-9]+(?:\.[0-9]+)?)s", message, flags=re.IGNORECASE)
    if not match:
        return None
    try:
        return max(0, int(round(float(match.group(1)))))
    except Exception:
        return None


def fallback_email(lead, campaign_context, email_type):
    name = lead.get("company_name", "your team")
    role = lead.get("role", "team")
    product = campaign_context.get("product_name", "our platform")
    pain = campaign_context.get("pain_point", "improving pipeline visibility")
    goal = campaign_context.get("goal", "a short intro call")

    templates = {
        "cold_email": (
            f"Hi, noticed {name} is growing and thought this might help your {role} team. "
            f"{product} helps with {pain.lower()}. "
            f"Would you be open to a quick chat this week to see if it fits your goals?"
        ),
        "followup_1": (
            f"Hi, following up in case my last note got buried. "
            f"We help teams like {name} improve outcomes around {pain.lower()}. "
            f"Open to a brief 15-minute conversation?"
        ),
        "followup_2": (
            f"Quick follow-up: if {pain.lower()} is a priority this quarter, "
            f"{product} might be useful for your team at {name}. "
            f"Would a short call be worth it?"
        ),
        "final_followup": (
            f"Final note from me. If now is not the right time, no worries. "
            f"If helpful, I can share a short overview of how {product} supports teams like {name}. "
            f"Interested in {goal.lower()}?"
        )
    }
    return templates.get(email_type, "Could not generate email.")


def generate_email(lead, insights, campaign_context, email_type, client):

    prompt = build_prompt(lead, insights, campaign_context, email_type)

    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            email = extract_text(response)
            if email:
                return email, None
            last_error = f"Model '{model_name}' returned an empty response."
        except Exception as exc:
            last_error = str(exc)
            if is_quota_error(last_error):
                retry_in = get_retry_seconds(last_error)
                if retry_in is not None:
                    return (
                        f"Using fallback email template (API quota reached; retry after ~{retry_in}s).",
                        "quota"
                    )
                return "Using fallback email template (API quota reached).", "quota"

    return f"Email generation failed: {last_error}", "error"


# ======================================================
# TEST EXAMPLE
# ======================================================

lead = {
    "role": "Marketing Manager",
    "industry": "AI",
    "company_size": "small",
    "lead_source": "Referral",
    "company_name": "NeuralStack",
    "lead_score": 0.65
}

insights = [
    "Focus messaging on revenue growth and pipeline efficiency.",
    "AI companies respond well to innovation and performance improvements.",
    "Referral leads have high trust; prioritize them early."
]

campaign_context = {
    "team_name": "NodeTorious",
    "product_name": "PipelineIQ",
    "product_description":
    "AI-powered sales intelligence platform that helps teams prioritize leads and automate outreach workflows.",
    "pain_point":
    "Marketing teams struggle to convert leads efficiently and lack visibility into pipeline performance.",
    "goal": "Book a short demo meeting."
}


# ======================================================
# GENERATE OUTREACH SEQUENCE
# ======================================================

def main():
    parser = argparse.ArgumentParser(description="Generate outreach emails with Gemini.")
    parser.add_argument(
        "--email-type",
        choices=EMAIL_TYPES,
        default="cold_email",
        help="Generate only one email type (default: cold_email)."
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Generate all email types (uses more API calls)."
    )
    args = parser.parse_args()

    client = get_client()

    emails = {}
    quota_reached = False
    selected_types = EMAIL_TYPES if args.all else (args.email_type,)
    for email_type in selected_types:
        if quota_reached:
            emails[email_type] = fallback_email(lead, campaign_context, email_type)
            continue

        generated, status = generate_email(lead, insights, campaign_context, email_type, client)
        if status == "quota":
            quota_reached = True
            emails[email_type] = fallback_email(lead, campaign_context, email_type)
        else:
            emails[email_type] = generated


    output = {
        "company_name": lead.get("company_name"),
        "lead_role": lead.get("role"),
        "lead_score": lead.get("lead_score"),
        "mode": "all" if args.all else "single",
        "emails": emails
    }
    print(json.dumps(output, indent=4))


if __name__ == "__main__":
    main()


# ======================================================
# SYSTEM INTEGRATION (FOR AUTOMATION PIPELINE)
# ======================================================

"""
def generate_email_sequence(lead):

    score, insights = generate_insights(lead)

    lead["lead_score"] = score

    emails = {
        "cold_email": generate_email(lead, insights, campaign_context, "cold_email"),
        "followup_1": generate_email(lead, insights, campaign_context, "followup_1"),
        "followup_2": generate_email(lead, insights, campaign_context, "followup_2"),
        "final_followup": generate_email(lead, insights, campaign_context, "final_followup")
    }

    return emails
"""
