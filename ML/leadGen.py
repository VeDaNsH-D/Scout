import pandas as pd
import random

roles = ["CTO","CEO","VP Sales","Engineering Manager","Marketing Manager","HR Director","Founder"]
industries = ["Fintech","SaaS","Healthcare","Ecommerce","AI","Cybersecurity"]
company_sizes = ["small","medium","large","enterprise"]
seniority_levels = ["Junior","Mid","Senior","Executive"]
lead_sources = ["LinkedIn","ColdList","Referral","Conference","Inbound"]

data = []

# Generate 50 test leads
for i in range(50):

    role = random.choice(roles)
    industry = random.choice(industries)
    company_size = random.choice(company_sizes)
    seniority = random.choice(seniority_levels)
    lead_source = random.choice(lead_sources)
    growth_rate = round(random.uniform(0.01,0.30),2)

    data.append([
        role,
        industry,
        company_size,
        growth_rate,
        seniority,
        lead_source
    ])

df = pd.DataFrame(data, columns=[
"role",
"industry",
"company_size",
"growth_rate",
"seniority",
"lead_source"
])

df.to_csv("lead.csv", index=False)

print("Lead test dataset generated:", df.shape)
print(df.head())