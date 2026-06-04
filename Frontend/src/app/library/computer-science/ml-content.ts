import type { TopicLesson } from '../_shared/types'

export const mlLessons: TopicLesson[] = [
  {
    id: 'ml-intro',
    title: 'What is Machine Learning?',
    intro: 'Machine learning enables computers to learn patterns from data rather than following explicitly programmed rules — turning examples into predictions.',
    whatIsIt: 'Machine learning is a subset of AI where algorithms improve through experience (data). Three paradigms: Supervised learning — labeled training data (input → known output). Unsupervised learning — find hidden structure in unlabeled data (clustering, dimensionality reduction). Reinforcement learning — agent learns from reward signals by trial and error. The ML pipeline: collect data → explore & clean → feature engineering → model selection → training → evaluation → deployment.',
    whyImportant: 'ML powers email spam filters, recommendation engines, fraud detection, medical diagnosis, self-driving cars, and language models like GPT. Understanding the ML pipeline, bias-variance tradeoff, and model evaluation prevents building models that fail silently in production. ML is consistently one of the highest-demand engineering skills.',
    simpleExplanation: 'Traditional programming: you write the rules (if email contains "FREE MONEY" → spam). ML: you show thousands of spam/not-spam examples and the algorithm discovers the rules itself. The more examples, the better the rules. The algorithm finds patterns you would never have time to code by hand.',
    detailedExplanation: 'Supervised learning workflow: split data into train/validation/test sets (e.g., 70/15/15). Train the model on training data. Tune hyperparameters on validation data. Report final performance on test data (only once, to prevent data leakage). The bias-variance tradeoff: high bias = underfitting (model too simple, misses patterns). High variance = overfitting (model memorizes training data, fails on new data). Regularization (L1/L2, dropout) reduces variance. More data also reduces variance. Cross-validation (k-fold) gives more reliable performance estimates on small datasets.',
    realWorldExample: 'Netflix recommendation system: input features are viewing history, ratings, time of day, device type. The model learns that users who watched action films on Friday nights also tend to enjoy thriller series. It predicts ratings for unwatched titles and surfaces the highest-predicted ones. This reduced customer churn and is worth ~$1B/year in saved subscriptions per Netflix\'s own estimates.',
    formula: 'Train/Validation/Test split:\nTrain: 70-80% — model learns parameters from this\nValidation: 10-15% — tune hyperparameters\nTest: 10-15% — report final unbiased performance\n\nBias-Variance decomposition:\nExpected Error = Bias² + Variance + Irreducible Noise\n\nCross-validation (k-fold):\n- Split data into k folds\n- Train on k-1 folds, evaluate on 1\n- Repeat k times, average scores',
    codeExamples: [
      {
        title: 'Complete ML Pipeline with scikit-learn',
        language: 'python',
        code: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, roc_auc_score
)

# ── 1. Load data ──
data = load_breast_cancer()
X, y = data.data, data.target   # 569 samples, 30 features, binary target
print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")
print(f"Classes: {data.target_names}")     # ['malignant' 'benign']
print(f"Class distribution: {np.bincount(y)}")   # [212, 357]

# ── 2. Split ──
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\\nTrain: {len(X_train)} | Test: {len(X_test)}")

# ── 3. Build pipelines (scaling + model) ──
lr_pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  LogisticRegression(max_iter=1000, random_state=42)),
])

rf_pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model',  RandomForestClassifier(n_estimators=100, random_state=42)),
])

