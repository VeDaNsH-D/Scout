import json
import os
import re
from typing import Any, Dict, List

from dotenv import load_dotenv


MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-flash-latest"]
ALLOWED_ACTIONS = {"send_email", "wait", "check_reply"}
ALLOWED_EMAIL_TYPES = {"cold_email", "followup_1", "followup_2", "final_followup"}
ALLOWED_CONDITIONS = {"if_no_reply", "stop_if_reply"}


def _is_quota_error(message: str) -> bool:
    msg = (message or "").lower()
    return "resource_exhausted" in msg or "quota" in msg or "429" in msg


def _get_retry_seconds(message: str) -> int:
    if not message:
        return 0
    match = re.search(r"retry in ([0-9]+(?:\.[0-9]+)?)s", message, flags=re.IGNORECASE)
    if not match:
        return 0
    try:
        return max(0, int(round(float(match.group(1)))))
    except Exception:
        return 0


def _get_gemini_module():
    try:
        from google import genai
    except Exception as exc:
        raise ImportError(
            "google-genai is not installed. Install with: pip install google-genai"
        ) from exc
    return genai


def _get_client():
    load_dotenv()
    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        raise ValueError("LLM_API_KEY not found in .env")

    genai = _get_gemini_module()
    return genai.Client(api_key=api_key)


def _build_prompt(
    lead_features: Dict[str, Any],
    lead_score: float,
    best_send_day: str,
    best_send_hour: int,
    insights: List[str],
) -> str:
    insights_text = "\n".join(f"- {item}" for item in (insights or [])) or "- None"

    return f"""
You are an AI sales outreach workflow strategist.
Generate a structured JSON outreach workflow template only.

Lead Features:
- role: {lead_features.get("role")}
- industry: {lead_features.get("industry")}
- company_size: {lead_features.get("company_size")}
- lead_source: {lead_features.get("lead_source")}
- company_name: {lead_features.get("company_name")}

Model Predictions:
- lead_score: {lead_score}
- best_send_day: {best_send_day}
- best_send_hour: {best_send_hour}

Insight Engine Output:
{insights_text}

Rules:
1) Return valid JSON only. No markdown, no explanation.
2) JSON schema:
{{
  "workflow_name": "AI Generated Outreach Workflow",
  "steps": [
    {{
      "step_number": 1,
      "action": "send_email",
      "email_type": "cold_email",
      "delay_days": 0,
      "send_day": "Tuesday",
      "send_hour": 10,
      "condition": "if_no_reply"
    }}
  ]
}}
3) Allowed action values: send_email, wait, check_reply
4) Allowed email_type values: cold_email, followup_1, followup_2, final_followup
5) Allowed condition values: if_no_reply, stop_if_reply
6) The first step must be send_email with:
   - send_day exactly "{best_send_day}"
   - send_hour exactly {best_send_hour}
   - email_type exactly "cold_email"
7) Keep the plan concise and realistic for B2B outreach.
"""


def _extract_json_text(raw_text: str) -> str:
    text = (raw_text or "").strip()
    if not text:
        raise ValueError("Empty LLM response.")

    # Handle fenced output if the model returns markdown anyway.
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    if text.startswith("{") and text.endswith("}"):
        return text

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in LLM response.")
    return match.group(0)


def _extract_response_text(response: Any) -> str:
    text = getattr(response, "text", None)
    if text:
        return text.strip()

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if part_text:
                return part_text.strip()
    return ""


def _validate_workflow(
    workflow: Dict[str, Any], best_send_day: str, best_send_hour: int
) -> Dict[str, Any]:
    if not isinstance(workflow, dict):
        raise ValueError("Workflow must be a JSON object.")

    steps = workflow.get("steps")
    if not isinstance(steps, list) or not steps:
        raise ValueError("Workflow must include a non-empty 'steps' list.")

    first = steps[0]
    if not isinstance(first, dict):
        raise ValueError("First step must be an object.")
    if first.get("action") != "send_email":
        raise ValueError("First step action must be 'send_email'.")
    if first.get("email_type") != "cold_email":
        raise ValueError("First step email_type must be 'cold_email'.")

    # Enforce required first-send timing even if model deviates.
    first["send_day"] = best_send_day
    first["send_hour"] = int(best_send_hour)
    first.setdefault("delay_days", 0)

    for i, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            raise ValueError(f"Step {i} must be an object.")
        step["step_number"] = i

        action = step.get("action")
        if action not in ALLOWED_ACTIONS:
            raise ValueError(f"Step {i} has invalid action: {action}")

        email_type = step.get("email_type")
        if action == "send_email" and email_type not in ALLOWED_EMAIL_TYPES:
            raise ValueError(f"Step {i} has invalid email_type: {email_type}")

        condition = step.get("condition")
        if condition is not None and condition not in ALLOWED_CONDITIONS:
            raise ValueError(f"Step {i} has invalid condition: {condition}")

    workflow.setdefault("workflow_name", "AI Generated Outreach Workflow")
    workflow["steps"] = steps
    return workflow


