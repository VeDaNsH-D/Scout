import random
import pandas as pd

ROLES = ["CTO", "CEO", "Marketing Manager", "VP Sales", "Founder", "HR Director"]
INDUSTRIES = ["SaaS", "Fintech", "AI", "Healthcare", "Ecommerce"]
COMPANY_SIZES = ["small", "medium", "large", "enterprise"]
LEAD_SOURCES = ["LinkedIn", "Referral", "ColdList", "Conference", "Inbound"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
TIMEZONES = ["US", "Europe", "Asia"]
SENIORITY_LEVELS = ["junior", "mid", "senior", "executive"]


def clamp(value, low=0.01, high=0.95):
    return max(low, min(high, value))


def sample_lead_profile():
    return (
        random.choice(ROLES),
        random.choice(INDUSTRIES),
        random.choice(COMPANY_SIZES),
        random.choice(LEAD_SOURCES),
        random.choice(SENIORITY_LEVELS),
        round(random.uniform(0.0, 1.0), 3),
        random.choice(DAYS),
        random.randint(0, 23),
        random.choice(TIMEZONES),
    )


def generate_lead_score(role, seniority, company_size, lead_source, growth_rate):
    score = 0.18 + (0.28 * growth_rate)

    if role in ("CTO", "CEO", "Founder", "VP Sales"):
        score += 0.06
    if seniority == "executive":
        score += 0.06
    elif seniority == "senior":
        score += 0.03

    if lead_source == "Referral":
        score += 0.05
    elif lead_source == "Inbound":
        score += 0.03
    elif lead_source == "ColdList":
        score -= 0.03

    if company_size == "enterprise":
        score -= 0.02

    score += random.uniform(-0.04, 0.04)
    return round(clamp(score, 0.02, 0.98), 3)


def timing_segment(role, lead_source, timezone_region):
    return f"{role}|{lead_source}|{timezone_region}"


def preferred_day(role, company_size, lead_source, seniority):
    if role == "HR Director":
        return "Monday"
    if role == "CTO":
        return "Tuesday"
    if role == "CEO":
        return "Wednesday"
    if role == "Founder":
        return "Wednesday"
    if role == "Marketing Manager":
        return "Thursday"
    if role == "VP Sales":
        return "Thursday"

    if company_size == "enterprise":
        return "Tuesday"
    if lead_source == "Inbound":
        return "Thursday"
    if lead_source == "Referral":
        return "Wednesday"
    if seniority == "executive":
        return "Tuesday"
    return "Wednesday"


def preferred_hours(role, timezone_region, lead_source, company_size):
    if role == "CTO":
        hours = [8, 9]
    elif role == "CEO":
        hours = [8, 9, 10]
    elif role == "Founder":
        hours = [9, 10]
    elif role == "Marketing Manager":
        hours = [14, 15, 16]
    elif role == "VP Sales":
        hours = [10, 11]
    elif role == "HR Director":
        hours = [10, 11, 12]
    else:
        hours = [10, 11]

    if timezone_region == "Europe":
        hours = [min(h + 1, 23) for h in hours]
    elif timezone_region == "Asia":
        hours = [min(h + 2, 23) for h in hours]

    if lead_source == "Referral":
        hours = sorted(set(hours + [9, 10]))
    elif lead_source == "Inbound":
        hours = sorted(set(hours + [11, 12]))

    if company_size == "enterprise":
        hours = [h for h in hours if h <= 11] or hours

    return sorted(set(hours))


def day_distance(day_of_week, preferred):
    idx = {day: i for i, day in enumerate(DAYS)}
    return abs(idx[day_of_week] - idx[preferred])


def hour_distance(send_hour, preferred_hour_list):
    return min(abs(send_hour - h) for h in preferred_hour_list)


def reply_probability(
    role,
    seniority,
    company_size,
    lead_source,
    growth_rate,
    lead_score,
    day_of_week,
    send_hour,
    timezone_region,
):
    p = 0.08 + (0.12 * lead_score) + (0.06 * growth_rate)

    if seniority == "executive":
        p += 0.03
    elif seniority == "senior":
        p += 0.02

    if lead_source == "Referral":
        p += 0.05
    elif lead_source == "Inbound":
        p += 0.03
    elif lead_source == "ColdList":
        p -= 0.04

    if company_size == "enterprise":
        p -= 0.03

    pref_day = preferred_day(role, company_size, lead_source, seniority)
    pref_hours = preferred_hours(role, timezone_region, lead_source, company_size)

    d_day = day_distance(day_of_week, pref_day)
    d_hour = hour_distance(send_hour, pref_hours)

    if d_day == 0:
        p += 0.16
    elif d_day == 1:
        p += 0.05
    elif d_day >= 3:
        p -= 0.06

    if d_hour == 0:
        p += 0.18
    elif d_hour == 1:
        p += 0.08
    elif d_hour >= 4:
        p -= 0.07

    if role == "Marketing Manager" and send_hour < 11:
        p -= 0.08
    if role == "CTO" and send_hour > 13:
        p -= 0.08
    if role == "VP Sales" and send_hour > 15:
        p -= 0.06
    if role == "HR Director" and day_of_week == "Friday":
        p -= 0.06

    if lead_source == "ColdList" and day_of_week == "Monday":
        p -= 0.08
    if lead_source == "Referral" and day_of_week in ("Tuesday", "Wednesday"):
        p += 0.03
    if lead_source == "Inbound" and day_of_week == "Thursday":
        p += 0.03

    if send_hour < 7 or send_hour > 20:
        p -= 0.10
    elif send_hour < 8 or send_hour > 18:
        p -= 0.04

    if day_of_week in ("Saturday", "Sunday"):
        p -= 0.12

    p += random.uniform(-0.01, 0.01)
    return clamp(p)


def main():
    random.seed(42)
    rows = []

    for _ in range(6000):
        (
            role,
            industry,
            company_size,
            lead_source,
            seniority,
            growth_rate,
            day_of_week,
            send_hour,
            timezone_region,
        ) = sample_lead_profile()

        lead_score = generate_lead_score(
            role, seniority, company_size, lead_source, growth_rate
        )
        segment = timing_segment(role, lead_source, timezone_region)

        p_reply = reply_probability(
            role,
            seniority,
            company_size,
            lead_source,
            growth_rate,
            lead_score,
            day_of_week,
            send_hour,
            timezone_region,
        )

        email_replied = 1 if random.random() < p_reply else 0

        rows.append(
            [
                role,
                industry,
                company_size,
                lead_source,
                seniority,
                growth_rate,
                lead_score,
                segment,
                day_of_week,
                send_hour,
                timezone_region,
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
            "seniority",
            "growth_rate",
            "lead_score",
            "timing_segment",
            "day_of_week",
            "send_hour",
            "timezone_region",
            "email_replied",
        ],
    )

    df.to_csv("send_time_dataset.csv", index=False)
    print(df.head())


if __name__ == "__main__":
    main()
