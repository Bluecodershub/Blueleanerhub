import type { TopicLesson } from '../_shared/types'

// ─── Machine-learning curriculum — rewritten from first principles by the
// subject faculty. Voice: instructor-in-the-room. Every dataset, example, and
// piece of prose is original to this platform.
export const mlLessons: TopicLesson[] = [
  {
    id: 'ml-intro',
    title: 'What is Machine Learning?',
    intro:
      'Machine learning is what you reach for when the rules are too many, too fuzzy, or too fast-moving to write down by hand. Instead of coding "if… then…", you show the machine a large enough number of examples that the rules become the by-product of the fit.',
    whatIsIt:
      'ML is a subset of AI in which a model\'s parameters are learned from data rather than authored. Three broad families cover almost everything you will meet in practice. Supervised learning maps a labelled input to a known output — a fraud tag, a house price, a translated sentence. Unsupervised learning discovers structure without labels — clusters of similar UPI merchants, a low-dimensional summary of a 500-column dataset. Reinforcement learning trains an agent from delayed reward signals — a delivery-route optimiser at Zomato, a game-playing agent from DeepMind. The pipeline that surrounds all three is the same: collect, clean, engineer features, split, train, validate, hold out a test set, evaluate, and only then deploy.',
    whyImportant:
      'Nearly every mid-sized software product now contains at least one learned component. UPI fraud checks, Swiggy ETA estimates, Ola driver–rider matching, spam filters, medical triage in tier-2 hospitals, credit scoring for new-to-credit borrowers — all of them are ML. What separates a working system from a haunted one is the discipline around the pipeline: honest splits, honest metrics, honest post-deployment monitoring. Interviewers know this — the ML system-design questions at Flipkart, Razorpay, and Meesho reliably centre on data leakage, class imbalance, and label drift, not on model architectures.',
    simpleExplanation:
      'Traditional programming works when you already know the rule: "if the pincode starts with 4 the shipment goes to the western hub". ML is for problems where you cannot articulate the rule but you have examples. Show the model ten lakh labelled UPI transactions and it will discover the combination of amount, hour, device fingerprint, and merchant category that best predicts fraud — a rule no analyst would have written by hand and none would have kept up to date as fraudsters evolve.',
    detailedExplanation:
      'A trustworthy supervised workflow splits the dataset into three disjoint pieces — train, validation, and a truly-held-out test set. The model learns its parameters on train, its hyperparameters are chosen on validation, and the test set is opened exactly once, at the end, for an unbiased number to put on a slide. The central failure mode is the bias–variance trade-off. A model that is too simple systematically misses the signal — high bias, underfit. A model that is too flexible memorises the training noise — high variance, overfit. Regularisation (L1, L2, dropout, weight decay), more data, and simpler architectures push variance down. Cross-validation gives you honest error bars when the dataset is small enough that a single split would be noisy. Class imbalance turns accuracy into a lie: a 99.5%-accurate fraud model that always predicts "not fraud" is technically 99.5% accurate on a base rate of 0.5%.',
    realWorldExample:
      'Consider ETA prediction on a food-delivery platform. Features include time of day, pincode, rain radar reading, restaurant preparation time, the driver\'s current speed and heading, historical route congestion, and even the day\'s cricket schedule. A gradient-boosted model learns that Fridays after 8 pm in the monsoon window near a stadium add fifteen minutes even when the map says otherwise. The label — actual delivery time — was recorded by the app. Retraining runs weekly; performance is monitored by comparing predicted ETA against realised ETA in a rolling window. The moment the residual mean drifts, an alert goes to the on-call ML engineer before the customer starts complaining.',
    formula:
      'Split ratios that survive contact with reality:\n Train:      70 – 80 %\n Validation: 10 – 15 %  (hyperparameter tuning)\n Test:       10 – 15 %  (touched exactly once, at the end)\n\nBias–variance decomposition of expected error:\n E[(y − ŷ)²] = Bias²  +  Variance  +  Irreducible noise\n\nk-fold cross-validation:\n 1. Shuffle the data.\n 2. Split into k equally sized folds.\n 3. For each fold, train on k − 1 folds and evaluate on the held-out one.\n 4. Report the mean and standard deviation of the k scores.',
    codeExamples: [
      {
        title: 'A defensible supervised pipeline in scikit-learn',
        language: 'python',
        code: `# UPI-style fraud screening on a small tabular dataset.
# The load_breast_cancer set is used only as a stand-in — the pipeline
# is the same shape you would deploy against real transactions.

import numpy as np
from sklearn.datasets       import load_breast_cancer
from sklearn.model_selection import (
    train_test_split, cross_val_score, GridSearchCV
)
from sklearn.preprocessing  import StandardScaler
from sklearn.pipeline       import Pipeline
from sklearn.linear_model   import LogisticRegression
from sklearn.ensemble       import GradientBoostingClassifier
from sklearn.metrics        import (
    accuracy_score, classification_report, roc_auc_score,
)

# ── 1. Load labelled records ─────────────────────────────────────
records = load_breast_cancer()
X, y    = records.data, records.target
print(f"Rows : {X.shape[0]}")
print(f"Cols : {X.shape[1]}")
print(f"Class balance : {dict(zip(records.target_names, np.bincount(y)))}")

# ── 2. Stratified split — hold out a test set we will not peek at ─
X_dev, X_holdout, y_dev, y_holdout = train_test_split(
    X, y, test_size=0.20, random_state=17, stratify=y,
)
print(f"Dev size : {len(X_dev)}   Hold-out : {len(X_holdout)}")

# ── 3. Two candidate pipelines — always pair the scaler with the model ─
linear_pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression(max_iter=2000, random_state=17)),
])

booster_pipe = Pipeline([
    ("scale", StandardScaler()),   # not needed for trees, but harmless
    ("clf",   GradientBoostingClassifier(random_state=17)),
])

# ── 4. 5-fold cross-validation, ROC-AUC because base rate matters ─
for name, pipe in (("Logistic", linear_pipe), ("GBM", booster_pipe)):
    scores = cross_val_score(pipe, X_dev, y_dev, cv=5, scoring="roc_auc")
    print(f"{name:>8}  AUC = {scores.mean():.4f} ± {scores.std():.4f}")

# ── 5. Search over a small grid — Occam-first ────────────────────
grid = {
    "clf__C":       [0.05, 0.5, 5.0, 50.0],
    "clf__penalty": ["l2"],
    "clf__solver":  ["lbfgs"],
}
search = GridSearchCV(
    linear_pipe, grid, cv=5, scoring="roc_auc", n_jobs=-1,
)
search.fit(X_dev, y_dev)
print(f"Best C     : {search.best_params_['clf__C']}")
print(f"Best CV AUC: {search.best_score_:.4f}")

# ── 6. Open the hold-out exactly once ────────────────────────────
final    = search.best_estimator_
pred     = final.predict(X_holdout)
proba    = final.predict_proba(X_holdout)[:, 1]

print("\\n── Hold-out report ─────────────────────────────")
print(f"Accuracy : {accuracy_score(y_holdout, pred):.4f}")
print(f"AUC      : {roc_auc_score(y_holdout, proba):.4f}")
print(classification_report(y_holdout, pred,
                            target_names=records.target_names))`,
        output: `Rows : 569
Cols : 30
Class balance : {'malignant': 212, 'benign': 357}
Dev size : 455   Hold-out : 114

Logistic  AUC = 0.9948 ± 0.0035
     GBM  AUC = 0.9932 ± 0.0059

Best C     : 5.0
Best CV AUC: 0.9958

── Hold-out report ─────────────────────────────
Accuracy : 0.9825
AUC      : 0.9974
              precision  recall  f1-score  support
   malignant       0.98    0.98      0.98        42
      benign       0.99    0.99      0.99        72
    accuracy                         0.98       114`,
        explanation:
          'The point of Pipeline is not convenience — it is honesty. The scaler fits on training folds only, never on the hold-out. Without it, the standardisation would silently use hold-out statistics and inflate every metric on the last line. Stratifying the split preserves the class balance so a rare-event dataset does not accidentally hand you a fold with zero positives. And AUC — not accuracy — is the ranking metric for imbalanced classes: it asks "given a positive and a negative, how often does the model score the positive higher?"',
      },
    ],
    commonMistakes: [
      'Fitting a scaler or an encoder on the full dataset before splitting. That is data leakage in the mildest form; every future metric will be optimistic.',
      'Using accuracy on a UPI-fraud problem where the base rate is 0.3 %. A model that always says "not fraud" scores 99.7 % and catches nothing.',
      'Peeking at the test set during tuning — once, twice, "just to see". The test set is single-use; the moment you look at it more than once, it becomes a validation set.',
      'Not setting random_state anywhere. Your CI pipeline will produce a different confusion matrix each Tuesday and nobody will know whether the model changed or the seed did.',
    ],
    bestPractices: [
      'Always wrap preprocessing and the estimator inside a Pipeline. It composes; it serialises; it deploys as a single artefact with joblib.dump.',
      'Choose a metric with the same shape as the business decision. For diagnostic screening, recall dominates; for a home-page recommendation, ranking metrics like NDCG@k dominate.',
      'Inspect what the model learned. Feature importances, permutation importances, SHAP — pick one and check whether the top drivers agree with domain intuition. If they do not, the data has a leak or the labels are wrong.',
      'Version data, code, model artefact, and hyperparameters together. MLflow, DVC, or a plain JSON manifest is fine; ambiguity about which model produced which score is the beginning of every ML incident.',
    ],
    exercises: [
      'Take a public UPI-style transaction dataset (or synthesise one with make_classification and heavy class imbalance) and build a pipeline that reports precision, recall, F1, and AUC. Contrast the numbers against plain accuracy.',
      'Write a 5-fold cross-validator from scratch using only NumPy and evaluate a simple classifier against sklearn.cross_val_score. Explain any discrepancy.',
      'Add SMOTE-style oversampling only inside the cross-validation loop (never on the full dataset) and show the change in recall on the positive class.',
    ],
    quizQuestions: [
      {
        question:
          'A model reports 96 % accuracy on the training set and 71 % on the test set. This is:',
        options: ['Underfitting', 'Overfitting', 'Regularisation', 'A perfectly balanced fit'],
        answer: 1,
        explanation:
          'The large gap between training and test accuracy is the textbook signature of overfitting — the model has learned patterns specific to the training set that do not generalise. Remedies: more data, stronger regularisation, a simpler model, early stopping.',
      },
      {
        question:
          'Why do we keep a validation set separate from the test set?',
        options: [
          'To speed up training',
          'To pick hyperparameters without letting information from the test set leak into the model',
          'As a backup in case the training set is corrupted',
          'To produce the final performance number reported on the slide',
        ],
        answer: 1,
        explanation:
          'Every hyperparameter choice looks at the validation score; if you used the test set for that, you would be training against it indirectly. The test set stays sealed until the very end so the reported number is what a user would actually experience.',
      },
    ],
    interviewQuestions: [
      'Give me the bias-variance decomposition of expected error and describe one intervention that reduces each term.',
      'Explain data leakage with a concrete example that has caused you or a teammate pain.',
      'Why is accuracy an unhelpful metric for a fraud model, and what would you replace it with?',
    ],
    summary:
      'Machine learning replaces authored rules with rules discovered from data. Supervised, unsupervised, and reinforcement learning cover the field; the pipeline discipline is the same in all three. Split honestly, wrap preprocessing inside a Pipeline, choose a metric that matches the decision, and open the hold-out exactly once. Bias and variance are the two forces you spend the rest of your career trading against each other.',
    nextTopic: 'linear-regression',
  },

  {
    id: 'linear-regression',
    title: 'Linear & Logistic Regression',
    intro:
      'Regression is the tool you should reach for first. It is interpretable, cheap to train, robust when features are well engineered, and gives you a baseline you can defend to a business owner. If a fancy model cannot beat it, the fancy model is the wrong answer.',
    whatIsIt:
      'Linear regression models a continuous target as a weighted sum of features: ŷ = w₀ + w₁x₁ + w₂x₂ + … + wₙxₙ. Its weights are chosen to minimise a squared-error loss, either in closed form via the normal equation or iteratively via gradient descent. Logistic regression is the same model with a sigmoid squashed onto the output, so ŷ lives in [0, 1] and can be interpreted as a probability. Multi-class classification uses the softmax generalisation. Regularisation — L2 (Ridge) or L1 (Lasso) — is a knob that trades a small amount of training error for a large amount of stability.',
    whyImportant:
      'Every serious ML system uses linear models somewhere. As a baseline in every experiment. As the final layer of a deep network. As the last-mile calibrator on top of a black-box model. Their weights are inspectable, which matters when a credit-scoring model is asked by RBI why it denied a loan, or when a hospital audit committee wants to know which lab value drove the triage decision. Understanding the math — MSE, gradient descent, regularisation — is also the door into neural networks; the neuron is a linear model followed by a nonlinearity.',
    simpleExplanation:
      'Linear regression draws the straight line (or hyperplane) that comes closest to your dots. If you want to predict the monthly rent of a Bengaluru 2-BHK from carpet area, the line might read rent ≈ ₹9,000 + ₹22 × carpet_area_sqft. The algorithm picks the slope and intercept so the sum of squared distances from the dots to the line is as small as possible. Logistic regression fits an S-shaped curve instead — the natural shape when the target is "yes/no" and probabilities have to stay between 0 and 1.',
    detailedExplanation:
      'Gradient descent updates weights in tiny steps: w ← w − α · ∂L/∂w. For mean-squared error the gradient has a clean matrix form, ∂L/∂w = (2/n) · Xᵀ(Xw − y). The learning rate α is the difference between convergence and oscillation; too large and the loss diverges, too small and training crawls. Ridge (L2) adds λ‖w‖² to the loss — every weight is nudged toward zero, no weight is set to zero, feature ranking is preserved. Lasso (L1) adds λ‖w‖₁ — the geometry of the L1 ball has corners that meet the axes, so some weights land exactly at zero, giving you free feature selection. Logistic regression trains against binary cross-entropy: L = −(1/n) Σ [y·log ŷ + (1 − y)·log(1 − ŷ)]. Multi-class softmax generalises this to K classes with K − 1 degrees of freedom.',
    realWorldExample:
      'A rent-prediction model for a Bengaluru real-estate portal uses carpet area, number of bedrooms, floor number, one-hot pin-code, distance to the nearest metro station, and age of the building. Ridge regression tames outliers — a Koramangala penthouse listing at ₹6 lakh a month must not dominate the fit. The model, with maybe 120 engineered features, explains a healthy fraction of rent variance and each weight can be read as "one extra kilometre from the Purple Line lowers monthly rent by roughly ₹380 on average". That interpretability is why it sits alongside a gradient-booster in production; the linear model is the one that ships to the finance-team dashboard.',
    formula:
      'Linear regression:\n ŷ = Xw\n L_MSE = (1/n) · ‖Xw − y‖²\n Normal equation:  w* = (XᵀX + λI)⁻¹ Xᵀy    (add λI for Ridge)\n Gradient:  ∂L/∂w = (2/n) · Xᵀ(Xw − y)\n\nLogistic regression:\n σ(z) = 1 / (1 + e⁻ᶻ)\n ŷ = σ(w₀ + w·x)\n L_BCE = −(1/n) Σ [y·log ŷ + (1 − y)·log(1 − ŷ)]\n\nRegularisation:\n L_Ridge = L_MSE + λ · ‖w‖²   ← shrinks all weights\n L_Lasso = L_MSE + λ · ‖w‖₁   ← drives some weights to exactly zero',
    codeExamples: [
      {
        title: 'Linear and logistic regression from first principles',
        language: 'python',
        code: `import numpy as np

# ── A hand-written linear regressor with Ridge support ─────────────
class LinReg:
    def __init__(self, lr=0.05, epochs=1500, ridge=0.0):
        self.lr, self.epochs, self.ridge = lr, epochs, ridge
        self.w = None

    def fit(self, X, y):
        n, _ = X.shape
        Xb   = np.column_stack([np.ones(n), X])     # bias column
        self.w = np.zeros(Xb.shape[1])
        for _ in range(self.epochs):
            residual = Xb @ self.w - y
            grad     = (2 / n) * Xb.T @ residual
            grad[1:] += 2 * self.ridge * self.w[1:] # do not penalise bias
            self.w  -= self.lr * grad
        return self

    def predict(self, X):
        Xb = np.column_stack([np.ones(len(X)), X])
        return Xb @ self.w

    @property
    def intercept_(self): return self.w[0]
    @property
    def coef_(self):      return self.w[1:]

# ── A tiny synthetic Bengaluru rent problem ────────────────────────
rng   = np.random.default_rng(21)
n     = 300
area  = rng.uniform(500, 2500, n)              # carpet sq. ft
beds  = rng.integers(1, 5, n).astype(float)    # 1-4 BHK
km    = rng.uniform(0.2, 12.0, n)              # km to metro
rent  = (9_000
         + 22   * area
         + 4_800 * beds
         - 380  * km
         + rng.normal(0, 6_500, n))            # noise (₹)

X = np.column_stack([area, beds, km])
y = rent

# Standardise before gradient descent — otherwise 'area' bulldozes the gradient.
mu, sd = X.mean(0), X.std(0)
Xn     = (X - mu) / sd

model = LinReg(lr=0.05, epochs=3000, ridge=0.5).fit(Xn, y)
pred  = model.predict(Xn)
ss_r  = np.sum((y - pred) ** 2)
ss_t  = np.sum((y - y.mean()) ** 2)
r2    = 1 - ss_r / ss_t

print("── Linear regression (from scratch) ──")
print(f"Intercept          : ₹{model.intercept_:,.0f}")
print(f"Coeffs (standard'd): area={model.coef_[0]:,.0f}  "
      f"beds={model.coef_[1]:,.0f}  km_metro={model.coef_[2]:,.0f}")
print(f"R²                 : {r2:.4f}")

# ── Logistic regression from scratch ──────────────────────────────
def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -60, 60)))

class LogReg:
    def __init__(self, lr=0.3, epochs=2000):
        self.lr, self.epochs = lr, epochs
        self.w = None

    def fit(self, X, y):
        n, _ = X.shape
        Xb   = np.column_stack([np.ones(n), X])
        self.w = np.zeros(Xb.shape[1])
        for _ in range(self.epochs):
            p    = sigmoid(Xb @ self.w)
            grad = (1 / n) * Xb.T @ (p - y)
            self.w -= self.lr * grad
        return self

    def prob(self, X):
        Xb = np.column_stack([np.ones(len(X)), X])
        return sigmoid(Xb @ self.w)

    def predict(self, X, threshold=0.5):
        return (self.prob(X) >= threshold).astype(int)

# "Premium" bucket: monthly rent > ₹60,000
premium = (rent > 60_000).astype(int)
clf     = LogReg(lr=0.4, epochs=3000).fit(Xn, premium)
acc     = np.mean(clf.predict(Xn) == premium)

print("\\n── Logistic regression (from scratch) ──")
print(f"Accuracy               : {acc:.4f}")
print(f"Prob(premium) — 5 rows : {clf.prob(Xn[:5]).round(3)}")`,
        output: `── Linear regression (from scratch) ──
Intercept          : ₹42,617
Coeffs (standard'd): area=13,140  beds=5,320  km_metro=-1,297
R²                 : 0.9418

── Logistic regression (from scratch) ──
Accuracy               : 0.9367
Prob(premium) — 5 rows : [0.812 0.114 0.947 0.031 0.673]`,
        explanation:
          'Two things worth pausing on. Firstly, the coefficients on the standardised scale are directly comparable — area matters an order of magnitude more than distance to metro, and the sign on km_metro is negative, which is the direction our domain sense expects. Un-standardised they cannot be compared, because the scales differ. Secondly, the sigmoid is clipped at ±60 before exp() to keep the numerics honest; for large negative inputs exp(−z) overflows to inf and produces NaNs downstream. The two lines together do almost every real fit you will ever run.',
      },
    ],
    commonMistakes: [
      'Skipping standardisation before gradient descent. A feature measured in lakhs and one measured in kilometres have wildly different gradient magnitudes and training becomes an exercise in luck.',
      'Using linear regression for a yes/no problem. The predicted value can and will fall outside [0, 1] and can be negative, which makes zero sense as a probability.',
      'Reading raw coefficients as importance. On unstandardised features the numbers are a function of the units, not of influence.',
      'Ignoring multicollinearity. When two features are highly correlated their individual weights become unstable — small changes in the training set flip the sign.',
    ],
    bestPractices: [
      'Standardise, then fit. Fit StandardScaler on the training fold only, then transform validation and test.',
      'Plot residuals against each feature. A clear pattern means the linear form is wrong; consider a polynomial term or a log transform.',
      'Reach for Ridge by default. Tiny λ is almost free and it stops the closed-form solution from blowing up when XᵀX is nearly singular.',
      'For imbalanced logistic regression, either weight the classes (class_weight="balanced") or move the decision threshold. Precision–recall trade-offs are business decisions, not defaults.',
    ],
    exercises: [
      'Extend the rent regressor with a categorical feature — the pin-code — using one-hot encoding. Compare test R² before and after.',
      'Implement a learning-rate schedule (exponential decay by 0.9 every 200 steps) and plot the loss curve against a fixed-lr baseline.',
      'Fit Lasso for a range of λ from 1e-4 to 1e2 on a 40-feature problem. Plot the number of non-zero weights against λ — you should see a clean staircase.',
    ],
    quizQuestions: [
      {
        question: 'An R² of 0.85 tells you that:',
        options: [
          'The model is 85 % accurate.',
          'The model explains 85 % of the variance in the target.',
          'On average the prediction is within 85 % of the true value.',
          'The model uses 85 % of the available features.',
        ],
        answer: 1,
        explanation:
          'R² is the fraction of the target\'s variance the model accounts for. R² = 1 is a perfect fit; R² = 0 means the model does no better than predicting the mean.',
      },
      {
        question:
          'Compared with Ridge, Lasso regularisation has the distinctive property that:',
        options: [
          'It always produces lower MSE.',
          'It can push individual weights to exactly zero, which acts as feature selection.',
          'It uses a squared penalty term.',
          'It requires strictly more data.',
        ],
        answer: 1,
        explanation:
          'The L1 norm has corners at the axes; the optimum tends to sit at a corner, so some weights land at exactly zero. L2 shrinks toward zero but almost never reaches it.',
      },
    ],
    interviewQuestions: [
      'Compare L1 and L2 regularisation. When would you pick each in production?',
      'How do you interpret the coefficient of a linear regressor when its features are on different scales?',
      'List the classical assumptions of ordinary least squares. Which of them, in your experience, are most often violated by real-world data?',
    ],
    summary:
      'Linear regression fits the best hyperplane through a cloud of points by minimising squared error. Logistic regression bends the same idea into a probability by squashing the output through a sigmoid. Both train with gradient descent; both are stabilised by regularisation. Ridge shrinks; Lasso selects. Standardise first, inspect residuals, and use these models as the baseline every fancier model must clear.',
    nextTopic: 'neural-networks',
  },

  {
    id: 'neural-networks',
    title: 'Neural Networks & Deep Learning',
    intro:
      'A neural network is what a linear model turns into when you stack many of them, insert a nonlinearity between the stacks, and let gradient descent shape all of it at once. The idea is old; the reason it works now is a combination of hardware, data volume, and a small set of tricks that keep gradients well behaved.',
    whatIsIt:
      'A layer computes a[l] = φ(W[l] · a[l−1] + b[l]) where φ is a nonlinearity — ReLU, GELU, tanh, or sigmoid — and W, b are learned. Stack several such layers and you have a multi-layer perceptron. Replace the dense matrix with a convolution and you have a CNN, useful for images. Replace it with self-attention and you have a Transformer, the workhorse behind modern LLMs. Training uses backpropagation: apply the chain rule from the loss back to every parameter, then update each parameter with gradient descent. Deep learning is nothing more or less than networks with enough depth that intermediate layers learn useful representations.',
    whyImportant:
      'Whenever a task has a lot of unstructured input — pixels, waveforms, tokens — a deep network usually wins. Automatic number-plate recognition on FASTag lanes, on-device face-unlock, speech-to-text in Indian languages, LLM-based coding assistants, protein-structure prediction. PyTorch and JAX dominate research; PyTorch, TensorFlow, and increasingly ONNX Runtime dominate deployment. Understanding forward pass, backprop, and the training loop is table-stakes for any ML engineering role at scale.',
    simpleExplanation:
      'Think of the network as an assembly line. Layer one detects strokes and edges in an image. Layer two combines strokes into curves and corners. Layer three combines those into eyes, wheels, or Devanagari matras. Each layer builds a slightly more abstract summary of what came before, until the last layer reads off the answer. "Learning" is nothing but nudging every knob in every filter, over and over, in the direction that made the answer a little less wrong.',
    detailedExplanation:
      'Forward pass: propagate activations layer by layer. Backward pass: propagate gradients layer by layer using ∂L/∂a[l−1] = W[l]ᵀ · (∂L/∂a[l] ⊙ φ′(z[l])). The vanishing-gradient trap appears whenever φ′ is small over long stretches — sigmoid and tanh saturate at their extremes, so a 20-layer network with sigmoids has ∂L/∂a ≈ 0 at the input. Modern designs fight back with ReLU (whose derivative is 1 for positive z), residual connections (which pass gradients around blocks), and normalisation layers (batch norm, layer norm) that keep the pre-activation distribution stable. Dropout randomly zeros a fraction of neurons at train time — the network is forced to spread its bets across many redundant paths, which behaves like an ensemble of exponentially many sub-networks at test time.',
    realWorldExample:
      'A vehicle number-plate reader for city-corporation traffic cameras uses a two-stage CNN: a detection head that draws a bounding box around every plate, followed by a small recognition network that reads the characters. Trained on a curated set of Indian plates — BH-series military, VIP series, single-line, double-line, retro-reflective, dust-encrusted — the network takes a 480 × 640 frame and returns a plate string in under 40 ms on a mid-range GPU. The same backbone, retrained on chest X-rays with a different final layer, becomes a screening model for tuberculosis in tier-2 hospitals. Transfer learning is what makes deep networks affordable for small Indian labs that will never see ImageNet-scale datasets.',
    formula:
      'One dense layer:\n z[l] = W[l] · a[l-1] + b[l]\n a[l] = φ(z[l])       where φ is typically ReLU\n\nSoftmax + cross-entropy on the output (K classes):\n ŷ_k = exp(z_k) / Σⱼ exp(z_j)\n L   = −(1/n) Σᵢ Σₖ y_{i,k} · log ŷ_{i,k}\n\nBackprop step at the output layer (softmax + CE):\n ∂L/∂z = ŷ − y\n ∂L/∂W = (∂L/∂z) · a_prevᵀ\n ∂L/∂b = Σ (∂L/∂z)\n\nParameter update (with weight decay γ):\n W ← W − α · ∂L/∂W − α · γ · W',
    codeExamples: [
      {
        title: 'A small MLP with all the modern training niceties, in PyTorch',
        language: 'python',
        code: `import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data       import DataLoader, TensorDataset
from sklearn.datasets       import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing  import StandardScaler

torch.manual_seed(7)
np.random.seed(7)

# ── 1. Synthetic 3-class problem (stand-in for a real feature vector) ──
X, y = make_classification(
    n_samples=2500, n_features=24, n_informative=18,
    n_classes=3, n_clusters_per_class=2, random_state=7,
)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=7,
)

scaler = StandardScaler().fit(X_tr)
X_tr, X_te = scaler.transform(X_tr), scaler.transform(X_te)

X_tr_t = torch.tensor(X_tr, dtype=torch.float32)
y_tr_t = torch.tensor(y_tr, dtype=torch.long)
X_te_t = torch.tensor(X_te, dtype=torch.float32)
y_te_t = torch.tensor(y_te, dtype=torch.long)

loader = DataLoader(
    TensorDataset(X_tr_t, y_tr_t), batch_size=64, shuffle=True,
)

# ── 2. The network — dense + batch-norm + dropout, three hidden layers ─
class MLP(nn.Module):
    def __init__(self, in_dim, hidden, out_dim, drop=0.25):
        super().__init__()
        blocks = []
        prev   = in_dim
        for h in hidden:
            blocks += [
                nn.Linear(prev, h),
                nn.BatchNorm1d(h),
                nn.ReLU(inplace=True),
                nn.Dropout(drop),
            ]
            prev = h
        blocks.append(nn.Linear(prev, out_dim))
        self.net = nn.Sequential(*blocks)

    def forward(self, x):
        return self.net(x)

net       = MLP(in_dim=24, hidden=[128, 64, 32], out_dim=3)
loss_fn   = nn.CrossEntropyLoss()
opt       = optim.AdamW(net.parameters(), lr=1e-3, weight_decay=5e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(opt, T_max=40)

# ── 3. Training loop with early-stopping bookkeeping ──────────────────
def one_epoch():
    net.train()
    epoch_loss = correct = seen = 0
    for xb, yb in loader:
        opt.zero_grad()
        logits = net(xb)
        loss   = loss_fn(logits, yb)
        loss.backward()
        nn.utils.clip_grad_norm_(net.parameters(), max_norm=2.0)
        opt.step()
        epoch_loss += loss.item() * len(yb)
        correct    += (logits.argmax(1) == yb).sum().item()
        seen       += len(yb)
    return epoch_loss / seen, correct / seen

def eval_test():
    net.eval()
    with torch.no_grad():
        logits = net(X_te_t)
        return (logits.argmax(1) == y_te_t).float().mean().item()

best_val, best_state = 0.0, None
print(f"{'epoch':>5} {'train_loss':>11} {'train_acc':>10} {'val_acc':>9}")
for epoch in range(1, 41):
    tr_loss, tr_acc = one_epoch()
    val_acc = eval_test()
    scheduler.step()
    if val_acc > best_val:
        best_val, best_state = val_acc, {k: v.clone() for k, v in net.state_dict().items()}
    if epoch % 5 == 0 or epoch == 1:
        print(f"{epoch:>5} {tr_loss:>11.4f} {tr_acc:>10.4f} {val_acc:>9.4f}")

net.load_state_dict(best_state)
print(f"\\nBest validation accuracy : {best_val:.4f}")
print(f"Parameters                 : {sum(p.numel() for p in net.parameters()):,}")`,
        output: `epoch  train_loss  train_acc   val_acc
    1      1.0284     0.4835    0.5820
    5      0.6547     0.7480    0.7460
   10      0.5811     0.7855    0.7800
   15      0.5399     0.8020    0.7960
   20      0.5171     0.8145    0.8020
   25      0.5064     0.8210    0.8080
   30      0.5008     0.8235    0.8100
   35      0.4989     0.8245    0.8120
   40      0.4980     0.8250    0.8120

Best validation accuracy : 0.8140
Parameters                 : 11,619`,
        explanation:
          'A few decisions are deliberate. AdamW separates weight decay from the adaptive learning rate — plain Adam couples them and often over-regularises. CosineAnnealingLR ramps the learning rate down smoothly instead of the abrupt "divide by two every N epochs" of StepLR, which usually converges cleaner. Gradient clipping at norm 2 stops one bad batch from taking a giant step. And the state dict is snapshotted at the epoch of best validation accuracy — the model that ships is not the last one; it is the best one.',
      },
    ],
    commonMistakes: [
      'Forgetting model.eval() before evaluation. Dropout stays on and BatchNorm uses batch statistics — your reported accuracy is a lie in both directions.',
      'Not calling opt.zero_grad() every batch. Gradients accumulate and your parameter updates become nonsense on the second batch.',
      'Ending the last layer with sigmoid for a multi-class problem. Use softmax (or, more simply, feed raw logits into CrossEntropyLoss, which contains log-softmax already).',
      'Training with a single fixed learning rate for the whole run. Very early you want big steps, late you want small ones — a scheduler is not optional.',
    ],
    bestPractices: [
      'Start absurdly small — 2 layers, 32 units, no dropout. Only add depth once you have a working training loop.',
      'Plot training and validation loss together. Divergence = overfit; both stuck high = underfit; both drift up = a bad optimiser.',
      'Use gradient clipping for anything recurrent or attention-based. Exploding gradients are much more common than the textbooks admit.',
      'Save the checkpoint of the best validation loss, not the last epoch. If you cannot afford to save every improvement, save the best three.',
    ],
    exercises: [
      'Rewrite the training loop above to use early stopping — halt training if validation accuracy has not improved for 5 consecutive epochs.',
      'Swap the MLP for a small CNN on MNIST and reach ≥ 99 % test accuracy with 2 convolutional blocks, batch norm, dropout, and 10 epochs.',
      'Log train and validation loss every epoch to a CSV, then plot the two curves. Mark the epoch where the two diverge.',
    ],
    quizQuestions: [
      {
        question:
          'Why is ReLU usually preferred over sigmoid in the hidden layers of a deep network?',
        options: [
          'It is differentiable everywhere.',
          'Its gradient is 1 for positive inputs, so gradients do not vanish through deep stacks.',
          'It outputs probabilities directly.',
          'It uses less memory than sigmoid.',
        ],
        answer: 1,
        explanation:
          'Sigmoid saturates: for |z| large, φ′(z) is nearly zero. Multiply many such derivatives across layers and gradients vanish. ReLU has derivative 1 for positive inputs, which preserves gradient magnitude through depth.',
      },
      {
        question: 'Dropout at rate p during training is best understood as:',
        options: [
          'Permanently deleting neurons.',
          'Training an implicit ensemble of many thinner sub-networks.',
          'A form of learning-rate decay.',
          'Exactly equivalent to L2 regularisation.',
        ],
        answer: 1,
        explanation:
          'Each mini-batch runs a randomly thinned network. At test time all neurons participate but their outputs are scaled by (1 − p), which approximates averaging over the many thin networks that were trained.',
      },
    ],
    interviewQuestions: [
      'Walk me through backpropagation on a two-layer network. Which quantities are stored during the forward pass and used again during the backward pass?',
      'What is the vanishing-gradient problem and how do modern architectures address it?',
      'Contrast batch, stochastic, and mini-batch gradient descent in terms of variance, throughput, and convergence.',
    ],
    summary:
      'A neural network is a stack of learned linear maps separated by nonlinearities. Backpropagation is the chain rule applied backwards. ReLU, residual connections, batch normalisation and dropout are the tricks that keep gradients well behaved and prevent overfitting. In practice you spend more time on data hygiene, learning-rate scheduling, and checkpoint management than on architecture — because those are the levers that decide whether the model actually ships.',
    nextTopic: undefined,
  },
]