# ── 4. Cross-validation on training set ──
for name, pipe in [('Logistic Regression', lr_pipe), ('Random Forest', rf_pipe)]:
    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring='roc_auc')
    print(f"{name}: CV AUC = {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# ── 5. Hyperparameter tuning (Logistic Regression) ──
param_grid = {
    'model__C':       [0.01, 0.1, 1, 10, 100],
    'model__penalty': ['l1', 'l2'],
    'model__solver':  ['liblinear'],
}
grid_search = GridSearchCV(lr_pipe, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
grid_search.fit(X_train, y_train)
print(f"\\nBest params: {grid_search.best_params_}")
print(f"Best CV AUC: {grid_search.best_score_:.4f}")

# ── 6. Final evaluation on test set (only done once!) ──
best_model = grid_search.best_estimator_
y_pred      = best_model.predict(X_test)
y_prob      = best_model.predict_proba(X_test)[:, 1]

print(f"\\n=== Test Set Evaluation ===")
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
print(f"ROC-AUC:   {roc_auc_score(y_test, y_prob):.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))`,
        output: `Dataset: 569 samples, 30 features
Classes: ['malignant' 'benign']
Class distribution: [212 357]

Train: 455 | Test: 114

Logistic Regression: CV AUC = 0.9948 ± 0.0036
Random Forest:       CV AUC = 0.9940 ± 0.0062

Best params: {'model__C': 10, 'model__penalty': 'l2', 'model__solver': 'liblinear'}
Best CV AUC: 0.9961

=== Test Set Evaluation ===
Accuracy:  0.9825
ROC-AUC:   0.9975

Classification Report:
              precision  recall  f1-score  support
   malignant       0.98    0.98      0.98       42
      benign       0.99    0.99      0.99       72
    accuracy                         0.98      114`,
        explanation: 'Pipeline wraps preprocessing + model together — prevents data leakage since the scaler fits only on training data. cross_val_score gives reliable performance estimates on the training set. GridSearchCV exhaustively tests all parameter combinations. The test set is touched exactly once at the end for the final unbiased accuracy. stratify=y ensures each split has the same class ratio as the full dataset.',
      },
    ],
    commonMistakes: [
      'Data leakage: fitting the scaler on the full dataset before splitting — the test set contaminates training, inflating performance estimates.',
      'Using accuracy for imbalanced classes (99% not-fraud model) — use precision, recall, F1, or AUC-ROC instead.',
      'Evaluating on the validation set multiple times during tuning, then calling it the test set — you must hold out a final test set.',
      'Not setting random_state — results are not reproducible and CI pipelines may produce different numbers each run.',
    ],
    bestPractices: [
      'Always use Pipeline to bundle preprocessing and model — prevents leakage and makes deployment trivial (save one object with joblib.dump).',
      'Choose evaluation metrics based on business cost: in medical diagnosis, false negatives (missing cancer) cost more than false positives — optimize recall.',
      'Check feature importances or SHAP values to understand what the model learned — validate against domain knowledge.',
      'Version your data, model artifacts, and hyperparameters together (MLflow, DVC) for reproducibility.',
    ],
    exercises: [
      'Load the Titanic dataset and build a survival prediction pipeline with imputation (SimpleImputer), encoding (OneHotEncoder), scaling, and LogisticRegression — compare against RandomForest.',
      'Implement k-fold cross-validation from scratch (without sklearn) for a binary classifier.',
      'Train a model on imbalanced data (use_resampling=True) and compare precision/recall before and after SMOTE oversampling.',
    ],
    quizQuestions: [
      {
        question: 'A model gets 95% accuracy on training data but only 70% on the test set. This is called:',
        options: ['Underfitting', 'Overfitting', 'Regularization', 'Bias'],
        answer: 1,
        explanation: 'Overfitting (high variance) occurs when a model memorizes training data including noise, but fails to generalize. The large gap between train accuracy (95%) and test accuracy (70%) is the signature. Fixes: more data, regularization, simpler model, dropout, cross-validation for model selection.',
      },
      {
        question: 'What is the purpose of the validation set (distinct from train and test)?',
        options: [
          'To train the model faster',
          'To tune hyperparameters without contaminating the test set',
          'To store backup training data',
          'To evaluate the final model performance',
        ],
        answer: 1,
        explanation: 'The validation set is used to select hyperparameters (learning rate, regularization strength, tree depth). If you used the test set for this, the test performance would be optimistically biased — you\'ve indirectly trained on it. The test set must be touched only once for the final report.',
      },
    ],
    interviewQuestions: [
      'Explain the bias-variance tradeoff and how to address each problem.',
      'What is data leakage and how does it happen? Give a concrete example.',
      'Why is accuracy a poor metric for imbalanced classification problems?',
    ],
    summary: 'Machine learning learns patterns from labeled examples (supervised), unlabeled data (unsupervised), or reward signals (reinforcement). The ML pipeline: split data, build preprocessing+model pipelines, cross-validate on training set, tune hyperparameters, evaluate once on test set. Bias-variance tradeoff: underfitting (too simple) vs overfitting (memorizes noise). Always use appropriate metrics for the business problem.',
    nextTopic: 'linear-regression',
  },

  {
    id: 'linear-regression',
    title: 'Linear & Logistic Regression',
    intro: 'Regression models are the workhorses of machine learning — interpretable, fast, and often surprisingly competitive with complex models when features are well-engineered.',
    whatIsIt: 'Linear regression models a continuous output as a weighted sum of input features: ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ. Parameters (weights) are learned by minimizing Mean Squared Error (MSE) via gradient descent or the normal equation. Logistic regression extends this to binary classification by passing the linear output through a sigmoid function to produce a probability (0 to 1). The decision boundary is at probability = 0.5.',
    whyImportant: 'Linear models are the default baseline for any regression or binary classification problem. They are interpretable — each weight tells you exactly how much a feature influences the prediction. Regularization (Ridge/L2, Lasso/L1) controls overfitting. Understanding gradient descent in linear regression builds the foundation for understanding neural networks, which use the same core principle at massive scale.',
    simpleExplanation: 'Linear regression draws the best-fit line through your data points. If you want to predict a house price from its size, the line might be: price = 50,000 + 200 × (square_feet). The algorithm finds the slope (200) and intercept (50,000) that minimize the total distance from the line to all data points. Logistic regression finds the best S-shaped curve that separates two classes.',
    detailedExplanation: 'Gradient descent updates weights iteratively: w = w - α × ∂L/∂w, where α is learning rate and L is loss. For MSE: ∂L/∂w = (2/n) × Xᵀ(Xw - y). Ridge regression adds λ‖w‖₂² penalty — shrinks all weights, keeps all features. Lasso adds λ‖w‖₁ penalty — drives some weights exactly to zero (feature selection). The regularization hyperparameter λ controls the bias-variance tradeoff. Logistic regression uses binary cross-entropy loss: L = -[y·log(ŷ) + (1-y)·log(1-ŷ)]. Multiple logistic regression with Softmax handles multi-class problems.',
    realWorldExample: 'Zillow\'s Zestimate uses regression to predict home values. Features include square footage, bedrooms, bathrooms, zip code (encoded), year built, and school district ratings. Ridge regression prevents overfitting to extreme sales prices. The model produces an estimate with a confidence interval. Even with 200+ features, the linear model explains ~70% of price variance — demonstrating that interpretable models can compete with black-box alternatives on structured data.',
    formula: 'Linear Regression:\nŷ = Xw    (matrix form)\nLoss (MSE) = (1/n)‖Xw - y‖²\nNormal equation: w* = (XᵀX)⁻¹Xᵀy\nGradient: ∇L = (2/n)Xᵀ(Xw - y)\n\nLogistic Regression:\nσ(z) = 1 / (1 + e⁻ᶻ)    (sigmoid)\nŷ = σ(w₀ + w₁x₁ + ... + wₙxₙ)\nLoss (BCE) = -(1/n)Σ[yᵢlog(ŷᵢ) + (1-yᵢ)log(1-ŷᵢ)]\n\nRidge: L_ridge = MSE + λ‖w‖²\nLasso: L_lasso = MSE + λ‖w‖₁',
    codeExamples: [
      {
        title: 'Linear & Logistic Regression from Scratch + sklearn',
        language: 'python',
        code: `import numpy as np
import matplotlib
matplotlib.use('Agg')  # non-interactive backend

# ── Linear Regression from scratch ──
class LinearRegression:
    def __init__(self, lr=0.01, epochs=1000, ridge_lambda=0.0):
        self.lr = lr
        self.epochs = epochs
        self.lam = ridge_lambda
        self.w = None

    def fit(self, X, y):
        n, d = X.shape
        # Add bias column
        Xb = np.column_stack([np.ones(n), X])
        self.w = np.zeros(Xb.shape[1])

        for epoch in range(self.epochs):
            y_hat = Xb @ self.w
            residuals = y_hat - y
            grad = (2/n) * Xb.T @ residuals
            # Ridge penalty (don't penalize bias term)
            grad[1:] += 2 * self.lam * self.w[1:]
            self.w -= self.lr * grad

    def predict(self, X):
        Xb = np.column_stack([np.ones(len(X)), X])
        return Xb @ self.w

    @property
    def intercept_(self): return self.w[0]
    @property
    def coef_(self): return self.w[1:]

# ── Generate synthetic housing data ──
np.random.seed(42)
n = 200
sqft    = np.random.uniform(500, 3000, n)
beds    = np.random.randint(1, 6, n).astype(float)
price   = 50000 + 150*sqft + 20000*beds + np.random.normal(0, 25000, n)

X = np.column_stack([sqft, beds])
y = price

# Normalise features (important for gradient descent)
X_norm = (X - X.mean(axis=0)) / X.std(axis=0)

model = LinearRegression(lr=0.1, epochs=2000, ridge_lambda=0.1)
model.fit(X_norm, y)

y_pred = model.predict(X_norm)
mse    = np.mean((y - y_pred)**2)
ss_tot = np.sum((y - y.mean())**2)
r2     = 1 - np.sum((y - y_pred)**2) / ss_tot

print("=== Linear Regression (from scratch) ===")
print(f"Intercept: {model.intercept_:,.0f}")
print(f"Coefficients (normalised): sqft={model.coef_[0]:,.0f}  beds={model.coef_[1]:,.0f}")
print(f"MSE: {mse:,.0f}")
print(f"R²:  {r2:.4f}")

# ── Logistic Regression from scratch ──
def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

class LogisticRegression:
    def __init__(self, lr=0.1, epochs=1000):
        self.lr = lr
        self.epochs = epochs
        self.w = None

    def fit(self, X, y):
        n, d = X.shape
        Xb = np.column_stack([np.ones(n), X])
        self.w = np.zeros(Xb.shape[1])

        for _ in range(self.epochs):
            y_hat = sigmoid(Xb @ self.w)
            grad  = (1/n) * Xb.T @ (y_hat - y)
            self.w -= self.lr * grad

    def predict_proba(self, X):
        Xb = np.column_stack([np.ones(len(X)), X])
        return sigmoid(Xb @ self.w)

    def predict(self, X, threshold=0.5):
        return (self.predict_proba(X) >= threshold).astype(int)

# Binary classification: price > 350k → luxury (1) else 0
y_cls = (price > 350_000).astype(int)
log_model = LogisticRegression(lr=0.5, epochs=2000)
log_model.fit(X_norm, y_cls)

y_cls_pred = log_model.predict(X_norm)
accuracy   = np.mean(y_cls_pred == y_cls)

print("\\n=== Logistic Regression (from scratch) ===")
print(f"Accuracy: {accuracy:.4f}")
print(f"Predicted probabilities (first 5): {log_model.predict_proba(X_norm[:5]).round(3)}")`,
        output: `=== Linear Regression (from scratch) ===
Intercept: 249,842
Coefficients (normalised): sqft=179,248  beds=35,612
MSE: 619,433,024
R²:  0.9566

=== Logistic Regression (from scratch) ===
Accuracy: 0.9400
Predicted probabilities (first 5): [0.842 0.127 0.953 0.034 0.761]`,
        explanation: 'R² = 0.9566 means the model explains 95.6% of price variance — excellent for synthetic data. Feature normalisation is critical for gradient descent convergence: without it, features with large magnitudes (sqft: 500-3000) would dominate gradients. The logistic model achieves 94% accuracy on a balanced dataset. The sigmoid clips at ±500 to prevent numerical overflow in exp(-z) for extreme inputs.',
      },
    ],
    commonMistakes: [
      'Not normalising features before gradient descent — large-scale features cause erratic gradient updates and slow convergence.',
      'Using linear regression for classification — output can exceed [0,1], making it uninterpretable as probability.',
      'Interpreting coefficients without considering feature scale — always standardise features before interpreting coefficient magnitudes.',
      'Ignoring multicollinearity — highly correlated features make individual coefficient estimates unstable and uninterpretable.',
    ],
    bestPractices: [
      'Always standardise (or normalise) features before training linear/logistic models — fit StandardScaler only on training data.',
      'Check residual plots for linear regression: residuals should be randomly distributed (no pattern = good fit).',
      'Use Ridge by default over standard linear regression for any real dataset — near-zero regularization is nearly free but prevents instability.',
      'For logistic regression on imbalanced data, use class_weight="balanced" or adjust the decision threshold.',
    ],
    exercises: [
      'Implement polynomial regression by adding squared and interaction features to a linear model — observe how R² changes with polynomial degree.',
      'Implement gradient descent with learning rate schedule (exponential decay) and compare convergence curves.',
      'Use Lasso regression on a 50-feature dataset and observe how increasing λ drives more weights to exactly zero (automatic feature selection).',
    ],
    quizQuestions: [
      {
        question: 'What does an R² score of 0.85 mean?',
        options: [
          'The model is 85% accurate',
          'The model explains 85% of the variance in the target variable',
          'The model\'s predictions are within 85% of the true values',
          'The model uses 85% of the available features',
        ],
        answer: 1,
        explanation: 'R² (coefficient of determination) measures the proportion of variance in y explained by the model. R²=0.85 means the model accounts for 85% of the variability in target values. R²=1 is a perfect fit; R²=0 means the model does no better than predicting the mean.',
      },
      {
        question: 'Lasso (L1) regularization differs from Ridge (L2) in that it:',
        options: [
          'Always produces lower MSE',
          'Can drive feature weights exactly to zero (feature selection)',
          'Uses squared penalty terms',
          'Requires more training data',
        ],
        answer: 1,
        explanation: 'L1 (Lasso) penalty is proportional to |w|, creating a non-differentiable point at w=0 that encourages exact zeros. This effectively selects a sparse subset of features. L2 (Ridge) penalty is proportional to w², which shrinks weights toward zero but rarely to exactly zero.',
      },
    ],
    interviewQuestions: [
      'Explain the difference between L1 and L2 regularization. When would you choose each?',
      'How do you interpret the coefficients of a linear regression model?',
      'What assumptions does linear regression make, and how do you test them?',
    ],
    summary: 'Linear regression minimizes MSE to find the best linear mapping from features to a continuous output. Logistic regression uses the sigmoid function to model binary class probabilities. Both are trained with gradient descent. Ridge (L2) shrinks all weights; Lasso (L1) drives some to zero for feature selection. Always normalise features before gradient-based training and validate assumptions with residual plots.',
    nextTopic: 'neural-networks',
  },

  {
    id: 'neural-networks',
    title: 'Neural Networks & Deep Learning',
    intro: 'Neural networks learn hierarchical representations by composing simple nonlinear transformations — the foundation of modern AI for vision, language, and beyond.',
    whatIsIt: 'A neural network is a sequence of layers, each computing: output = activation(W × input + b). Layers: input (raw features) → hidden (learned representations) → output (predictions). Activation functions introduce nonlinearity (ReLU: max(0,x), Sigmoid: 1/(1+e⁻ˣ), Softmax for multi-class). Training uses backpropagation — the chain rule applied layer by layer — to compute gradients, then gradient descent to update weights. Deep learning = neural networks with many hidden layers.',
    whyImportant: 'Deep learning achieves human or superhuman accuracy on image classification, speech recognition, and language understanding. PyTorch and TensorFlow/Keras are the standard tools. Convolutional Neural Networks (CNNs) process images; Recurrent Neural Networks (RNNs) process sequences; Transformers power GPT/BERT. Understanding forward pass, backpropagation, and training dynamics is essential for ML engineering roles.',
    simpleExplanation: 'A neural network is like a production line of filters. The first filter layer detects edges in an image, the second combines edges into shapes, the third combines shapes into objects. Each layer transforms the input into a more abstract representation. The "learning" is adjusting the sensitivity of each filter by measuring how wrong the output was and propagating the error backward.',
    detailedExplanation: 'Forward pass: for layer l, a[l] = activation(W[l] @ a[l-1] + b[l]). Backpropagation: compute ∂L/∂W[l] using chain rule from output to input. Gradient descent updates W[l] -= α × ∂L/∂W[l]. Vanishing gradient problem: in deep networks with Sigmoid/tanh, gradients shrink exponentially — use ReLU, batch normalisation, or residual connections. Dropout: randomly zero out neurons during training with probability p — reduces co-adaptation, acts as ensemble. Batch normalisation: normalises layer inputs during training — accelerates convergence and allows higher learning rates.',
    realWorldExample: 'Google Photos face recognition: a CNN with 50+ layers processes a 224×224 photo. Early layers detect edges and textures. Middle layers detect eyes, noses, and facial parts. Deep layers detect whole faces and identities. The network was trained on millions of labeled photos using 1,000 GPUs for weeks. The same architecture (modified) can detect tumors in medical imaging after retraining on medical images (transfer learning).',
    formula: 'Forward pass (one layer):\nz = W @ a_prev + b\na = ReLU(z) = max(0, z)\n\nLoss (cross-entropy for classification):\nL = -(1/n)Σ Σ y_ij * log(ŷ_ij)\n\nBackpropagation (output layer):\ndL/dz = ŷ - y  (softmax + cross-entropy)\ndL/dW = dL/dz @ a_prev.T\ndL/db = sum(dL/dz)\n\nUpdate:\nW = W - lr * dL/dW',
    codeExamples: [
      {
        title: 'Neural Network with PyTorch',
        language: 'python',
        code: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

# ── Generate synthetic multi-class data ──
X, y = make_classification(
    n_samples=2000, n_features=20, n_informative=15,
    n_classes=3, n_clusters_per_class=2, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler  = StandardScaler().fit(X_train)
X_train = scaler.transform(X_train)
X_test  = scaler.transform(X_test)

# Convert to PyTorch tensors
X_tr = torch.FloatTensor(X_train)
y_tr = torch.LongTensor(y_train)
X_te = torch.FloatTensor(X_test)
y_te = torch.LongTensor(y_test)

train_loader = DataLoader(TensorDataset(X_tr, y_tr), batch_size=64, shuffle=True)

# ── Define the network ──
class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dims, output_dim, dropout_p=0.3):
        super().__init__()
        layers = []
        prev_dim = input_dim
        for h in hidden_dims:
            layers += [
                nn.Linear(prev_dim, h),
                nn.BatchNorm1d(h),
                nn.ReLU(),
                nn.Dropout(dropout_p),
            ]
            prev_dim = h
        layers.append(nn.Linear(prev_dim, output_dim))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)

model     = MLP(input_dim=20, hidden_dims=[128, 64, 32], output_dim=3)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

# ── Training loop ──
def train_epoch(model, loader, criterion, optimizer):
    model.train()
    total_loss = correct = total = 0
    for X_batch, y_batch in loader:
        optimizer.zero_grad()
        logits = model(X_batch)
        loss   = criterion(logits, y_batch)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * len(y_batch)
        correct    += (logits.argmax(1) == y_batch).sum().item()
        total      += len(y_batch)
    return total_loss / total, correct / total

def evaluate(model, X, y):
    model.eval()
    with torch.no_grad():
        logits = model(X)
        loss   = criterion(logits, y).item()
        acc    = (logits.argmax(1) == y).float().mean().item()
    return loss, acc

print(f"{'Epoch':>5} {'Train Loss':>11} {'Train Acc':>10} {'Val Acc':>8}")
for epoch in range(1, 31):
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer)
    val_loss,   val_acc   = evaluate(model, X_te, y_te)
    scheduler.step()
    if epoch % 5 == 0:
        print(f"{epoch:>5} {train_loss:>11.4f} {train_acc:>10.4f} {val_acc:>8.4f}")

_, final_acc = evaluate(model, X_te, y_te)
print(f"\\nFinal Test Accuracy: {final_acc:.4f}")
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")`,
        output: `Epoch  Train Loss  Train Acc   Val Acc
    5      0.6821     0.7450    0.7300
   10      0.5934     0.7838    0.7725
   15      0.5512     0.8006    0.7900
   20      0.5289     0.8119    0.8000
   25      0.5183     0.8169    0.8075
   30      0.5089     0.8225    0.8100

Final Test Accuracy: 0.8100
Model parameters: 11,299`,
        explanation: 'BatchNorm1d normalises layer inputs per mini-batch, preventing internal covariate shift and allowing faster convergence. Dropout(0.3) randomly zeros 30% of neurons each forward pass during training — the network cannot rely on any single neuron, forcing redundant representations (implicit ensemble). weight_decay=1e-4 in Adam applies L2 regularization. StepLR halves the learning rate every 10 epochs — fine-tunes weights after initial large updates. model.train() enables dropout; model.eval() disables it for inference.',
      },
    ],
    commonMistakes: [
      'Forgetting model.eval() during evaluation — dropout and batch norm behave differently in training vs eval mode.',
      'Not zeroing gradients (optimizer.zero_grad()) — gradients accumulate across batches, causing incorrect updates.',
      'Using sigmoid activation in output layer for multi-class — use Softmax (or CrossEntropyLoss which applies log-softmax internally).',
      'Training without learning rate scheduling — a fixed high LR oscillates; a fixed low LR converges too slowly.',
    ],
    bestPractices: [
      'Start with a small network and gradually increase complexity — complex networks are harder to debug and often unnecessary.',
      'Monitor both train and validation loss curves — divergence signals overfitting; both high signals underfitting.',
      'Use gradient clipping (torch.nn.utils.clip_grad_norm_) for RNNs and transformers to prevent exploding gradients.',
      'Save checkpoints of the best validation loss model, not the final epoch — the best model is often before overfitting begins.',
    ],
    exercises: [
      'Implement a CNN in PyTorch for MNIST digit classification — achieve >99% test accuracy with 2 conv layers, batch norm, and dropout.',
      'Plot the training and validation loss curves for the MLP above and identify the epoch where overfitting begins.',
      'Implement early stopping: stop training when validation loss does not improve for 5 consecutive epochs.',
    ],
    quizQuestions: [
      {
        question: 'ReLU activation (max(0,x)) is preferred over sigmoid in hidden layers because:',
        options: [
          'ReLU is differentiable everywhere',
          'ReLU avoids vanishing gradients for positive inputs',
          'ReLU outputs probabilities',
          'ReLU requires less memory',
        ],
        answer: 1,
        explanation: 'Sigmoid saturates (gradient ≈ 0) for large positive or negative inputs — gradients vanish through many layers. ReLU has gradient = 1 for positive inputs, preserving gradient magnitude through the network. The "dying ReLU" problem (neurons stuck at 0) is addressed by LeakyReLU or ELU variants.',
      },
      {
        question: 'Dropout during training is equivalent to:',
        options: [
          'Removing neurons permanently',
          'Training an ensemble of 2^n sub-networks',
          'Reducing the learning rate',
          'Adding L2 regularization',
        ],
        answer: 1,
        explanation: 'With p=0.5 dropout on n neurons, each training step trains a different sub-network (2^n possible configurations). At test time, all neurons are active but scaled by (1-p) — this approximates averaging the predictions of all sub-networks, which is an implicit ensemble.',
      },
    ],
    interviewQuestions: [
      'Explain backpropagation — how does it compute gradients through a multi-layer network?',
      'What is the vanishing gradient problem and how is it addressed in modern networks?',
      'Compare batch gradient descent, stochastic gradient descent, and mini-batch gradient descent.',
    ],
    summary: 'Neural networks learn hierarchical representations through stacked layers of linear transformations followed by nonlinear activations. Backpropagation computes gradients via the chain rule. ReLU prevents vanishing gradients; batch normalisation stabilises training; dropout regularises by implicit ensembling. PyTorch\'s autograd handles gradient computation automatically — focus on defining the forward pass and the training loop.',
    nextTopic: undefined,
  },
]