def _fallback_workflow(
    lead_score: float,
    best_send_day: str,
    best_send_hour: int,
    quota_message: str = "",
) -> Dict[str, Any]:
    score = float(lead_score)
    _ = _get_retry_seconds(quota_message)

    steps: List[Dict[str, Any]] = [
        {
            "step_number": 1,
            "action": "send_email",
            "email_type": "cold_email",
            "delay_days": 0,
            "send_day": best_send_day,
            "send_hour": int(best_send_hour),
        }
    ]

    if score > 0.7:
        steps.extend(
            [
                {"step_number": 2, "action": "wait", "delay_days": 2},
                {"step_number": 3, "action": "check_reply", "condition": "stop_if_reply"},
                {
                    "step_number": 4,
                    "action": "send_email",
                    "email_type": "followup_1",
                    "condition": "if_no_reply",
                },
                {"step_number": 5, "action": "wait", "delay_days": 3},
                {"step_number": 6, "action": "check_reply", "condition": "stop_if_reply"},
                {
                    "step_number": 7,
                    "action": "send_email",
                    "email_type": "followup_2",
                    "condition": "if_no_reply",
                },
                {"step_number": 8, "action": "wait", "delay_days": 4},
                {"step_number": 9, "action": "check_reply", "condition": "stop_if_reply"},
                {
                    "step_number": 10,
                    "action": "send_email",
                    "email_type": "final_followup",
                    "condition": "if_no_reply",
                },
            ]
        )
    elif score > 0.4:
        steps.extend(
            [
                {"step_number": 2, "action": "wait", "delay_days": 3},
                {"step_number": 3, "action": "check_reply", "condition": "stop_if_reply"},
                {
                    "step_number": 4,
                    "action": "send_email",
                    "email_type": "followup_1",
                    "condition": "if_no_reply",
                },
            ]
        )

    return {
        "workflow_name": "AI Generated Outreach Workflow",
        "steps": steps,
    }


def generate_workflow_template(
    lead_features: Dict[str, Any],
    lead_score: float,
    best_send_day: str,
    best_send_hour: int,
    insights: List[str],
) -> Dict[str, Any]:
    client = _get_client()
    prompt = _build_prompt(
        lead_features=lead_features,
        lead_score=lead_score,
        best_send_day=best_send_day,
        best_send_hour=best_send_hour,
        insights=insights,
    )

    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(model=model_name, contents=prompt)
            raw_text = _extract_response_text(response)
            json_text = _extract_json_text(raw_text)
            workflow = json.loads(json_text)
            return _validate_workflow(workflow, best_send_day, best_send_hour)
        except Exception as exc:
            last_error = str(exc)
            if _is_quota_error(last_error):
                return _fallback_workflow(
                    lead_score=lead_score,
                    best_send_day=best_send_day,
                    best_send_hour=best_send_hour,
                    quota_message=last_error,
                )
    return _fallback_workflow(
        lead_score=lead_score,
        best_send_day=best_send_day,
        best_send_hour=best_send_hour,
        quota_message=last_error or "",
    )


if __name__ == "__main__":
    lead_features = {
        "role": "Marketing Manager",
        "industry": "AI",
        "company_size": "small",
        "lead_source": "Referral",
        "company_name": "NeuralStack",
    }
    lead_score = 0.65
    best_send_day = "Tuesday"
    best_send_hour = 10
    insights = [
        "Referral leads have high trust",
        "AI companies respond well to innovation messaging",
    ]

    workflow = generate_workflow_template(
        lead_features=lead_features,
        lead_score=lead_score,
        best_send_day=best_send_day,
        best_send_hour=best_send_hour,
        insights=insights,
    )
    print(json.dumps(workflow, indent=2))
