import type { TopicLesson } from '../_shared/types'

export const financeLessons: TopicLesson[] = [
  {
    id: 'time-value-money',
    title: 'Time Value of Money',
    intro: 'A rupee today is worth more than a rupee tomorrow — the foundation of all financial valuation.',
    whatIsIt: 'The time value of money (TVM) principle states that money available now is worth more than the same amount in the future, because today\'s money can be invested to earn returns. Present Value (PV) is the current worth of a future cash flow. Future Value (FV) is the value at a future time. Discounting converts future values to present values; compounding converts present to future.',
    whyImportant: 'TVM is used in every financial decision: loan repayment schedules, business investment analysis (NPV), retirement planning, bond valuation, equity analysis, and corporate capital budgeting. Without TVM, there is no rational basis for comparing cash flows that occur at different times.',
    simpleExplanation: 'Would you rather receive ₹10,000 today or ₹10,000 one year from now? Today — because you can invest that ₹10,000 and have ₹11,000 next year (at 10% interest). The future ₹10,000 is worth only ₹9,091 today (₹10,000/1.10). This is discounting.',
    detailedExplanation: 'Compounding: FV = PV × (1 + r)ⁿ. Discounting: PV = FV / (1 + r)ⁿ. Annuity: series of equal cash flows at regular intervals. Present Value of Annuity: PVA = C × [1 − (1+r)⁻ⁿ] / r. Future Value of Annuity: FVA = C × [(1+r)ⁿ − 1] / r. Perpetuity: PV = C/r (infinite annuity). Continuous compounding: FV = PV × e^(rt).',
    realWorldExample: 'A 30-year home loan of ₹50 lakhs at 8% per annum — what is the monthly EMI? TVM annuity formula gives EMI = ₹36,688. Over 30 years, total payment = ₹1.32 crore — you pay 2.64× the principal due to the time value of money.',
    formula: 'Future Value:    FV = PV × (1 + r)ⁿ\nPresent Value:  PV = FV / (1 + r)ⁿ\n\nAnnuity PV:     PVA = C × [1-(1+r)⁻ⁿ] / r\nAnnuity FV:     FVA = C × [(1+r)ⁿ-1] / r\n\nEMI Formula:    EMI = P × r(1+r)ⁿ / [(1+r)ⁿ-1]\n\nPerpetuity:     PV = C / r\nContinuous:     FV = PV × e^(rt)',
    codeExamples: [
      {
        title: 'Worked Example — Compounding, Discounting, and a Home-Loan EMI',
        language: 'spreadsheet',
        kind: 'spreadsheet',
        code: `TVM CORE FORMULAS
    FV = PV · (1 + r)^n
    PV = FV / (1 + r)^n
    PV of annuity C:   PV = C · [1 − (1 + r)^-n] / r
    EMI on loan P:     EMI = P · r · (1 + r)^n / [(1 + r)^n − 1]
                       (use monthly rate r = i/12 and n in months)

──────────────────────────────────────────────
CASE 1 — Grow ₹1 lakh @ 12 % p.a. for 10 years
    FV = 1,00,000 · (1.12)^10
       = 1,00,000 · 3.10585
       ≈ ₹3,10,585
    ( More than 3× — the "Rule of 72" says money doubles in ~72/12 = 6 yrs. )

CASE 2 — Need ₹5 lakh in 5 years @ 10 %  — what to invest today?
    PV = 5,00,000 / (1.10)^5
       = 5,00,000 / 1.61051
       ≈ ₹3,10,461

CASE 3 — Home Loan  P = ₹50 lakh,  i = 8 % p.a.,  tenor = 30 yr
    r = 0.08 / 12 = 0.006667      n = 360
    EMI = 50,00,000 · 0.006667 · (1.006667)^360 / [(1.006667)^360 − 1]
        = 50,00,000 · 0.006667 · 10.9357 / 9.9357
        ≈ ₹36,688 / month
    Total paid = EMI · 360 = ₹36,688 · 360 ≈ ₹1,32,07,700  (~2.64× principal)
    Interest portion over life ≈ ₹82 lakh

FIRST-FIVE-YEAR AMORTIZATION  (₹, rounded)
┌──────┬────────────┬─────────────┬──────────────┬───────────────┐
│ Year │  EMI × 12  │  Interest   │  Principal   │  Balance-EOY  │
├──────┼────────────┼─────────────┼──────────────┼───────────────┤
│  1   │  4,40,256  │  3,97,829   │    42,427    │  49,57,573    │
│  2   │  4,40,256  │  3,94,306   │    45,950    │  49,11,623    │
│  3   │  4,40,256  │  3,90,491   │    49,765    │  48,61,858    │
│  4   │  4,40,256  │  3,86,360   │    53,896    │  48,07,962    │
│  5   │  4,40,256  │  3,81,886   │    58,370    │  47,49,592    │
└──────┴────────────┴─────────────┴──────────────┴───────────────┘
    Interest dominates the early years — this is why prepayment
    in years 1–5 saves 2–3 rupees for every rupee of prepayment.`,
        output: `Case 1:  ₹1 L → ₹3.11 L in 10 yr @ 12 %
Case 2:  ₹3.10 L today grows to ₹5.00 L in 5 yr @ 10 %
Case 3:  EMI ≈ ₹36 688, total paid ≈ ₹1.32 Cr (2.64× principal), interest ≈ ₹82 L`,
        explanation: 'FV and PV are two views of the same equation — compounding forward is the mirror image of discounting backward. The EMI formula is a rearranged annuity: a lender is essentially buying an annuity from the borrower. Amortization schedules make it visible that the borrower pays "interest first, principal later" — so early-year prepayments have out-sized impact because they knock down the balance that generates interest for the remaining 300+ months.',
      },
    ],
    commonMistakes: [
      'Using annual rate for monthly periods — always convert: monthly rate = annual rate / 12.',
      'Confusing nominal (stated) and effective annual rate (EAR) when compounding more than once per year.',
      'Applying perpetuity formula to finite cash flows — perpetuity only works for infinite series.',
    ],
    bestPractices: [
      'Ensure period consistency: if payments are monthly, use monthly rate and number of months.',
      'For inflation-adjusted analysis, use real interest rate: r_real ≈ r_nominal − inflation.',
      'Always draw a cash flow timeline before applying any TVM formula.',
    ],
    exercises: [
      'If you invest ₹5,000 per month at 12% annual return for 20 years, what is the future value?',
      'A bond pays ₹1,000 annually forever (perpetuity) and the required return is 8%. What is its fair value?',
      'A project promises ₹2 lakhs at end of year 1, ₹3 lakhs at year 2, and ₹5 lakhs at year 3. Discount at 10%. Find PV.',
    ],
    quizQuestions: [
      {
        question: 'The present value of ₹1,000 received 2 years from now at a discount rate of 10% is:',
        options: ['₹1,100', '₹826.45', '₹909.09', '₹1,210'],
        answer: 1,
        explanation: 'PV = 1000/(1.10)² = 1000/1.21 = ₹826.45.',
      },
      {
        question: 'Which factor does NOT affect the time value of money calculation?',
        options: ['Interest rate', 'Number of periods', 'Type of currency', 'Cash flow timing'],
        answer: 2,
        explanation: 'TVM calculations depend on rate, time periods, and cash flow amounts/timing — not on the currency denomination (the math is the same in any currency).',
      },
    ],
    interviewQuestions: [
      'Explain the difference between simple interest and compound interest with an example.',
      'A project costs ₹10 lakhs today and returns ₹3 lakhs per year for 5 years. Should you invest if the cost of capital is 12%?',
      'What is the Rule of 72 and how accurate is it?',
    ],
    summary: 'TVM is the foundation of finance. FV = PV(1+r)ⁿ compounds forward; PV = FV/(1+r)ⁿ discounts backward. Annuity formulas handle regular cash flows. EMI is an annuity in reverse. The longer the time horizon and higher the rate, the greater the difference between present and future value.',
    nextTopic: 'npv-irr',
  },

  {
    id: 'npv-irr',
    title: 'NPV & IRR — Capital Budgeting',
    intro: 'NPV and IRR are the two most important tools for evaluating whether a business investment creates or destroys value.',
    whatIsIt: 'Net Present Value (NPV): the sum of present values of all cash flows (inflows minus outflows) from a project, discounted at the required rate of return (cost of capital). If NPV > 0, the project creates value and should be accepted. IRR (Internal Rate of Return): the discount rate at which NPV = 0. If IRR > cost of capital, accept the project.',
    whyImportant: 'Every major corporate investment — factory, product launch, acquisition — is evaluated using NPV and IRR. These tools ensure capital is allocated to projects that create shareholder value. Private equity, venture capital, and project finance all rely on these metrics.',
    simpleExplanation: 'NPV asks: "After accounting for the time value of money, does this investment make money?" Positive NPV = the project earns more than the cost of capital. IRR is the project\'s annual return rate. If your required return is 12% and the IRR is 18%, the project earns 6% above your hurdle — accept it.',
    detailedExplanation: 'NPV decision rule: Accept if NPV > 0, reject if NPV < 0, indifferent if NPV = 0. Multiple projects: rank by NPV, accept highest positive NPV. IRR decision rule: Accept if IRR > required rate of return (hurdle rate). IRR limitations: (1) Mutually exclusive projects — use NPV for final decision. (2) Unconventional cash flows — IRR may give multiple values. (3) Reinvestment assumption — IRR assumes cash flows reinvested at IRR rate, which may be unrealistic. NPV is theoretically superior — it directly measures value added in monetary terms.',
    realWorldExample: 'Amazon evaluating a new fulfillment center: Initial investment ₹500 crore. Expected incremental cash flows: ₹100Cr/yr for 7 years. Salvage value ₹50Cr at year 7. Cost of capital 10%. NPV = −500 + Σ[100/(1.1)ᵗ] + 50/(1.1)⁷. If NPV > 0, the center creates value for shareholders.',
    formula: 'NPV = -C₀ + Σ [CFₜ / (1+r)ᵗ]  for t=1 to n\nwhere C₀ = initial investment\n      CFₜ = cash flow in period t\n      r   = discount rate (cost of capital)\n\nIRR: solve for r where NPV = 0\n\nPayback Period = Initial Investment / Annual Cash Flow\n(simple; ignores TVM — supplementary metric only)',
    codeExamples: [
      {
        title: 'Worked Example — NPV, IRR & Project Comparison (Capital-Budgeting Table)',
        language: 'DCF spreadsheet',
        kind: 'spreadsheet',
        code: `HURDLE RATE  r = 10 %  (cost of capital)

CASH-FLOW LADDER  (₹, negative = outflow)
┌────────┬──────────────────┬──────────────────┐
│  Year  │  Project A       │  Project B       │
├────────┼──────────────────┼──────────────────┤
│   0    │  −5,00,000       │  −2,00,000       │
│   1    │   1,20,000       │     80,000       │
│   2    │   1,50,000       │   1,00,000       │
│   3    │   1,80,000       │     80,000       │
│   4    │   2,00,000       │     60,000       │
│   5    │   1,80,000       │     40,000       │
└────────┴──────────────────┴──────────────────┘

DISCOUNT-FACTOR TABLE  ( 1/(1.10)^t )
    t=1  0.9091   t=2  0.8264   t=3  0.7513   t=4  0.6830   t=5  0.6209

PROJECT A — PV of each cash flow
    120 000 · 0.9091 =   1,09,092
    150 000 · 0.8264 =   1,23,966
    180 000 · 0.7513 =   1,35,236
    200 000 · 0.6830 =   1,36,603
    180 000 · 0.6209 =   1,11,766
                       ┌──────────
    Σ PVs (yrs 1–5)  =   6,16,663
    − Initial outlay = − 5,00,000
    ─────────────────────────────
    NPV (A)          ≈   ₹1,16,663

PROJECT B — same procedure gives  NPV (B) ≈ ₹95 500

IRR — the discount rate that drives NPV to zero
    Solved by iteration (Newton-Raphson or spreadsheet's =IRR())
        IRR (A) ≈ 18.6 %
        IRR (B) ≈ 27.3 %

PAYBACK  (undiscounted)
    Project A cumulative:  −5,00,000, −3,80,000, −2,30,000, −50,000, +1,50,000
        Balance turns positive in year 4  ⇒  Payback ≈ 3.3 yr
    Project B cumulative:  −2,00,000, −1,20,000, −20,000, +60,000
        Payback ≈ 2.3 yr

┌────────────────────┬───────────────┬───────────────┐
│  Metric            │  Project A    │  Project B    │
├────────────────────┼───────────────┼───────────────┤
│  Initial outlay    │  ₹5,00,000    │  ₹2,00,000    │
│  NPV @ 10 %        │  ₹1,16,663    │  ₹95,500      │
│  IRR               │      18.6 %   │      27.3 %   │
│  Payback           │   ~3.3 yr     │   ~2.3 yr     │
└────────────────────┴───────────────┴───────────────┘

DECISIONS
    Both stand alone (both NPV > 0, both IRR > 10 %).
    If mutually exclusive  →  choose the higher NPV = Project A.
    If capital-constrained →  Project B has higher PI (NPV / |CF₀|)
                              → 95 500 / 2 00 000 = 0.48 vs A's 0.23.`,
        output: `NPV_A ≈ ₹1.17 L    NPV_B ≈ ₹0.96 L
IRR_A ≈ 18.6 %     IRR_B ≈ 27.3 %
Payback:  A ≈ 3.3 yr   B ≈ 2.3 yr

Value maximization  → pick A (higher NPV)
Capital rationing   → pick B (higher PI = NPV per ₹ invested)`,
        explanation: 'IRR is a rate, NPV is a rupee amount — the two rank differently when projects differ in size. A CFO who is not capital-constrained maximizes value in rupees (NPV wins). A CFO with a hard budget maximizes NPV per rupee (PI wins). Payback ignores TVM and the entire tail of cash flows, so use it only as a supplementary liquidity check, never as the primary decision rule. The =IRR() and =NPV() functions in Excel implement exactly this table.',
      },
    ],
    commonMistakes: [
      'Using IRR instead of NPV to compare mutually exclusive projects of different sizes.',
      'Forgetting that the initial investment (CF₀) is negative in the NPV formula.',
      'Using a single IRR when cash flows change sign more than once (multiple IRRs possible).',
    ],
    bestPractices: [
      'NPV is the primary decision tool — use IRR as a supplementary crosscheck.',
      'Sensitivity analysis: recalculate NPV at different discount rates to see how robust the decision is.',
      'Account for working capital changes and terminal value (salvage value) in the cash flow model.',
    ],
    exercises: [
      'A machine costs ₹3 lakhs, saves ₹80,000/year for 5 years, with ₹20,000 scrap value. Cost of capital 12%. Find NPV and IRR.',
      'Two mutually exclusive projects: A costs ₹10L and returns ₹4L/year for 4 years. B costs ₹5L and returns ₹2.5L/year for 4 years. Which is better at 10% discount?',
      'Explain why a project with NPV > 0 at 10% may have NPV < 0 at 20%.',
    ],
    quizQuestions: [
      {
        question: 'A project with NPV = ₹0 at a 12% discount rate means:',
        options: ['The project is unprofitable', 'The project earns exactly 12% return', 'The project should be rejected', 'The project has negative IRR'],
        answer: 1,
        explanation: 'NPV = 0 means the project earns exactly the discount rate (cost of capital). IRR = discount rate at NPV=0. The project exactly meets the required return — indifferent decision.',
      },
      {
        question: 'When choosing between mutually exclusive projects, which criterion gives the correct decision?',
        options: ['Highest IRR', 'Shortest Payback', 'Highest NPV', 'Highest profitability index'],
        answer: 2,
        explanation: 'NPV directly measures value created in currency terms. Highest NPV = most value added to the firm. IRR can mislead when projects differ in scale or timing.',
      },
    ],
    interviewQuestions: [
      'Explain why NPV is theoretically superior to IRR for investment decisions.',
      'A project has two IRRs. What does this mean and how do you handle it?',
      'How does the hurdle rate (required rate of return) affect NPV and investment decisions?',
    ],
    summary: 'NPV = sum of discounted cash flows. Accept if NPV > 0. IRR = rate where NPV = 0; accept if IRR > hurdle rate. For mutually exclusive projects, use NPV — not IRR. NPV directly measures rupee value added. Payback period is a simple supplementary measure but ignores TVM.',
    nextTopic: 'ratio-analysis',
  },

  {
    id: 'ratio-analysis',
    title: 'Financial Ratio Analysis',
    intro: 'Financial ratios quantify a company\'s profitability, liquidity, solvency, and efficiency from its financial statements.',
    whatIsIt: 'Ratio analysis interprets relationships between financial statement line items to assess company performance and health. Four categories: (1) Profitability ratios — how much profit relative to sales or assets. (2) Liquidity ratios — ability to meet short-term obligations. (3) Solvency/Leverage ratios — long-term debt sustainability. (4) Efficiency/Activity ratios — how effectively assets are used.',
    whyImportant: 'Investors use ratios to compare companies and decide where to invest. Lenders use ratios to assess creditworthiness. Managers use ratios to identify operational weaknesses. Analysts use ratios for equity valuation (P/E ratio, EV/EBITDA). Ratios turn raw numbers into comparable, meaningful insights.',
    simpleExplanation: 'A company\'s profit of ₹10 crore means little in isolation. Is that 2% of revenue (thin margin) or 30% (very profitable)? Is revenue ₹500 crore or ₹30 crore? Ratios provide context by comparing one number to another — profit to revenue (profit margin), current assets to current liabilities (current ratio), etc.',
    detailedExplanation: 'Key ratios: Gross Margin = (Revenue−COGS)/Revenue. Net Margin = Net Profit/Revenue. ROE = Net Profit/Shareholders Equity. ROA = Net Profit/Total Assets. ROCE = EBIT/(Capital Employed). Current Ratio = Current Assets/Current Liabilities (target ≥ 2). Quick Ratio = (CA − Inventory)/CL (target ≥ 1). Debt-to-Equity = Total Debt/Equity. Interest Coverage = EBIT/Interest. Inventory Turnover = COGS/Average Inventory. P/E = Market Price/EPS.',
    realWorldExample: 'Infosys vs TCS comparison: Infosys ROE = 28%, TCS ROE = 42%. TCS generates more profit per unit of equity. Infosys Net Margin = 16%, TCS = 18%. Both are strong, but TCS edges out. Current Ratio both > 3 (very liquid). Debt-to-Equity both near 0 (debt-free IT companies). This analysis guides institutional investment decisions.',
    formula: 'Profitability:\n  Gross Margin = (Revenue - COGS) / Revenue\n  Net Margin = Net Profit / Revenue\n  ROE = Net Profit / Shareholders Equity\n  ROA = Net Profit / Total Assets\n\nLiquidity:\n  Current Ratio = Current Assets / Current Liabilities\n  Quick Ratio = (CA - Inventory) / CL\n\nSolvency:\n  D/E = Total Debt / Shareholders Equity\n  Interest Coverage = EBIT / Interest Expense\n\nValuation:\n  P/E = Market Price per Share / EPS\n  EV/EBITDA = Enterprise Value / EBITDA',
    codeExamples: [
      {
        title: 'Worked Example — Ratio Dashboard vs Industry Benchmarks',
        language: 'ratio analysis',
        kind: 'spreadsheet',
        code: `INPUT — Company financials  (₹ Crore)
    Revenue                1 200      Total assets             900
    COGS                     720      Shareholders' equity     600
    Net profit               180      Total debt               240
    EBIT                     240      Current assets           350
    Interest expense          30      Current liabilities      140
                                       Inventory                 80

RATIO SHEET
┌─────────────────────────────┬────────────────────────────┬──────────┬───────────┬──────────┐
│  Ratio                      │  Formula                   │  Value   │ Benchmark │ Verdict  │
├─────────────────────────────┼────────────────────────────┼──────────┼───────────┼──────────┤
│ PROFITABILITY                                            │          │           │          │
│  Gross margin        (%)    │ (Rev − COGS)/Rev           │  40.0    │  40.0     │ ~ par    │
│  Net margin          (%)    │  Net Profit / Rev          │  15.0    │  12.0     │  BEAT    │
│  ROE                 (%)    │  Net Profit / Equity       │  30.0    │  18.0     │  BEAT    │
│  ROA                 (%)    │  Net Profit / Total Assets │  20.0    │  12.0     │  BEAT    │
│ LIQUIDITY                                                │          │           │          │
│  Current ratio              │  CA / CL                   │   2.5    │   2.0     │  BEAT    │
│  Quick ratio                │  (CA − Inv) / CL           │   1.93   │   1.0     │  BEAT    │
│ SOLVENCY / LEVERAGE                                      │          │           │          │
│  Debt-to-Equity             │  Total Debt / Equity       │   0.40   │   0.50    │  BEAT    │
│  Interest coverage          │  EBIT / Interest           │   8.0×   │   5×      │  BEAT    │
│ EFFICIENCY                                               │          │           │          │
│  Asset turnover             │  Revenue / Total Assets    │   1.33   │   1.00    │  BEAT    │
└─────────────────────────────┴────────────────────────────┴──────────┴───────────┴──────────┘

DUPONT DECOMPOSITION of ROE
    ROE = Net Margin  ·  Asset Turnover  ·  Equity Multiplier
        = 15.0 %      ·  1.333           ·  (900/600 = 1.50)
        = 30.0 %                                              ✓

READINGS
    Profit engine     : Every ratio ahead of industry — pricing power intact.
    Liquidity          : 2.5 × current ratio and 1.93 × quick both comfortable,
                          but idle cash risk if trend keeps climbing.
    Leverage           : D/E 0.4 vs 0.5 benchmark — moderate, low refinancing risk.
    Interest coverage  : 8× — bond-market grade; no immediate rating pressure.

RED FLAGS (would trigger if seen)
    Current Ratio < 1.0     → possible working-capital crunch.
    Quick Ratio  < 0.7      → inventory-dependent liquidity.
    Interest Coverage < 2×  → distress zone; covenant breach risk.
    D/E > 2× peers          → excessive leverage — refinancing risk.`,
        output: `Every headline ratio beats the industry benchmark.
DuPont ROE (30 %) confirmed = Margin (15 %) × Asset TO (1.33) × Leverage (1.50).
No red flags on liquidity, coverage, or leverage.`,
        explanation: 'One-year ratios are a snapshot; the real story is direction — always chart 3–5 years for the same company. Ratios must be judged against industry peers, not universal benchmarks: 0.5 D/E is aggressive for a utility but conservative for a real-estate developer. DuPont decomposition tells you WHY the ROE moved — richer margins? better asset use? more leverage? — each has different implications for durability and risk.',
      },
    ],
    commonMistakes: [
      'Comparing ratios across industries — a 30% debt/equity is low for a utility but high for a tech company.',
      'Using a single year\'s ratio — trend analysis over 3-5 years reveals more than a snapshot.',
      'Treating high current ratio as always good — too high may indicate excess idle cash or poor collections.',
    ],
    bestPractices: [
      'Always compare ratios to: (1) industry peers, (2) historical trend of the same company, (3) target benchmarks.',
      'DuPont analysis decomposes ROE = Net Margin × Asset Turnover × Equity Multiplier — identifies the driver.',
      'For credit analysis, focus on interest coverage ratio and debt/EBITDA — key metrics for lenders.',
    ],
    exercises: [
      'A company has Revenue=₹800Cr, COGS=₹500Cr, Net Profit=₹64Cr, Total Assets=₹600Cr, Equity=₹400Cr. Calculate gross margin, net margin, ROA, ROE.',
      'DuPont decomposition: ROE = 25%, Asset Turnover = 1.5, Equity Multiplier = 2.0. What is the net margin?',
      'Interpret these ratios: Current Ratio=0.8, Quick Ratio=0.5, D/E=3.0. What risk do they signal?',
    ],
    quizQuestions: [
      {
        question: 'The Quick Ratio excludes inventory because:',
        options: ['Inventory is not on the balance sheet', 'Inventory may not be quickly convertible to cash', 'Inventory is a long-term asset', 'Inventory has no value'],
        answer: 1,
        explanation: 'The Quick Ratio tests immediate liquidity. Inventory may take weeks to sell and convert to cash — not "quick" enough to pay urgent obligations. Quick Ratio = (Current Assets − Inventory) / Current Liabilities.',
      },
      {
        question: 'A high Interest Coverage ratio indicates:',
        options: ['High debt', 'Strong ability to service debt from operating earnings', 'High interest rates', 'Low profitability'],
        answer: 1,
        explanation: 'Interest Coverage = EBIT / Interest Expense. A high ratio means the company earns far more than it pays in interest — low financial distress risk.',
      },
    ],
    interviewQuestions: [
      'A company has high revenue growth but declining net margin. What might be causing this and what ratios would you investigate?',
      'Explain DuPont analysis and how it helps identify the drivers of ROE.',
      'What is EBITDA and why do private equity firms prefer EV/EBITDA to P/E for valuation?',
    ],
    summary: 'Financial ratios transform raw financial statements into actionable insights. Profitability ratios measure earnings quality. Liquidity ratios measure short-term safety. Solvency ratios measure debt sustainability. Efficiency ratios measure asset utilization. Always compare to industry peers and historical trends — no ratio is meaningful in isolation.',
    nextTopic: undefined,
  },
]
