import type { TopicLesson } from '../_shared/types'

// ─── SQL curriculum — rewritten from first principles by the subject faculty.
// Voice: instructor-in-the-room. Examples: Indian-scale systems (IRCTC, DMRC,
// UPI). All numbers, schemas and prose are original to this platform.
export const sqlLessons: TopicLesson[] = [
  {
    id: 'sql-basics',
    title: 'SQL Fundamentals',
    intro:
      'SQL is the contract every serious data system on the planet has agreed to speak — from a 200 MB SQLite file on your laptop to the multi-petabyte warehouses that answer a UPI merchant dashboard in under a second. Learn it once, and you can hold a conversation with almost every database you will ever touch.',
    whatIsIt:
      'A SQL database organises information into tables. A table has a fixed set of typed columns (INT, TEXT, TIMESTAMP, NUMERIC, BOOLEAN, JSONB) and an ever-changing set of rows. The language itself is small: SELECT reads, INSERT adds, UPDATE edits, DELETE removes; WHERE narrows the rows, GROUP BY collapses them into buckets, HAVING filters those buckets, ORDER BY arranges, LIMIT/OFFSET pages. Two rows in different tables that share a common key can be stitched together with a JOIN — INNER (both sides must match), LEFT (keep left even if right is empty), FULL OUTER (keep both). Aggregations — COUNT, SUM, AVG, MIN, MAX — summarise. That is the whole vocabulary; everything else is composition.',
    whyImportant:
      'If your product touches money, users, orders, seats, or content, there is a relational database underneath. Postgres, MySQL, SQLite, MS-SQL, Oracle, BigQuery, Snowflake, DuckDB — they all speak SQL. In interviews at TCS, Infosys, Flipkart, and Razorpay, the SQL screen is the fastest filter. In production, a slow SQL query is the difference between a page that opens in 40 ms and one that times out during the Big Billion Days sale. Every senior backend engineer I know reads a query plan before they read the application code.',
    simpleExplanation:
      'Think of SQL as a very literal-minded librarian. You describe the shape of what you want — "give me the ten passengers who booked the most Vande Bharat tickets last quarter, ordered by seat class" — and the librarian brings back exactly that. You never tell her HOW to walk the shelves; the query planner decides. Your only job is to describe the answer precisely enough that only one interpretation is possible.',
    detailedExplanation:
      'The catch is that SQL reads top-to-bottom but does not execute top-to-bottom. Logically the engine runs FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. That is why you cannot use a column alias defined in SELECT inside a WHERE — the alias does not exist yet when WHERE fires. It is also why HAVING is the only place you can filter on an aggregate like SUM() > 5000. NULL behaves like a mathematical "unknown", not like zero: NULL = NULL is neither true nor false, it is unknown, so IS NULL exists as a separate operator. Indexes, usually B-tree, turn a sequential scan of ten crore rows into a handful of pointer hops, but each index also slows down writes and takes disk — index the columns you filter and join on, not every column that looks searchable.',
    realWorldExample:
      'Pull up your IRCTC "My Bookings" page. Behind the scenes the app runs something close to: SELECT b.pnr, t.train_no, b.journey_date, b.class, b.status FROM bookings b JOIN trains t ON t.id = b.train_id WHERE b.passenger_id = ? AND b.journey_date >= CURRENT_DATE - INTERVAL \'6 months\' ORDER BY b.journey_date DESC LIMIT 20. With one composite index on (passenger_id, journey_date DESC), even against a table holding a few years of bookings across 130 crore Aadhaar-linked profiles, that query returns in single-digit milliseconds.',
    formula:
      'Query skeleton:\nSELECT   [DISTINCT] col1, col2, expr AS alias\nFROM     table_a a\n[JOIN    table_b b ON b.a_id = a.id]\n[WHERE   row_predicate]\n[GROUP BY grouping_cols]\n[HAVING  group_predicate]\n[ORDER BY cols [ASC|DESC]]\n[LIMIT n OFFSET m]\n\nLogical order the engine actually uses:\nFROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT\n\nRules of thumb:\n • WHERE filters rows; HAVING filters groups.\n • NULL propagates: anything + NULL is NULL.\n • An alias defined in SELECT is visible only in ORDER BY.',
    codeExamples: [
      {
        title: 'IRCTC-scale analytics: joins, aggregates, CTEs, and window functions',
        language: 'sql',
        code: `-- ── Schema (simplified for teaching) ─────────────────────────────
-- passengers(id, full_name, home_city, kyc_verified_at)
-- trains(id, train_no, name, source_code, dest_code, zone)     -- eg 12951 Mumbai Rajdhani, WR
-- bookings(id, pnr, passenger_id, train_id, journey_date,
--          class, fare_paise, status, booked_at)
--   status ∈ ('CNF','WL','RAC','CAN')
--
-- Zones: NR, WR, SR, CR, ER, NER, SCR, SWR, ECR, ECoR, NWR, NCR, SECR
-- Class : SL, 3A, 2A, 1A, CC, EC

-- ── (1) INNER JOIN + aggregation ─────────────────────────────────
-- Top 10 corridors by confirmed revenue in Q1 FY26
SELECT
    t.zone,
    t.name                              AS train_name,
    COUNT(*)                            AS confirmed_pax,
    SUM(b.fare_paise) / 100.0           AS revenue_inr,
    ROUND(AVG(b.fare_paise) / 100.0, 2) AS avg_fare_inr
FROM bookings  b
JOIN trains    t ON t.id = b.train_id
WHERE b.status = 'CNF'
  AND b.journey_date BETWEEN '2026-04-01' AND '2026-06-30'
GROUP BY t.zone, t.name
HAVING COUNT(*) >= 500
ORDER BY revenue_inr DESC
LIMIT 10;

-- ── (2) LEFT JOIN: KYC-verified users who have never travelled ───
SELECT p.full_name, p.home_city, p.kyc_verified_at
FROM   passengers p
LEFT JOIN bookings b ON b.passenger_id = p.id
WHERE  b.id IS NULL
  AND  p.kyc_verified_at IS NOT NULL
ORDER BY p.kyc_verified_at DESC;

-- ── (3) CTE + LAG: month-on-month growth of AC-class revenue ─────
WITH ac_monthly AS (
    SELECT
        DATE_TRUNC('month', journey_date)         AS month,
        SUM(fare_paise) / 100.0                   AS revenue_inr
    FROM bookings
    WHERE status = 'CNF'
      AND class IN ('3A','2A','1A')
    GROUP BY 1
),
with_prev AS (
    SELECT
        month,
        revenue_inr,
        LAG(revenue_inr) OVER (ORDER BY month) AS prev_month
    FROM ac_monthly
)
SELECT
    TO_CHAR(month, 'YYYY-Mon')                              AS period,
    revenue_inr,
    prev_month,
    ROUND(
        (revenue_inr - prev_month) * 100.0 / prev_month, 2
    )                                                       AS mom_pct
FROM with_prev
ORDER BY month;

-- ── (4) Window functions: rank passengers within each home city ──
SELECT
    p.full_name,
    p.home_city,
    SUM(b.fare_paise) / 100.0                                    AS spent_inr,
    RANK()       OVER (PARTITION BY p.home_city
                       ORDER BY SUM(b.fare_paise) DESC)          AS city_rank,
    DENSE_RANK() OVER (ORDER BY SUM(b.fare_paise) DESC)          AS all_india_rank,
    NTILE(4)     OVER (ORDER BY SUM(b.fare_paise) DESC)          AS spend_quartile
FROM passengers p
JOIN bookings   b ON b.passenger_id = p.id
WHERE b.status = 'CNF'
GROUP BY p.id, p.full_name, p.home_city
ORDER BY p.home_city, city_rank;

-- ── (5) NOT EXISTS: trains introduced this year that have never
--       carried a 1A passenger — candidates for promotional pricing.
SELECT t.train_no, t.name, t.zone
FROM   trains t
WHERE  NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.train_id = t.id
      AND b.class    = '1A'
      AND b.status   = 'CNF'
);

-- ── (6) Running total: daily and cumulative revenue for last 30d ─
SELECT
    journey_date                                    AS day,
    SUM(fare_paise) / 100.0                         AS day_revenue_inr,
    SUM(SUM(fare_paise)) OVER (ORDER BY journey_date) / 100.0
                                                    AS cum_revenue_inr
FROM   bookings
WHERE  status = 'CNF'
   AND journey_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP  BY journey_date
ORDER  BY journey_date;`,
        output: `Query 1 — Top corridors (₹ in lakh):
zone  train_name              confirmed_pax  revenue_inr  avg_fare_inr
WR    Mumbai Rajdhani         28,411         6,74,32,100   2,373.21
NR    Vande Bharat Delhi-Vsl  25,908         5,12,08,700   1,977.05
SR    Chennai Duronto         18,204         3,04,11,600   1,670.71
...

Query 3 — AC revenue MoM:
period     revenue_inr    prev_month      mom_pct
2026-Jan   4,08,71,000    NULL            NULL
2026-Feb   4,52,17,200    4,08,71,000     10.63
2026-Mar   4,49,08,000    4,52,17,200     -0.68
2026-Apr   4,91,44,300    4,49,08,000      9.43

Query 4 — City rank:
full_name         home_city  spent_inr  city_rank  all_india_rank  quartile
Aisha Menon       Kochi      54,220     1          14              1
Rajeev Anantharam Kochi      41,180     2          52              1
...`,
        explanation:
          'Notice how the CTE named ac_monthly gives us a name to point at — the second CTE reads like ordinary SQL because we can talk about "the previous month" using LAG() over the ordered set. PARTITION BY resets the window per home_city, which is how RANK() gives us a Kochi ranking that is independent of the Mumbai ranking. Two ranking functions look similar but behave differently: RANK() jumps after a tie (1,1,3,4), DENSE_RANK() does not (1,1,2,3). And I picked NOT EXISTS in query 5 rather than NOT IN on purpose — NULLs inside a NOT IN subquery silently swallow the whole result set, whereas NOT EXISTS treats an empty match as "no", which is what you almost always want.',
      },
    ],
    commonMistakes: [
      'Using a SELECT alias inside WHERE — remember the logical order; WHERE fires before SELECT, so the alias literally does not exist yet. Use a CTE or repeat the expression.',
      'Confusing COUNT(*) with COUNT(column) — COUNT(*) counts every row; COUNT(col) counts non-NULL values in that column. In a nullable email column those numbers will differ.',
      'Assuming NOT IN behaves like NOT EXISTS. If the sub-query returns even one NULL, NOT IN returns no rows at all. This trap has broken more analytics dashboards than SQL injection ever will.',
      'Using SELECT * in application code — the day someone adds a large TEXT or BYTEA column your API payload doubles and nobody notices until the bill arrives.',
    ],
    bestPractices: [
      'Break large queries into named CTEs — reading a 200-line query later is much easier when each stage has a verb-noun name like recent_bookings or refund_candidates.',
      'Run EXPLAIN (ANALYZE, BUFFERS) before you add or drop an index — the plan tells you whether the planner is choosing an index scan or falling back to a sequential scan.',
      'Always use parameterised queries. Concatenating a user string into SQL is how you end up on the front page of Hacker News for the wrong reason.',
      'Wrap multi-statement work in BEGIN … COMMIT. Half-applied updates in a bookings table are much harder to fix than a rolled-back transaction.',
    ],
    exercises: [
      'Given the IRCTC schema above, write a query that returns the second-highest fare paid by each passenger without using LIMIT/OFFSET. Use ROW_NUMBER() over a PARTITION BY passenger_id.',
      'Find the passengers whose PNRs went from WL to CNF in the last 7 days but who then cancelled within 24 hours. You will need a self-join on bookings and careful timestamp arithmetic.',
      'Write a recursive CTE that walks a train reservation "parent PNR → linked PNR" chain (families often link tickets) and returns the family size for each root PNR.',
    ],
    quizQuestions: [
      {
        question: 'Which clause is used to filter rows after a GROUP BY aggregation?',
        options: ['WHERE', 'HAVING', 'FILTER', 'QUALIFY'],
        answer: 1,
        explanation:
          'HAVING runs after GROUP BY, so it can reference aggregate expressions like SUM(fare_paise) > 10000. WHERE runs before grouping and only sees raw row-level columns. A useful mental picture: WHERE reduces the input, HAVING reduces the output.',
      },
      {
        question: 'A LEFT JOIN returns which of the following that an INNER JOIN would not?',
        options: [
          'Rows from the right table that have no match on the left',
          'Rows from the left table that have no match on the right, with NULLs filling right-side columns',
          'Only the rows present in both tables',
          'Every row from both tables regardless of match',
        ],
        answer: 1,
        explanation:
          'A LEFT JOIN keeps every row of the left table and pads the right side with NULLs where no match exists. This is the correct tool for "list all passengers, whether they have travelled or not". FULL OUTER keeps both sides; INNER keeps only intersecting rows.',
      },
    ],
    interviewQuestions: [
      'Walk me through the logical execution order of a SELECT statement and explain why an alias declared in SELECT cannot appear in WHERE.',
      'Give an example where NOT EXISTS behaves differently from NOT IN, and explain what NULLs have to do with it.',
      'A dashboard query has degraded from 40 ms to 4 seconds overnight. What is your diagnostic playbook?',
    ],
    summary:
      'SQL is a declarative language over typed tables. You describe the answer; the planner decides how to fetch it. Master the logical execution order — FROM, JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT — and NULL semantics, and the rest of the language falls into place. CTEs are for readability, window functions give you per-row analytics without collapsing rows, and indexes are a trade — faster reads for slower writes. Everything else is practice on real data.',
    nextTopic: 'database-design',
  },

  {
    id: 'database-design',
    title: 'Database Design & Normalisation',
    intro:
      'A schema is a decision you have to live with. Get it right at the whiteboard and every future query is fast and correct; get it wrong and every future engineer spends their day working around it. Normalisation is the disciplined process that keeps the decision honest.',
    whatIsIt:
      'Normalisation is a series of rules that push data into its natural home. 1NF: every cell holds a single atomic value. 2NF: relevant only when the primary key is composite — every non-key column must depend on the whole key, not part of it. 3NF: no non-key column may depend on another non-key column (no transitive chains). BCNF is a strictness upgrade over 3NF. Denormalisation is the deliberate reversal, done for analytical speed or to freeze history (an invoice line item should keep the price at the moment of purchase, not the current price). Before writing a single CREATE TABLE, most senior engineers sketch an Entity-Relationship diagram — boxes for entities, diamonds for relationships, arrows for cardinality.',
    whyImportant:
      'A denormalised schema is the tax you pay on every future query. If a customer\'s city lives in the orders table, changing it means UPDATE across every order row, and half the time someone forgets and the data drifts. Update anomalies, insert anomalies, delete anomalies — the whole vocabulary exists because the failure modes are real. Interview panels care because a candidate who cannot recognise a partial dependency will build a system nobody can maintain. And once you scale — think DMRC issuing crore-level smart-card journeys per year — a broken schema means broken invariants, and broken invariants mean broken money.',
    simpleExplanation:
      'Imagine you are organising a hospital records room. First pass: no envelope should hold two different reports jammed together — one report, one folder (1NF). Second pass: if a folder is labelled "Patient + Visit", nothing inside should belong to only the patient side or only the visit side (2NF). Third pass: nothing inside a folder should be a fact about something else that should live in its own folder — the ward number belongs in the "wards" folder, not the "patients" folder (3NF). After the pass, every fact has exactly one home. Change the fact once and every report that references it is instantly correct.',
    detailedExplanation:
      '1NF is violated by anything that looks like "391-2345, 391-2346" packed into one column, or by an array of tags jammed into a comma-separated string. Fix by splitting into rows or into a child table. 2NF is only interesting for composite keys: if journeys has PRIMARY KEY (card_id, journey_ts) and you store card_holder_name in the same row, that name depends only on card_id, not on the whole key — extract it into the cards table. 3NF chases down transitive chains: if journeys has an origin_station_code and you also store origin_zone in the same row, origin_zone depends on origin_station_code, not on the journey. Move it to a stations table. Foreign keys are how you make the database enforce these rules: an INSERT with a non-existent card_id is rejected at the storage layer, not the application layer.',
    realWorldExample:
      'A metro network like Namma Metro in Bengaluru begins with a rough log — one giant journeys table containing card serial, holder name, holder KYC, start station, start station zone, end station, end station zone, fare, and top-up balance snapshot. Every fare-map change means a batch UPDATE across hundreds of crores of rows. After a proper 3NF pass we end up with cards(id, serial, holder_id, issued_at), holders(id, name, kyc_ref), stations(id, code, name, zone, line), fare_matrix(from_zone, to_zone, fare_paise, valid_from, valid_to) and journeys(id, card_id, from_station_id, to_station_id, tap_in_at, tap_out_at, fare_paise). Fare changes touch fare_matrix. Holder KYC touches holders. Journeys stays append-only — exactly the shape you want when regulators come asking.',
    formula:
      'Functional dependency: A → B  means "given A, B is fixed".\n\n1NF : every attribute is atomic; no repeating groups.\n2NF : 1NF + every non-key attribute depends on the ENTIRE primary key.\n3NF : 2NF + no non-key attribute depends on another non-key attribute.\nBCNF: 3NF + every non-trivial FD has a superkey on the left-hand side.\n\nPrimary-key checklist:\n • Unique — enforced by the engine.\n • NOT NULL — no missing identifiers.\n • Stable — must not need to change under normal operation.\n • Minimal — the fewest columns that guarantee uniqueness.',
    codeExamples: [
      {
        title: 'A metro fare-card system: from a messy log to a 3NF schema',
        language: 'sql',
        code: `-- ══ BEFORE — one big log table, everything jammed together ═══════
CREATE TABLE journeys_raw (
    journey_id       BIGINT,
    card_serial      VARCHAR(24),
    holder_name      VARCHAR(120),
    holder_phones    VARCHAR(200),   -- '+91-9876543210, +91-9123456780'  ← not atomic
    from_station     VARCHAR(80),
    from_zone        VARCHAR(4),     -- transitively depends on from_station
    to_station       VARCHAR(80),
    to_zone          VARCHAR(4),     -- transitively depends on to_station
    fare_paise       INTEGER,
    balance_after_paise INTEGER,
    tap_in_at        TIMESTAMP,
    tap_out_at       TIMESTAMP
);
-- Pain points:
--   • Fare map changes → UPDATE across all journeys.
--   • Holder renames → touch every historical journey.
--   • Phone numbers cannot be queried individually.
--   • No engine-level check that from_zone actually matches from_station.

-- ══ AFTER — a 3NF schema that survives a decade of change ═══════

CREATE TABLE holders (
    id           BIGSERIAL PRIMARY KEY,
    full_name    VARCHAR(120) NOT NULL,
    kyc_ref      VARCHAR(32)  UNIQUE,        -- masked Aadhaar reference
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE holder_phones (
    id         BIGSERIAL PRIMARY KEY,
    holder_id  BIGINT      NOT NULL REFERENCES holders(id) ON DELETE CASCADE,
    phone_e164 VARCHAR(16) NOT NULL,
    kind       VARCHAR(8)  CHECK (kind IN ('primary','alt','work')) DEFAULT 'primary',
    UNIQUE (holder_id, phone_e164)
);

CREATE TABLE cards (
    id         BIGSERIAL PRIMARY KEY,
    serial     VARCHAR(24) NOT NULL UNIQUE,
    holder_id  BIGINT      NOT NULL REFERENCES holders(id),
    issued_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status     VARCHAR(12) NOT NULL DEFAULT 'active'
               CHECK (status IN ('active','blocked','retired'))
);

CREATE TABLE stations (
    id      SMALLSERIAL PRIMARY KEY,
    code    CHAR(3)     NOT NULL UNIQUE,     -- e.g. 'MGR'
    name    VARCHAR(80) NOT NULL,
    zone    VARCHAR(4)  NOT NULL,            -- 'Z1' … 'Z4'
    line    VARCHAR(16) NOT NULL             -- 'Purple','Green','Yellow'
);

-- Fare is a function of (from_zone, to_zone) at a point in time.
-- Storing it here means one row per pair per revision — never a mass update.
CREATE TABLE fare_matrix (
    id          SERIAL PRIMARY KEY,
    from_zone   VARCHAR(4) NOT NULL,
    to_zone     VARCHAR(4) NOT NULL,
    fare_paise  INTEGER    NOT NULL CHECK (fare_paise > 0),
    valid_from  DATE       NOT NULL,
    valid_to    DATE,                                  -- NULL = current
    UNIQUE (from_zone, to_zone, valid_from)
);

CREATE TABLE journeys (
    id                 BIGSERIAL PRIMARY KEY,
    card_id            BIGINT      NOT NULL REFERENCES cards(id),
    from_station_id    SMALLINT    NOT NULL REFERENCES stations(id),
    to_station_id      SMALLINT             REFERENCES stations(id),   -- NULL = incomplete tap-out
    tap_in_at          TIMESTAMPTZ NOT NULL,
    tap_out_at         TIMESTAMPTZ,
    fare_paise         INTEGER,                        -- snapshotted at tap-out
    balance_after_paise INTEGER,
    CHECK (tap_out_at IS NULL OR tap_out_at >= tap_in_at)
);

-- Indexes that match the queries we actually run:
CREATE INDEX ix_journeys_card_time  ON journeys (card_id, tap_in_at DESC);
CREATE INDEX ix_journeys_from_time  ON journeys (from_station_id, tap_in_at);
CREATE INDEX ix_fare_lookup         ON fare_matrix (from_zone, to_zone, valid_from);

-- ── A real query the DMRC control room might run each morning ──
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    s.code                         AS from_station,
    COUNT(*)                       AS trips,
    SUM(j.fare_paise) / 100.0      AS revenue_inr
FROM journeys j
JOIN stations s ON s.id = j.from_station_id
WHERE j.tap_in_at::date = CURRENT_DATE - 1
GROUP BY s.code
ORDER BY revenue_inr DESC;`,
        output: `Query plan (with the indexes above):
Index Scan  using ix_journeys_from_time on journeys
   Index Cond: (tap_in_at >= '2026-07-08' AND tap_in_at < '2026-07-09')
   -> Hash Join on stations.id = journeys.from_station_id
Planning time: 0.42 ms
Execution time: 11.7 ms     (vs 6.4 s on a heap scan without the index)

Design wins we can point to:
  • Fare revision → INSERT into fare_matrix (one row), never UPDATE journeys.
  • Rename a holder → UPDATE holders (one row).
  • Historical journeys keep the fare_paise that was actually charged.
  • Phone numbers are queryable individually and can be de-duplicated.
  • A journey referencing a non-existent card is rejected at INSERT time.`,
        explanation:
          'Notice the deliberate denormalisation on journeys.fare_paise. The fare at the time of travel must be preserved even if the fare_matrix later changes — regulators, refunds, and audit trails all depend on it. That is not a normalisation failure; it is a chosen snapshot. Every other duplication has been eliminated. ON DELETE CASCADE on holder_phones is safe because a phone number is meaningless without its holder; we would never cascade from cards to journeys — journeys are the ledger.',
      },
    ],
    commonMistakes: [
      'Storing every string as VARCHAR(255) because it "feels safe". A phone number is 10 to 16 characters, a PIN code is 6, an IFSC is 11 — pick a size that says something about the data.',
      'Skipping foreign keys "for performance". Without them your app becomes the only thing standing between the schema and orphan rows. That is a losing bet in the long run.',
      'Making an auto-increment id the only uniqueness guarantee. If email should be unique, put a UNIQUE constraint on it — the engine will catch bugs your test suite misses.',
      'Over-normalising to the point of a JOIN storm. If a two-letter state code is used in 40 tables, a lookup table for state codes may be more ceremony than value.',
    ],
    bestPractices: [
      'Use TIMESTAMPTZ, never TIMESTAMP. Store in UTC, convert at the edge. This one habit will save you the day India moves to a two-time-zone system or you add a Singapore region.',
      'Push invariants into the database with CHECK constraints — the schema is the last honest defence when a new microservice starts writing data.',
      'Prefer BIGSERIAL or UUID as surrogate primary keys. Never use business identifiers (email, PAN, Aadhaar reference) as the primary key; those change and mustn\'t leak.',
      'Design for the queries you actually run. A composite index on (card_id, tap_in_at DESC) is not a heuristic — it is the shape of your dashboard.',
    ],
    exercises: [
      'Take a student information system laid out as students(roll_no, name, courses_taken_csv, hostel_name, warden_name, warden_phone). List every normal-form violation and produce a normalised schema.',
      'Design an ER diagram for a UPI-style payments system: accounts, VPAs, transactions, refunds, and merchants. Convert it to CREATE TABLE statements with every foreign key and CHECK you would put into production.',
      'Explain, with two specific examples, when you would intentionally denormalise. For each example, describe the invariant you now have to protect at the application layer.',
    ],
    quizQuestions: [
      {
        question:
          'A table has columns (booking_id, seat_id, seat_class, quantity) with primary key (booking_id, seat_id). Which normal form is violated, and why?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        answer: 1,
        explanation:
          'seat_class depends only on seat_id, not on the full composite key (booking_id, seat_id). That is a partial dependency, which is exactly what 2NF forbids. Move seat_class into a seats table where seat_id is the primary key.',
      },
      {
        question: 'What guarantee does a FOREIGN KEY constraint provide?',
        options: [
          'It forces the referenced column to be unique.',
          'It enforces referential integrity — a referenced row must exist.',
          'It creates an index and speeds up joins.',
          'It prevents NULLs in the foreign-key column.',
        ],
        answer: 1,
        explanation:
          'A FOREIGN KEY declares that every value in the child column must exist in the parent column at insert or update time. Uniqueness is a separate guarantee (UNIQUE / PRIMARY KEY), fast joins come from a separate index, and NOT NULL is a separate constraint you may or may not want alongside.',
      },
    ],
    interviewQuestions: [
      'Walk me through 1NF, 2NF, and 3NF using a schema of your own choosing, and point at exactly what a violation of each looks like.',
      'Under what circumstances would you accept redundant data in a production schema? Give a concrete example.',
      'A row lock in Postgres and a page lock in SQL Server both slow you down — how does index design influence which one you get?',
    ],
    summary:
      'A well-designed schema keeps each fact in exactly one place. 1NF gives you atomicity, 2NF eliminates partial dependencies on composite keys, 3NF removes transitive dependencies among non-key columns. Enforce the model with FOREIGN KEY, CHECK, UNIQUE, and NOT NULL — the database is the last honest guardian of your data. Denormalise deliberately, never accidentally, and always for a named reason: analytical speed, snapshot of history, or a proven hot path.',
    nextTopic: undefined,
  },
]
