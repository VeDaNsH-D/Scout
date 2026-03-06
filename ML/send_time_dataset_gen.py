import random
import pandas as pd


ROLES = ["CTO", "CEO", "Marketing Manager", "VP Sales", "Founder", "HR Director"]
INDUSTRIES = ["SaaS", "Fintech", "AI", "Healthcare", "Ecommerce"]
COMPANY_SIZES = ["small", "medium", "large", "enterprise"]
LEAD_SOURCES = ["LinkedIn", "Referral", "ColdList", "Conference", "Inbound"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
TIMEZONES = ["US", "Europe", "Asia"]


def clamp(value, low=0.01, high=0.99):
    return max(low, min(high, value))


def sample_lead_profile():
    role = random.choice(ROLES)
    industry = random.choice(INDUSTRIES)
    company_size = random.choice(COMPANY_SIZES)
    lead_source = random.choice(LEAD_SOURCES)
    day_of_week = random.choice(DAYS)
    send_hour = random.randint(0, 23)
    timezone_region = random.choice(TIMEZONES)
    return (
        role,
        industry,
        company_size,
        lead_source,
        day_of_week,
        send_hour,
        timezone_region,
    )


def generate_behavior_features(lead_source, role, company_size):
    # Referral / inbound leads usually have better historical engagement.
    open_alpha, open_beta = 2.5, 4.0
    reply_alpha, reply_beta = 1.6, 7.0

    if lead_source == "Referral":
        open_alpha += 1.2
        reply_alpha += 1.1
    elif lead_source == "Inbound":
        open_alpha += 0.9
        reply_alpha += 0.7
    elif lead_source == "ColdList":
        open_beta += 1.0
        reply_beta += 1.4

    if role in ("CTO", "VP Sales"):
        reply_alpha += 0.5
    if company_size == "enterprise":
        reply_beta += 0.8

    past_open_rate = round(clamp(random.betavariate(open_alpha, open_beta), 0.02, 0.98), 3)
    past_reply_rate = round(clamp(random.betavariate(reply_alpha, reply_beta), 0.01, 0.90), 3)
    return past_open_rate, past_reply_rate


def open_probability(day_of_week, send_hour, timezone_region, lead_source, past_open_rate):
    p_open = 0.18 + (0.45 * past_open_rate)

    # Higher open chance Tue-Thu, 9-11
    if day_of_week in ("Tuesday", "Wednesday", "Thursday") and 9 <= send_hour <= 11:
        p_open += 0.20
    elif day_of_week in ("Tuesday", "Wednesday", "Thursday") and 8 <= send_hour <= 17:
        p_open += 0.08

    # Lower performance in late night / weekend sends.
    if send_hour < 7 or send_hour > 20:
        p_open -= 0.07
    if day_of_week in ("Saturday", "Sunday"):
        p_open -= 0.10

    if lead_source == "ColdList":
        p_open -= 0.08
    elif lead_source == "Referral":
        p_open += 0.05

    if timezone_region == "US":
        p_open += 0.02

    return clamp(p_open, 0.02, 0.95)


def reply_probability(
    email_opened,
    role,
    company_size,
    lead_source,
    past_reply_rate,
    day_of_week,
    send_hour,
):
    # Reply depends heavily on whether the email was opened.
    p_reply = 0.02 + (0.55 * past_reply_rate)
    if email_opened == 0:
        p_reply *= 0.15

    if role in ("CTO", "VP Sales"):
        p_reply += 0.07
    if lead_source == "Referral":
        p_reply += 0.10
    if lead_source == "ColdList":
        p_reply -= 0.06
    if company_size == "enterprise":
        p_reply -= 0.05

    if day_of_week in ("Tuesday", "Wednesday", "Thursday") and 9 <= send_hour <= 11:
        p_reply += 0.04

    return clamp(p_reply, 0.005, 0.75)


def main():
    random.seed(42)
    rows = []

    for _ in range(5000):
        (
            role,
            industry,
            company_size,
            lead_source,
            day_of_week,
            send_hour,
            timezone_region,
        ) = sample_lead_profile()

        past_open_rate, past_reply_rate = generate_behavior_features(
            lead_source, role, company_size
        )

        p_open = open_probability(
            day_of_week, send_hour, timezone_region, lead_source, past_open_rate
        )
        email_opened = 1 if random.random() < p_open else 0

        p_reply = reply_probability(
            email_opened,
            role,
            company_size,
            lead_source,
            past_reply_rate,
            day_of_week,
            send_hour,
        )
        email_replied = 1 if random.random() < p_reply else 0

        rows.append(
            [
                role,
                industry,
                company_size,
                lead_source,
                day_of_week,
                send_hour,
                timezone_region,
                past_open_rate,
                past_reply_rate,
                email_opened,
                email_replied,
            ]
        )

    df = pd.DataFrame(
        rows,
        columns=[
            "role",
            "industry",
            "company_size",
            "lead_source",
            "day_of_week",
            "send_hour",
            "timezone_region",
            "past_open_rate",
            "past_reply_rate",
            "email_opened",
            "email_replied",
        ],
    )

    df.to_csv("send_time_dataset.csv", index=False)
    print(df.head(10))


if __name__ == "__main__":
    main()
