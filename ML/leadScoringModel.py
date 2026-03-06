import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# ===============================
# 1. Load Dataset
# ===============================

df = pd.read_csv("lead_scoring_dataset.csv")

print("Dataset loaded:", df.shape)


# ===============================
# 2. Separate Features and Target
# ===============================

X = df.drop("reply", axis=1)
y = df["reply"]


# ===============================
# 3. Encode Categorical Features
# ===============================

X_encoded = pd.get_dummies(X)

# Save feature column structure
feature_columns = X_encoded.columns


# ===============================
# 4. Train-Test Split
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X_encoded,
    y,
    test_size=0.2,
    random_state=42
)


# ===============================
# 5. Train Multiple Models
# ===============================

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42)
}

model_scores = {}
trained_models = {}

for name, model in models.items():

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)

    model_scores[name] = acc
    trained_models[name] = model

    print(f"{name} Accuracy: {acc:.4f}")


# ===============================
# 6. Select Best Model
# ===============================

best_model_name = max(model_scores, key=model_scores.get)
best_model = trained_models[best_model_name]

print("\nBest Model:", best_model_name)


# ===============================
# 7. Save Model
# ===============================

joblib.dump(best_model, "lead_scoring_model.pkl")
joblib.dump(feature_columns, "feature_columns.pkl")

print("Model saved successfully.")


# ===============================
# 8. Show Top Factors
# ===============================

print("\nTop Factors Influencing Replies:")

if best_model_name == "Random Forest":

    importances = best_model.feature_importances_

    feature_importance = pd.DataFrame({
        "feature": feature_columns,
        "importance": importances
    })

elif best_model_name == "Logistic Regression":

    coefficients = best_model.coef_[0]

    feature_importance = pd.DataFrame({
        "feature": feature_columns,
        "importance": abs(coefficients)
    })


# Sort and reset index
feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
).reset_index(drop=True)


# Print top 10 features
print(feature_importance.head(10).to_string(index=False))


# ===============================
# 9. Feature Importance Graph
# ===============================

top10 = feature_importance.head(10)

plt.figure()
plt.barh(top10["feature"], top10["importance"])
plt.gca().invert_yaxis()
plt.title("Top Factors Influencing Replies")
plt.xlabel("Importance")
plt.ylabel("Feature")
plt.show()


# ============================================================
# 10. SYSTEM PIPELINE (COMMENTED OUT FOR INTEGRATION LATER)
# ============================================================

"""
# Example function that the automation system would call

def score_leads(input_file):

    # Load trained model
    model = joblib.load("lead_scoring_model.pkl")
    feature_columns = joblib.load("feature_columns.pkl")

    # Load leads uploaded by user
    leads = pd.read_csv(input_file)

    # Encode features
    leads_encoded = pd.get_dummies(leads)

    # Align with training features
    leads_encoded = leads_encoded.reindex(columns=feature_columns, fill_value=0)

    # Predict probabilities
    scores = model.predict_proba(leads_encoded)[:,1]

    # Attach lead score
    leads["lead_score"] = scores

    # Sort by score
    leads = leads.sort_values(by="lead_score", ascending=False)

    return leads


# Example usage in automation system

scored_leads = score_leads("lead.csv")

scored_leads.to_csv("scored_leads.csv", index=False)

print(scored_leads.head())
"""