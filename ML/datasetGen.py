import pandas as pd
import random

roles = ["CTO","CEO","VP Sales","Engineering Manager","Marketing Manager","HR Director","Founder"]
industries = ["Fintech","SaaS","Healthcare","Ecommerce","AI","Cybersecurity"]
company_sizes = ["small","medium","large","enterprise"]
seniority_levels = ["Junior","Mid","Senior","Executive"]
lead_sources = ["LinkedIn","ColdList","Referral","Conference","Inbound"]

role_weight = {
"CTO":0.15,"CEO":0.12,"Founder":0.18,"VP Sales":0.10,
"Engineering Manager":0.05,"Marketing Manager":0.03,"HR Director":-0.02
}

industry_weight = {
"Fintech":0.08,"AI":0.10,"SaaS":0.07,
"Cybersecurity":0.06,"Healthcare":0.02,"Ecommerce":0.04
}

company_size_weight = {
"small":0.10,"medium":0.05,"large":-0.02,"enterprise":-0.05
}

lead_source_weight = {
"Referral":0.25,"Inbound":0.20,"Conference":0.12,
"LinkedIn":0.05,"ColdList":-0.10
}

data = []

for i in range(1000):

    role = random.choice(roles)
    industry = random.choice(industries)
    company_size = random.choice(company_sizes)
    seniority = random.choice(seniority_levels)
    lead_source = random.choice(lead_sources)
    growth_rate = round(random.uniform(0.01,0.30),2)

    prob = 0.20

    prob += role_weight[role]
    prob += industry_weight[industry]
    prob += company_size_weight[company_size]
    prob += lead_source_weight[lead_source]

    if growth_rate > 0.20:
        prob += 0.10
    elif growth_rate > 0.10:
        prob += 0.05

    prob = max(0.02, min(prob,0.95))

    reply = 1 if random.random() < prob else 0

    data.append([
        role,industry,company_size,growth_rate,seniority,lead_source,reply
    ])

df = pd.DataFrame(data,columns=[
"role","industry","company_size","growth_rate","seniority","lead_source","reply"
])

df.to_csv("lead_scoring_dataset.csv",index=False)

print("Dataset generated:",df.shape)