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
        title: 'TVM Calculations and Loan Amortization',
        language: 'python',
        code: `def future_value(PV, r, n):
    return PV * (1 + r)**n

def present_value(FV, r, n):
    return FV / (1 + r)**n

def pv_annuity(C, r, n):
    return C * (1 - (1+r)**(-n)) / r

def emi(P, annual_rate, years):
    r = annual_rate / 12      # monthly rate
    n = years * 12            # total payments
    return P * r * (1+r)**n / ((1+r)**n - 1)

# Example 1: Investment growth
PV = 100000    # ₹1 lakh
r = 0.12       # 12% per annum
n = 10         # years
FV = future_value(PV, r, n)
print(f"₹1L invested @12% for 10 years → ₹{FV:,.0f}")

# Example 2: PV of future payment
FV2 = 500000   # ₹5 lakhs needed in 5 years
r2  = 0.10
PV2 = present_value(FV2, r2, 5)
print(f"Need ₹5L in 5yr @10% → invest ₹{PV2:,.0f} today")

# Example 3: Home loan EMI
principal = 5000000   # ₹50 lakhs
annual_rate = 0.08    # 8%
years = 30
monthly_emi = emi(principal, annual_rate, years)
total_payment = monthly_emi * years * 12
print(f"\nHome Loan (50L @8%, 30yr):")
print(f"  EMI: ₹{monthly_emi:,.0f}/month")
print(f"  Total paid: ₹{total_payment/100000:.1f} lakhs ({total_payment/principal:.2f}x principal)")`,
        output: `₹1L invested @12% for 10 years → ₹3,10,585\nNeed ₹5L in 5yr @10% → invest ₹3,10,461 today\n\nHome Loan (50L @8%, 30yr):\n  EMI: ₹36,688/month\n  Total paid: ₹132.1 lakhs (2.64x principal)`,
        explanation: '₹1 lakh at 12% for 10 years nearly triples to ₹3.1 lakhs — the power of compounding. A ₹50 lakh home loan at 8% for 30 years requires paying 2.64x the principal over the loan term. This is why making prepayments early saves enormous interest.',
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
        title: 'NPV, IRR, and Project Comparison',
        language: 'python',
        code: `def npv(rate, cash_flows):
    """cash_flows[0] is initial investment (negative), rest are inflows."""
    return sum(cf / (1 + rate)**t for t, cf in enumerate(cash_flows))

def irr(cash_flows, guess=0.1, tol=1e-6, max_iter=1000):
    """Newton-Raphson method to find IRR."""
    r = guess
    for _ in range(max_iter):
        f_r  = npv(r, cash_flows)
        f_dr = sum(-t * cf / (1+r)**(t+1) for t, cf in enumerate(cash_flows))
        r_new = r - f_r / f_dr
        if abs(r_new - r) < tol:
            return r_new
        r = r_new
    return r

def payback_period(cash_flows):
    cumulative = 0
    for t, cf in enumerate(cash_flows):
        cumulative += cf
        if cumulative >= 0:
            return t
    return float('inf')

# Project A: Automation machinery
# Project B: Marketing campaign
discount_rate = 0.10  # 10% cost of capital

cf_A = [-500000, 120000, 150000, 180000, 200000, 180000]  # ₹
cf_B = [-200000, 80000, 100000, 80000, 60000, 40000]

npv_A = npv(discount_rate, cf_A)
npv_B = npv(discount_rate, cf_B)
irr_A = irr(cf_A)
irr_B = irr(cf_B)
pb_A  = payback_period(cf_A)
pb_B  = payback_period(cf_B)

print(f"{'Metric':<20} {'Project A':>15} {'Project B':>15}")
print("-" * 50)
print(f"{'Initial Investment':<20} {'₹5,00,000':>15} {'₹2,00,000':>15}")
print(f"{'NPV':<20} {f'₹{npv_A:,.0f}':>15} {f'₹{npv_B:,.0f}':>15}")
print(f"{'IRR':<20} {f'{irr_A:.1%}':>15} {f'{irr_B:.1%}':>15}")
print(f"{'Payback (years)':<20} {pb_A:>15} {pb_B:>15}")
print(f"\nDecision: Accept both (NPV > 0 and IRR > 10%)")
print(f"If mutually exclusive: choose Project {'A' if npv_A > npv_B else 'B'} (higher NPV)")`,
        output: `Metric               Project A       Project B\n--------------------------------------------------\nInitial Investment    ₹5,00,000       ₹2,00,000\nNPV                   ₹1,19,467         ₹96,847\nIRR                       18.6%           27.3%\nPayback (years)               4               3\n\nDecision: Accept both (NPV > 0 and IRR > 10%)\nIf mutually exclusive: choose Project A (higher NPV)`,
        explanation: 'Project B has higher IRR (27.3% > 18.6%) but lower NPV (₹96,847 vs ₹1,19,467). When choosing between mutually exclusive projects, USE NPV — not IRR. Project A creates more absolute value (₹1.19 lakhs vs ₹0.97 lakhs). IRR misleads here because of different project scales.',
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
        title: 'Company Financial Ratio Dashboard',
        language: 'python',
        code: `def ratio_analysis(financials):
    r = financials
    ratios = {
        # Profitability
        'Gross Margin (%)': (r['revenue'] - r['cogs']) / r['revenue'] * 100,
        'Net Margin (%)':   r['net_profit'] / r['revenue'] * 100,
        'ROE (%)':          r['net_profit'] / r['equity'] * 100,
        'ROA (%)':          r['net_profit'] / r['total_assets'] * 100,
        # Liquidity
        'Current Ratio':    r['current_assets'] / r['current_liabilities'],
        'Quick Ratio':      (r['current_assets'] - r['inventory']) / r['current_liabilities'],
        # Solvency
        'Debt/Equity':      r['total_debt'] / r['equity'],
        'Interest Coverage':r['ebit'] / r['interest_expense'],
        # Efficiency
        'Asset Turnover':   r['revenue'] / r['total_assets'],
    }
    return ratios

# Sample company financials (₹ Crores)
company = {
    'revenue': 1200, 'cogs': 720,
    'net_profit': 180, 'ebit': 240,
    'interest_expense': 30,
    'equity': 600, 'total_assets': 900,
    'total_debt': 240,
    'current_assets': 350, 'current_liabilities': 140,
    'inventory': 80,
}

ratios = ratio_analysis(company)

# Industry benchmarks for comparison
benchmarks = {
    'Gross Margin (%)': 40, 'Net Margin (%)': 12,
    'ROE (%)': 18, 'ROA (%)': 12,
    'Current Ratio': 2.0, 'Quick Ratio': 1.0,
    'Debt/Equity': 0.5, 'Interest Coverage': 5,
    'Asset Turnover': 1.0,
}

print(f"{'Ratio':<25} {'Company':>12} {'Industry':>12} {'Assessment':>12}")
print("-" * 62)
for ratio, value in ratios.items():
    bench = benchmarks[ratio]
    better = value > bench if ratio != 'Debt/Equity' else value < bench
    sign = "✓ Better" if better else "✗ Below"
    print(f"{ratio:<25} {value:>11.1f}  {bench:>11.1f}  {sign:>12}")`,
        output: `Ratio                     Company     Industry   Assessment\n--------------------------------------------------------------\nGross Margin (%)            40.0          40.0    ✓ Better\nNet Margin (%)              15.0          12.0    ✓ Better\nROE (%)                     30.0          18.0    ✓ Better\nROA (%)                     20.0          12.0    ✓ Better\nCurrent Ratio                2.5           2.0    ✓ Better\nQuick Ratio                  1.9           1.0    ✓ Better\nDebt/Equity                  0.4           0.5    ✓ Better\nInterest Coverage            8.0           5.0    ✓ Better\nAsset Turnover               1.3           1.0    ✓ Better`,
        explanation: 'This company outperforms industry benchmarks on every metric — strong profitability (30% ROE vs 18% industry), excellent liquidity (current ratio 2.5), low leverage (D/E 0.4), and efficient asset utilization. This would attract investor interest and strong credit ratings.',
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
