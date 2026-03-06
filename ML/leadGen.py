import pandas as pd
import random

roles = ["CTO","CEO","VP Sales","Engineering Manager","Marketing Manager","HR Director","Founder"]
industries = ["Fintech","SaaS","Healthcare","Ecommerce","AI","Cybersecurity"]
company_sizes = ["small","medium","large","enterprise"]
seniority_levels = ["Junior","Mid","Senior","Executive"]
lead_sources = ["LinkedIn","ColdList","Referral","Conference","Inbound"]

first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
company_suffixes = ["Inc.", "LLC", "Corp", "Solutions", "Technologies", "Group", "Systems"]

data = []

# Generate 50 test leads
for i in range(50):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    name = f"{first_name} {last_name}"

    company_name = f"{last_name} {random.choice(company_suffixes)}"
    domain = company_name.split(" ")[0].lower() + ".com"
    email = f"{first_name.lower()}.{last_name.lower()}@{domain}"

    role = random.choice(roles)
    industry = random.choice(industries)
    company_size = random.choice(company_sizes)
    seniority = random.choice(seniority_levels)
    lead_source = random.choice(lead_sources)
    growth_rate = round(random.uniform(0.01,0.30),2)

    data.append([
        name,
        email,
        company_name,
        role,
        industry,
        company_size,
        growth_rate,
        seniority,
        lead_source
    ])

df = pd.DataFrame(data, columns=[
"name",
"email",
"company",
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
