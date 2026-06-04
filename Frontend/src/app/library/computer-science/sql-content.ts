import type { TopicLesson } from '../_shared/types'

export const sqlLessons: TopicLesson[] = [
  {
    id: 'sql-basics',
    title: 'SQL Fundamentals',
    intro: 'SQL (Structured Query Language) is the universal language for querying and manipulating relational databases — used by every major application that stores structured data.',
    whatIsIt: 'SQL operates on tables — rows (records) and columns (attributes). Core operations: SELECT retrieves data, INSERT adds rows, UPDATE modifies rows, DELETE removes rows. WHERE filters rows, GROUP BY aggregates, HAVING filters groups, ORDER BY sorts results, LIMIT/OFFSET paginates. JOINs combine tables based on relationships (INNER, LEFT, RIGHT, FULL OUTER). Aggregate functions: COUNT, SUM, AVG, MIN, MAX.',
    whyImportant: 'Every application that persists data uses a database. SQL is 50+ years old and has never been replaced — PostgreSQL, MySQL, SQLite, SQL Server, BigQuery all use SQL. Data analysts, backend engineers, and data scientists all need SQL. Complex analytical queries (CTEs, window functions) differentiate senior engineers from juniors. SQL is consistently in the top 3 skills on job postings.',
    simpleExplanation: 'SQL is like asking questions to a spreadsheet in plain English. "Show me all customers who spent more than ₹10,000 last month" becomes SELECT customer_name, SUM(amount) FROM orders WHERE date > \'2024-05-01\' GROUP BY customer_name HAVING SUM(amount) > 10000. The database executes your question against millions of rows in milliseconds.',
    detailedExplanation: 'Query execution order (logical): FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. This order matters: you cannot filter on aliases defined in SELECT in a WHERE clause (they don\'t exist yet in logical order — use a subquery or CTE). NULLs are tricky: NULL ≠ NULL, use IS NULL / IS NOT NULL. Three-valued logic: TRUE, FALSE, UNKNOWN (NULL comparisons). Indexes: a B-tree index on a column allows O(log n) lookups instead of O(n) full table scan. Index on WHERE and JOIN columns; avoid indexing every column (slow writes).',
    realWorldExample: 'Amazon\'s order management system: when you click "Your Orders", the backend runs a query joining orders, products, sellers, and shipping tables. A query like SELECT o.id, p.name, o.amount, s.status FROM orders o JOIN products p ON o.product_id = p.id JOIN shipments s ON o.id = s.order_id WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT 20 returns your last 20 orders. An index on orders.user_id makes this instant even with billions of order rows.',
    formula: 'Query structure:\nSELECT [DISTINCT] columns\nFROM   table\n[JOIN  other_table ON condition]\n[WHERE row_filter]\n[GROUP BY columns]\n[HAVING group_filter]\n[ORDER BY columns [ASC|DESC]]\n[LIMIT n OFFSET m]\n\nExecution order:\nFROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT',
    codeExamples: [
      {
        title: 'Complex Queries: JOINs, Aggregates, CTEs, Window Functions',
        language: 'sql',
        code: `-- ── Schema ──
-- users(id, name, email, city, joined_at)
-- orders(id, user_id, total_amount, status, created_at)
-- order_items(id, order_id, product_id, quantity, unit_price)
-- products(id, name, category, price)

-- ── 1. INNER JOIN with aggregation ──
-- Top 10 customers by total spend (completed orders only)
SELECT
    u.name,
    u.city,
    COUNT(o.id)         AS order_count,
    SUM(o.total_amount) AS total_spent,
    AVG(o.total_amount) AS avg_order_value
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status = 'completed'
GROUP BY u.id, u.name, u.city
HAVING COUNT(o.id) >= 3          -- at least 3 orders
ORDER BY total_spent DESC
LIMIT 10;

-- ── 2. LEFT JOIN to find users with no orders ──
SELECT u.name, u.email, u.joined_at
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL               -- no matching order row
ORDER BY u.joined_at DESC;

-- ── 3. CTE (Common Table Expression) for readability ──
-- Monthly revenue with month-over-month growth
WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total_amount)               AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY 1
),
revenue_with_prev AS (
    SELECT
        month,
        revenue,
        LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue
    FROM monthly_revenue
)
SELECT
    TO_CHAR(month, 'YYYY-MM')                                  AS month,
    revenue,
    prev_month_revenue,
    ROUND(
        (revenue - prev_month_revenue) * 100.0 / prev_month_revenue, 2
    )                                                          AS growth_pct
FROM revenue_with_prev
ORDER BY month;

-- ── 4. Window functions — rank customers within each city ──
SELECT
    u.name,
    u.city,
    SUM(o.total_amount) AS total_spent,
    RANK()    OVER (PARTITION BY u.city ORDER BY SUM(o.total_amount) DESC) AS city_rank,
    DENSE_RANK() OVER (ORDER BY SUM(o.total_amount) DESC)                  AS overall_rank,
    NTILE(4)  OVER (ORDER BY SUM(o.total_amount) DESC)                     AS spend_quartile
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status = 'completed'
GROUP BY u.id, u.name, u.city
ORDER BY u.city, city_rank;

-- ── 5. Subquery and EXISTS ──
-- Products that have never been ordered
SELECT p.name, p.category, p.price
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.product_id = p.id
)
ORDER BY p.category, p.name;

-- ── 6. Running total with window function ──
SELECT
    DATE(created_at)      AS day,
    SUM(total_amount)     AS daily_revenue,
    SUM(SUM(total_amount)) OVER (ORDER BY DATE(created_at)) AS cumulative_revenue
FROM orders
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;`,
        output: `Query 1 — Top customers:
name          city       order_count  total_spent  avg_order_value
Priya Sharma  Mumbai     12           84500.00     7041.67
Rahul Gupta   Delhi      8            62300.00     7787.50
...

Query 3 — Monthly revenue growth:
month    revenue   prev_month  growth_pct
2024-01  125000    NULL        NULL
2024-02  148000    125000      18.40
2024-03  139000    148000      -6.08
2024-04  162000    139000      16.55

Query 4 — City rank:
name          city    total_spent  city_rank  overall_rank  quartile
Priya Sharma  Mumbai  84500        1          1             1
Amit Patel    Mumbai  71200        2          3             1
...`,
        explanation: 'CTE makes complex queries readable by naming intermediate result sets — equivalent to subqueries but reusable within the query. LAG() accesses the previous row\'s value without a self-join. PARTITION BY in window functions applies the function within groups (city_rank resets per city). RANK() skips numbers after ties (1,1,3); DENSE_RANK() does not (1,1,2). EXISTS with a subquery is often more efficient than IN for large datasets because it short-circuits on first match.',
      },
    ],
    commonMistakes: [
      'Filtering on a SELECT alias in WHERE — aliases aren\'t computed yet at WHERE stage. Use a subquery/CTE or repeat the expression.',
      'Using COUNT(*) vs COUNT(column) — COUNT(*) counts all rows including NULLs; COUNT(col) skips NULLs in that column.',
      'Missing indexes on JOIN and WHERE columns — a query against a million-row table without indexes can take seconds instead of milliseconds.',
      'SELECT * in production queries — fetches all columns including large blobs; always SELECT only needed columns.',
    ],
    bestPractices: [
      'Always use CTEs to break complex queries into named, readable steps — future you (and your team) will be grateful.',
      'Use EXPLAIN ANALYZE to understand the query plan before adding indexes — indexes cost write performance and storage.',
      'Parameterize all user inputs — never concatenate strings into SQL queries (SQL injection vulnerability).',
      'Use transactions (BEGIN/COMMIT/ROLLBACK) for multi-statement operations that must succeed or fail atomically.',
    ],
    exercises: [
      'Write a query to find the second-highest salary in each department without using LIMIT/OFFSET — use window functions.',
      'Find all users who placed orders in January 2024 but not in February 2024 using set operations (EXCEPT) or NOT EXISTS.',
      'Write a recursive CTE to traverse an employee hierarchy (employee_id, manager_id) and produce an org chart with depth levels.',
    ],
    quizQuestions: [
      {
        question: 'Which clause is used to filter results after GROUP BY aggregation?',
        options: ['WHERE', 'HAVING', 'FILTER', 'QUALIFY'],
        answer: 1,
        explanation: 'HAVING filters groups after GROUP BY aggregation — it can reference aggregate functions like SUM(), COUNT(). WHERE filters individual rows before grouping and cannot reference aggregates. Common pattern: WHERE filters raw rows (fast, can use indexes), HAVING filters aggregated groups.',
      },
      {
        question: 'What does a LEFT JOIN return that an INNER JOIN does not?',
        options: [
          'Rows from the right table with no match on the left',
          'Rows from the left table with no match on the right (with NULLs for right columns)',
          'Only matching rows from both tables',
          'All rows from both tables',
        ],
        answer: 1,
        explanation: 'LEFT JOIN returns all rows from the left table plus matched rows from the right. Where there is no match, right-table columns are NULL. This is essential for "find all X even if they have no Y" queries. INNER JOIN only returns rows where a match exists in both tables.',
      },
    ],
    interviewQuestions: [
      'What is the difference between WHERE and HAVING?',
      'Explain what a window function is and give a practical example.',
      'How would you optimize a slow query? Walk through your diagnostic process.',
    ],
    summary: 'SQL is the standard language for querying relational databases. Logical execution order — FROM, JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — explains why aliases work in ORDER BY but not WHERE. CTEs make complex queries readable. Window functions (RANK, LAG, SUM OVER) compute per-row aggregates without collapsing rows. Always index JOIN and WHERE columns, never concatenate user input into queries.',
    nextTopic: 'database-design',
  },

  {
    id: 'database-design',
    title: 'Database Design & Normalization',
    intro: 'Good database design prevents data anomalies, reduces storage waste, and makes queries faster — normalization is the systematic process of achieving this.',
    whatIsIt: 'Normalization organizes tables to reduce data redundancy and improve integrity. Normal Forms: 1NF — atomic values, no repeating groups. 2NF — no partial dependencies (every non-key column depends on the whole primary key). 3NF — no transitive dependencies (non-key columns depend only on the primary key, not on other non-key columns). BCNF — stricter variant of 3NF. Denormalization trades some redundancy for query performance (used in analytical/OLAP databases). Entity-Relationship (ER) diagrams model entities, attributes, and relationships before writing SQL.',
    whyImportant: 'A poorly designed database forces every application query to work around its defects — impossible to fix without downtime and data migration. Normalization prevents update anomalies (changing a customer city in 1,000 order rows), insertion anomalies (can\'t store a product without an order), and deletion anomalies (deleting the last order deletes customer info). Understanding normalization is a core database interview topic.',
    simpleExplanation: 'Normalization is like tidying a messy filing cabinet. First pass: make sure each folder contains one thing (1NF). Second pass: make sure everything in a folder belongs together — nothing should only relate to part of the label (2NF). Third pass: make sure nothing in a folder could be moved to its own folder because it belongs to a subcategory (3NF). Result: no duplicated information — change customer city in one place and it\'s updated everywhere.',
    detailedExplanation: '1NF: each column holds one atomic value. Violating example: phone_numbers = "555-1234, 555-5678" — split into separate rows or a phone_numbers table. 2NF: only relevant for composite primary keys. If (order_id, product_id) is the PK of order_items, product_name should be in the products table, not order_items (product_name depends only on product_id, not the full composite key). 3NF: if orders has customer_id and customer_city, customer_city has a transitive dependency through customer_id — move customer_city to the customers table. Foreign keys enforce referential integrity: a row in orders cannot reference a user_id that doesn\'t exist in users.',
    realWorldExample: 'A retail database starts unnormalized: one Orders table with customer_name, customer_email, customer_city, product_name, category, price, quantity, order_date — all in one giant table. Changing a product price requires updating every order row. Moving a customer to a new city requires finding all their orders. After 3NF normalization: customers(id, name, email, city), products(id, name, category, price), orders(id, customer_id, order_date), order_items(order_id, product_id, quantity, unit_price_at_time). Each fact is stored once.',
    formula: '1NF: No repeating groups, atomic values in each cell\n2NF: 1NF + no partial dependency (non-key col depends on FULL PK)\n3NF: 2NF + no transitive dependency (non-key col depends only on PK)\n\nFunctional dependency notation:\nA → B means "A determines B" (knowing A tells you B)\n\nPrimary key rules:\n- Unique — no two rows share the same PK value\n- Not NULL\n- Stable — PK values should rarely change\n- Minimal — use the fewest columns needed',
    codeExamples: [
      {
        title: 'Normalization: Before and After 3NF',
        language: 'sql',
        code: `-- ══ BEFORE NORMALIZATION (Unnormalized / 1NF violation) ══
-- All data crammed into one table — multiple phones in one column
CREATE TABLE orders_bad (
    order_id      INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_city  VARCHAR(50),
    customer_phones VARCHAR(200),  -- "555-1234, 555-5678" — NOT atomic!
    product_name   VARCHAR(100),
    category       VARCHAR(50),
    product_price  DECIMAL(10,2),
    quantity       INT,
    order_date     DATE
);

-- Problems:
-- 1. Changing a customer's city → update every order row
-- 2. Changing a product's price → update every order_items row
-- 3. Can't store a product without an order
-- 4. Phone numbers not queryable individually

-- ══ AFTER 3NF NORMALIZATION ══

-- Customers — customer facts live here ONLY
CREATE TABLE customers (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    city       VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phone numbers — separate table (1NF fix for repeating group)
CREATE TABLE customer_phones (
    id          SERIAL PRIMARY KEY,
    customer_id INT         NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone       VARCHAR(20) NOT NULL,
    type        VARCHAR(10) CHECK (type IN ('mobile', 'home', 'work')) DEFAULT 'mobile'
);

-- Products — product facts live here ONLY
CREATE TABLE products (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price    DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

-- Orders — links customers to a purchase event
CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    customer_id INT         NOT NULL REFERENCES customers(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','completed','cancelled')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items — links orders to products with quantity
-- unit_price stored AT TIME OF ORDER (intentional denorm: price may change later)
CREATE TABLE order_items (
    id           SERIAL PRIMARY KEY,
    order_id     INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   INT          NOT NULL REFERENCES products(id),
    quantity     INT          NOT NULL CHECK (quantity > 0),
    unit_price   DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    UNIQUE (order_id, product_id)   -- one row per product per order
);

-- ── Indexes for query performance ──
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC);
CREATE INDEX idx_items_order        ON order_items(order_id);
CREATE INDEX idx_items_product      ON order_items(product_id);

-- ── Sample query: order history for a customer ──
EXPLAIN ANALYZE
SELECT
    o.id          AS order_id,
    o.created_at,
    o.status,
    p.name        AS product,
    p.category,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price AS line_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products    p  ON p.id = oi.product_id
WHERE o.customer_id = 42
ORDER BY o.created_at DESC;`,
        output: `QUERY PLAN (with indexes):
Index Scan using idx_orders_customer on orders
  Index Cond: (customer_id = 42)
  -> Hash Join on order_items.order_id = orders.id
     -> Index Scan on idx_items_order
  -> Hash Join on products.id = order_items.product_id

Execution time: 0.8 ms (vs 245 ms full table scan without index)

Normalized design benefits:
- Update customer city: 1 row in customers table
- Change product price: 1 row in products table
- Historical order prices preserved in order_items.unit_price
- Phone numbers individually queryable
- Referential integrity: cannot create order for nonexistent customer`,
        explanation: 'ON DELETE CASCADE on order_items means deleting an order automatically deletes its items — prevents orphaned rows. unit_price in order_items is intentional denormalization: the price at time of purchase must be preserved even if the product price changes later (otherwise historical invoices would show wrong prices). The composite index on (status, created_at DESC) serves queries filtering by status and sorting by date — a common access pattern for order management dashboards.',
      },
    ],
    commonMistakes: [
      'Using varchar(255) for everything — choose appropriate types (INT, DECIMAL, BOOLEAN, TIMESTAMPTZ) for correctness and performance.',
      'No foreign key constraints — data becomes inconsistent (orphaned rows) without referential integrity enforcement.',
      'Auto-incrementing ID as the only uniqueness constraint — also enforce UNIQUE on natural unique columns (email, username, order_number).',
      'Over-normalizing: extracting every repeating value into a lookup table (e.g., a separate table for city names) — join cost exceeds benefit.',
    ],
    bestPractices: [
      'Always use TIMESTAMPTZ (timestamp with time zone) not TIMESTAMP — store in UTC, display in user\'s timezone at the application layer.',
      'Add CHECK constraints at the database level — the database is the last line of defense against bad data.',
      'Use SERIAL (auto-increment) or UUID for primary keys — never use business data (email, SSN) as the primary key.',
      'Design for your access patterns: if you always query orders with products, the JOIN is fast with proper indexes.',
    ],
    exercises: [
      'Normalize a school database: students(id, name, courses_enrolled_csv, teacher_name, teacher_email). List all 1NF, 2NF, 3NF violations and produce a normalized schema.',
      'Design an ER diagram for a hotel booking system with rooms, guests, bookings, and amenities. Write the CREATE TABLE statements with all constraints.',
      'Explain when denormalization is justified — give two examples where storing redundant data improves performance enough to warrant it.',
    ],
    quizQuestions: [
      {
        question: 'A table has columns: (order_id, product_id, product_name, quantity). The primary key is (order_id, product_id). This violates which normal form?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        answer: 1,
        explanation: '2NF requires that every non-key attribute depends on the FULL primary key. product_name depends only on product_id (a partial dependency on part of the composite key), not on the full (order_id, product_id) key. Fix: move product_name to a products table where product_id is the primary key.',
      },
      {
        question: 'FOREIGN KEY constraints ensure:',
        options: [
          'Uniqueness of values in the referenced column',
          'Referential integrity — referenced rows must exist',
          'Fast lookups on join columns',
          'Non-null values in the foreign key column',
        ],
        answer: 1,
        explanation: 'Foreign keys enforce referential integrity: you cannot insert a row with a foreign key value that does not exist in the referenced table. This prevents orphaned records (orders with no customer). UNIQUE/PRIMARY KEY ensure uniqueness. Indexes (separate concept) speed up lookups. NOT NULL is a separate constraint.',
      },
    ],
    interviewQuestions: [
      'Explain the three normal forms with a practical example of each violation.',
      'When would you intentionally denormalize a database?',
      'What is the difference between a clustered and non-clustered index?',
    ],
    summary: 'Database normalization eliminates redundancy and anomalies: 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies). Use foreign keys for referential integrity, appropriate data types, and CHECK constraints. Add indexes on frequently filtered and joined columns. The intentional exception: store historical values (order prices, snapshot data) even if they duplicate the source — history must not be retroactively altered.',
    nextTopic: undefined,
  },
]
