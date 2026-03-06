import joblib
import pandas as pd

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split


DATASET_PATH = "send_time_dataset.csv"
MODEL_PATH = "send_time_model.pkl"
FEATURE_COLUMNS_PATH = "send_time_feature_columns.pkl"

CATEGORICAL_COLUMNS = [
    "role",
    "industry",
    "company_size",
    "lead_source",
    "day_of_week",
    "timezone_region",
]

TARGET_COLUMN = "email_replied"

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
HOURS = list(range(24))


def load_dataset(path=DATASET_PATH):
    df = pd.read_csv(path)
    return df


def prepare_features(df):
    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN].astype(int)
    X_encoded = pd.get_dummies(X, columns=CATEGORICAL_COLUMNS, dtype=int)
    feature_columns = X_encoded.columns.tolist()
    return X_encoded, y, feature_columns


def build_models():
    models = {
        "Logistic Regression": LogisticRegression(max_iter=2000),
        "Random Forest": RandomForestClassifier(
            n_estimators=300,
            random_state=42,
            n_jobs=1,
            class_weight="balanced",
        ),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
    }
    try:
        from xgboost import XGBClassifier

        models["XGBoost"] = XGBClassifier(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            n_jobs=1,
            random_state=42,
            eval_metric="logloss",
        )
    except Exception:
        pass
    return models


def evaluate_model(model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    report = classification_report(y_test, y_pred, digits=4, zero_division=0)

    return {
        "model": model,
        "accuracy": accuracy,
        "roc_auc": roc_auc,
        "classification_report": report,
    }


def print_feature_importance(model, feature_columns, top_n=15):
    importances = None

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = abs(model.coef_[0])

    if importances is None:
        print("\nFeature importance not available for this model.")
        return

    importance_df = (
        pd.DataFrame({"feature": feature_columns, "importance": importances})
        .sort_values("importance", ascending=False)
        .head(top_n)
    )
    print("\nTop Feature Importance:")
    print(importance_df.to_string(index=False))


def align_features(input_df, feature_columns):
    encoded = pd.get_dummies(input_df, columns=CATEGORICAL_COLUMNS, dtype=int)
    aligned = encoded.reindex(columns=feature_columns, fill_value=0)
    return aligned


def predict_best_send_time(lead_features, model, feature_columns):
    best_day = None
    best_hour = None
    best_probability = -1.0

    for day in DAYS:
        for hour in HOURS:
            candidate = dict(lead_features)
            candidate["day_of_week"] = day
            candidate["send_hour"] = hour

            candidate_df = pd.DataFrame([candidate])
            candidate_aligned = align_features(candidate_df, feature_columns)
            prob = model.predict_proba(candidate_aligned)[0, 1]

            if prob > best_probability:
                best_probability = prob
                best_day = day
                best_hour = hour

    return {
        "best_day_of_week": best_day,
        "best_send_hour": best_hour,
        "predicted_reply_probability": round(float(best_probability), 4),
    }


def main():
    df = load_dataset(DATASET_PATH)
    print(f"Loaded dataset: {df.shape}")

    X_encoded, y, feature_columns = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded, y, test_size=0.2, random_state=42, stratify=y
    )

    models = build_models()
    results = {}

    for name, model in models.items():
        result = evaluate_model(model, X_train, y_train, X_test, y_test)
        results[name] = result

        print(f"\n{name}")
        print(f"Accuracy: {result['accuracy']:.4f}")
        print(f"ROC-AUC : {result['roc_auc']:.4f}")
        print("Classification Report:")
        print(result["classification_report"])

    best_model_name = max(results, key=lambda m: results[m]["roc_auc"])
    best_result = results[best_model_name]
    best_model = best_result["model"]

    print(f"\nBest model selected (by ROC-AUC): {best_model_name}")
    print(
        f"Best Accuracy: {best_result['accuracy']:.4f} | "
        f"Best ROC-AUC: {best_result['roc_auc']:.4f}"
    )

    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(feature_columns, FEATURE_COLUMNS_PATH)
    print(f"Saved model to: {MODEL_PATH}")
    print(f"Saved feature columns to: {FEATURE_COLUMNS_PATH}")

    print_feature_importance(best_model, feature_columns, top_n=15)

    sample_lead = {
        "role": "CTO",
        "industry": "SaaS",
        "company_size": "medium",
        "lead_source": "Referral",
        "timezone_region": "US",
        "past_open_rate": 0.62,
        "past_reply_rate": 0.28,
    }

    best_time = predict_best_send_time(sample_lead, best_model, feature_columns)
    print("\nBest send time for sample lead:")
    print(best_time)


if __name__ == "__main__":
    main()
