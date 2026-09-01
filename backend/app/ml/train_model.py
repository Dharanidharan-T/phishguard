import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Add backend directory to sys.path if needed
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.utils.text_utils import clean_text

def train():
    dataset_path = os.path.join(BACKEND_DIR, "dataset", "CEAS_08.csv")
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset file not found at {dataset_path}")
        sys.exit(1)

    print(f"[+] Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    print(f"[+] Dataset shape: {df.shape}")
    print(f"[+] Columns: {df.columns.tolist()}")

    # Handle missing subject/body
    df['subject'] = df['subject'].fillna('')
    df['body'] = df['body'].fillna('')

    # Combine subject and body
    print("[+] Preprocessing combined subject + body text...")
    df['combined_text'] = (df['subject'].astype(str) + " " + df['body'].astype(str)).apply(clean_text)

    # Ensure binary label (0 = safe, 1 = phishing)
    y = df['label'].astype(int)
    X = df['combined_text']

    print(f"[+] Class distribution:\n{y.value_counts()}")

    # Train / Test split (80/20)
    print("[+] Splitting dataset into 80% train and 20% test...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # TF-IDF Vectorization
    print("[+] Fitting TF-IDF Vectorizer (max_features=30000, ngram_range=(1,2))...")
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=30000,
        ngram_range=(1, 2)
    )

    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # Logistic Regression Classifier
    print("[+] Training Logistic Regression classifier (max_iter=1000, class_weight='balanced')...")
    model = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    )

    model.fit(X_train_tfidf, y_train)

    # Evaluation
    print("[+] Evaluating model on test set...")
    y_pred = model.predict(X_test_tfidf)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print("\n==========================================")
    print("      MODEL TRAINING EVALUATION RESULTS   ")
    print("==========================================")
    print(f"Accuracy:        {acc * 100:.2f}%")
    print(f"Precision:       {prec * 100:.2f}%")
    print(f"Recall:          {rec * 100:.2f}%")
    print(f"F1 Score:        {f1 * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(cm)
    print("==========================================\n")

    # Save artifacts
    model_path = os.path.join(CURRENT_DIR, "model.pkl")
    vectorizer_path = os.path.join(CURRENT_DIR, "vectorizer.pkl")

    print(f"[+] Saving model to {model_path}...")
    joblib.dump(model, model_path)

    print(f"[+] Saving vectorizer to {vectorizer_path}...")
    joblib.dump(vectorizer, vectorizer_path)

    print("[+] Model training and artifact save completed successfully!")

if __name__ == "__main__":
    train()
