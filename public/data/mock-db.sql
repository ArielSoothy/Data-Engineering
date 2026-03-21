-- Mock Database for Meta DE Interview Practice
-- ============================================================
-- Schemas: Bookstore (Q1-8), Grocery (Q16-20),
--          Payment (Q21-28), User Events (Q500-524)
-- SQLite-compatible (sql.js): TEXT for dates, REAL for decimals
-- ============================================================

-- ============================================================
-- Meta DE Interview Practice: Bookstore Schema
-- ============================================================
-- SQLite-compatible (sql.js): TEXT for dates, REAL for decimals
-- Designed for Meta Official SQL question patterns:
--   1. Authors with 5+ books
--   2. Sales on same day as registration
--   3. Customers with 3+ books on first AND last purchase day
--   4. Referral chains (self-join)
--   5. Running totals per user
-- ============================================================

CREATE TABLE IF NOT EXISTS authors (
    author_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    website_url TEXT
);

CREATE TABLE IF NOT EXISTS books (
    book_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    author_id INTEGER REFERENCES authors(author_id),
    price REAL,
    published_date TEXT
);

CREATE TABLE IF NOT EXISTS bookstore_customers (
    customer_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    registration_date TEXT,
    referred_by INTEGER REFERENCES bookstore_customers(customer_id)
);

CREATE TABLE IF NOT EXISTS bookstore_transactions (
    transaction_id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES bookstore_customers(customer_id),
    book_id INTEGER REFERENCES books(book_id),
    purchase_date TEXT,
    payment_type TEXT,
    amount REAL
);

-- ============================================================
-- Authors (10 rows)
-- Some with .com URLs, some with other TLDs, some NULL
-- ============================================================
INSERT OR IGNORE INTO authors (author_id, name, website_url) VALUES
    (1, 'Elena Rodriguez', 'https://elenarodriguez.com'),
    (2, 'James Chen', 'https://jameschen.com'),
    (3, 'Amara Okafor', NULL),
    (4, 'Mikhail Petrov', 'https://mikhailwrites.org'),
    (5, 'Sarah Mitchell', 'https://sarahmitchell.com'),
    (6, 'Raj Patel', NULL),
    (7, 'Lina Bergstrom', 'https://linabergstrom.net'),
    (8, 'David Kim', 'https://davidkim.com'),
    (9, 'Fatima Al-Hassan', NULL),
    (10, 'Carlos Mendoza', 'https://carlosmendoza.com');

-- ============================================================
-- Books (25 rows)
-- Authors 1, 2, 5 have 5+ books each (for "authors with 5+ books" queries)
-- Distributed publication dates across 2020-2024
-- ============================================================
INSERT OR IGNORE INTO books (book_id, title, author_id, price, published_date) VALUES
    -- Elena Rodriguez: 6 books
    (1, 'The Silent Algorithm', 1, 24.99, '2020-03-15'),
    (2, 'Echoes of Tomorrow', 1, 19.99, '2020-09-01'),
    (3, 'Data Dreams', 1, 29.99, '2021-06-12'),
    (4, 'Parallel Worlds', 1, 22.50, '2022-01-20'),
    (5, 'The Last Variable', 1, 27.99, '2023-04-10'),
    (6, 'Code of Silence', 1, 18.99, '2024-02-28'),
    -- James Chen: 5 books
    (7, 'Midnight in Shanghai', 2, 21.99, '2020-05-22'),
    (8, 'The Jade Garden', 2, 16.99, '2021-02-14'),
    (9, 'Silk Road Stories', 2, 25.50, '2021-11-30'),
    (10, 'Dragon Gate', 2, 23.99, '2022-08-15'),
    (11, 'The Paper Lantern', 2, 20.00, '2023-07-04'),
    -- Amara Okafor: 2 books
    (12, 'Savannah Sunrise', 3, 14.99, '2021-03-08'),
    (13, 'The Baobab Tree', 3, 17.50, '2023-01-15'),
    -- Mikhail Petrov: 1 book
    (14, 'Winter in Moscow', 4, 26.99, '2022-12-01'),
    -- Sarah Mitchell: 5 books
    (15, 'Ocean Breeze', 5, 15.99, '2020-07-19'),
    (16, 'Mountain Echo', 5, 18.50, '2021-04-25'),
    (17, 'Desert Storm', 5, 22.99, '2022-03-11'),
    (18, 'River Song', 5, 19.99, '2023-06-30'),
    (19, 'Forest Fire', 5, 24.50, '2024-01-15'),
    -- Raj Patel: 2 books
    (20, 'Spice Market', 6, 13.99, '2022-05-20'),
    (21, 'The Monsoon', 6, 16.50, '2023-09-12'),
    -- Lina Bergstrom: 1 book
    (22, 'Northern Lights', 7, 28.99, '2023-03-22'),
    -- David Kim: 1 book
    (23, 'Seoul Searching', 8, 21.50, '2022-10-05'),
    -- Fatima Al-Hassan: 1 book
    (24, 'Oasis Dreams', 9, 17.99, '2023-11-18'),
    -- Carlos Mendoza: 1 book
    (25, 'Tango at Midnight', 10, 19.50, '2024-03-01');

-- ============================================================
-- Bookstore Customers (15 rows)
-- Referral chains: 2->1, 3->1, 5->2, 8->5, 9->5, 11->3, 14->8
-- Various registration dates for "same day as purchase" queries
-- ============================================================
INSERT OR IGNORE INTO bookstore_customers (customer_id, name, email, phone, registration_date, referred_by) VALUES
    (1,  'Olivia Harper',    'olivia.harper@gmail.com',    '555-0101', '2023-01-10', NULL),
    (2,  'Noah Bennett',     'noah.bennett@yahoo.com',     '555-0102', '2023-01-25', 1),
    (3,  'Emma Sullivan',    'emma.sullivan@gmail.com',    '555-0103', '2023-02-05', 1),
    (4,  'Liam Foster',      'liam.foster@outlook.com',    '555-0104', '2023-02-14', NULL),
    (5,  'Ava Richardson',   'ava.richardson@gmail.com',   '555-0105', '2023-03-01', 2),
    (6,  'Lucas Hayes',      'lucas.hayes@hotmail.com',    '555-0106', '2023-03-18', NULL),
    (7,  'Sophia Coleman',   'sophia.coleman@gmail.com',   '555-0107', '2023-04-02', NULL),
    (8,  'Mason Brooks',     'mason.brooks@yahoo.com',     '555-0108', '2023-04-15', 5),
    (9,  'Isabella Reed',    'isabella.reed@gmail.com',    '555-0109', '2023-05-10', 5),
    (10, 'Ethan Price',      'ethan.price@outlook.com',    '555-0110', '2023-05-28', NULL),
    (11, 'Mia Turner',       'mia.turner@gmail.com',       '555-0111', '2023-06-12', 3),
    (12, 'Alexander Ward',   'alex.ward@hotmail.com',      '555-0112', '2023-07-01', NULL),
    (13, 'Charlotte Morgan', 'charlotte.morgan@gmail.com', '555-0113', '2023-08-20', NULL),
    (14, 'Benjamin Cooper',  'ben.cooper@yahoo.com',       '555-0114', '2023-09-05', 8),
    (15, 'Amelia Gray',      'amelia.gray@gmail.com',      '555-0115', '2023-10-15', NULL);

-- ============================================================
-- Bookstore Transactions (40 rows)
-- Key data patterns:
--   - Customers 1,5,7 purchase ON their registration_date (same-day purchase)
--   - Customer 1: first purchase day 2023-01-10 has 4 books, last day 2023-09-20 has 3 books
--   - Customer 5: first purchase day 2023-03-01 has 3 books, last day 2023-11-08 has 3 books
--   - Customer 7: first purchase day 2023-04-02 has 3 books, last day 2023-10-25 has 3 books
--   - Multiple transactions per customer for running totals
--   - Mix of payment types: credit_card, debit_card, paypal
-- ============================================================
INSERT OR IGNORE INTO bookstore_transactions (transaction_id, customer_id, book_id, purchase_date, payment_type, amount) VALUES
    -- Customer 1 (Olivia Harper) - reg: 2023-01-10
    -- First day: 4 books on 2023-01-10 (same as registration)
    (1,  1, 1,  '2023-01-10', 'credit_card', 24.99),
    (2,  1, 7,  '2023-01-10', 'credit_card', 21.99),
    (3,  1, 15, '2023-01-10', 'credit_card', 15.99),
    (4,  1, 12, '2023-01-10', 'credit_card', 14.99),
    (5,  1, 3,  '2023-04-22', 'debit_card',  29.99),
    (6,  1, 10, '2023-06-15', 'paypal',      23.99),
    -- Last day: 3 books on 2023-09-20
    (7,  1, 18, '2023-09-20', 'credit_card', 19.99),
    (8,  1, 22, '2023-09-20', 'credit_card', 28.99),
    (9,  1, 24, '2023-09-20', 'debit_card',  17.99),

    -- Customer 2 (Noah Bennett) - reg: 2023-01-25
    (10, 2, 2,  '2023-02-03', 'debit_card',  19.99),
    (11, 2, 8,  '2023-03-14', 'credit_card', 16.99),
    (12, 2, 14, '2023-05-22', 'paypal',      26.99),

    -- Customer 3 (Emma Sullivan) - reg: 2023-02-05
    (13, 3, 5,  '2023-02-18', 'credit_card', 27.99),
    (14, 3, 11, '2023-04-10', 'debit_card',  20.00),
    (15, 3, 17, '2023-07-30', 'credit_card', 22.99),

    -- Customer 4 (Liam Foster) - reg: 2023-02-14
    (16, 4, 9,  '2023-02-28', 'paypal',      25.50),
    (17, 4, 20, '2023-06-05', 'credit_card', 13.99),

    -- Customer 5 (Ava Richardson) - reg: 2023-03-01
    -- First day: 3 books on 2023-03-01 (same as registration)
    (18, 5, 4,  '2023-03-01', 'credit_card', 22.50),
    (19, 5, 16, '2023-03-01', 'credit_card', 18.50),
    (20, 5, 23, '2023-03-01', 'debit_card',  21.50),
    (21, 5, 6,  '2023-05-18', 'paypal',      18.99),
    (22, 5, 13, '2023-07-22', 'credit_card', 17.50),
    (23, 5, 19, '2023-09-10', 'debit_card',  24.50),
    -- Last day: 3 books on 2023-11-08
    (24, 5, 21, '2023-11-08', 'credit_card', 16.50),
    (25, 5, 25, '2023-11-08', 'paypal',      19.50),
    (26, 5, 2,  '2023-11-08', 'credit_card', 19.99),

    -- Customer 6 (Lucas Hayes) - reg: 2023-03-18
    (27, 6, 1,  '2023-04-01', 'debit_card',  24.99),
    (28, 6, 14, '2023-08-12', 'credit_card', 26.99),

    -- Customer 7 (Sophia Coleman) - reg: 2023-04-02
    -- First day: 3 books on 2023-04-02 (same as registration)
    (29, 7, 3,  '2023-04-02', 'paypal',      29.99),
    (30, 7, 7,  '2023-04-02', 'paypal',      21.99),
    (31, 7, 20, '2023-04-02', 'paypal',      13.99),
    (32, 7, 9,  '2023-06-20', 'credit_card', 25.50),
    -- Last day: 3 books on 2023-10-25
    (33, 7, 11, '2023-10-25', 'debit_card',  20.00),
    (34, 7, 15, '2023-10-25', 'credit_card', 15.99),
    (35, 7, 24, '2023-10-25', 'debit_card',  17.99),

    -- Customer 8 (Mason Brooks) - reg: 2023-04-15
    (36, 8, 5,  '2023-04-28', 'credit_card', 27.99),

    -- Customer 9 (Isabella Reed) - reg: 2023-05-10
    (37, 9, 22, '2023-05-15', 'debit_card',  28.99),
    (38, 9, 10, '2023-08-03', 'paypal',      23.99),

    -- Customer 10 (Ethan Price) - reg: 2023-05-28
    (39, 10, 17, '2023-06-10', 'credit_card', 22.99),
    (40, 10, 25, '2023-09-30', 'debit_card',  19.50);

-- ============================================================
-- Meta DE Interview Practice: Grocery Store Schema
-- ============================================================
-- Matches the exact schema from Meta's SQL interview platform.
-- Tables: products, product_classes, sales, promotions
--
-- Supports Meta Official questions:
--   16. Filter: % of products both low fat AND recyclable (= 15.38%)
--   17. Rank: Top 5 single-channel media types by promo spend
--   18. Case: % of valid promo transactions on first/last day
--   19. Join pt 1: Units sold by product family with promo ratio
--   20. Join pt 2: % of product categories never sold
-- ============================================================

CREATE TABLE IF NOT EXISTS product_classes (
    product_class_id INTEGER PRIMARY KEY,
    product_subcategory TEXT,
    product_category TEXT,
    product_department TEXT,
    product_family TEXT
);

CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY,
    product_class_id INTEGER REFERENCES product_classes(product_class_id),
    brand_name TEXT,
    product_name TEXT,
    is_low_fat_flg TINYINT,
    is_recyclable_flg TINYINT,
    gross_weight DECIMAL(10,2),
    net_weight DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS promotions (
    promotion_id INTEGER PRIMARY KEY,
    promotion_name TEXT,
    media_type TEXT,
    cost DECIMAL(10,2),
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS sales (
    product_id INTEGER REFERENCES products(product_id),
    store_id INTEGER,
    customer_id INTEGER,
    promotion_id INTEGER REFERENCES promotions(promotion_id),
    store_sales DECIMAL(10,2),
    store_cost DECIMAL(10,2),
    units_sold DECIMAL(10,2),
    transaction_date DATE
);

-- ============================================================
-- Product Classes (12 classes, 9 distinct categories)
-- Categories with sales: Snacks, Dairy, Beverages, Hot Beverages, Cleaning, Paper Products
-- Categories never sold: Personal Care, Supplements, Pet Food
-- ============================================================
INSERT OR IGNORE INTO product_classes (product_class_id, product_subcategory, product_category, product_department, product_family) VALUES
    (1,  'Potato Chips',       'Snacks',         'Packaged Foods', 'Food'),
    (2,  'Crackers',           'Snacks',         'Packaged Foods', 'Food'),
    (3,  'Whole Milk',         'Dairy',          'Refrigerated',   'Food'),
    (4,  'Yogurt',             'Dairy',          'Refrigerated',   'Food'),
    (5,  'Orange Juice',       'Beverages',      'Refrigerated',   'Drink'),
    (6,  'Soda',               'Beverages',      'Packaged Foods', 'Drink'),
    (7,  'Ground Coffee',      'Hot Beverages',  'Packaged Foods', 'Drink'),
    (8,  'Laundry Detergent',  'Cleaning',       'Household',      'Non-Food'),
    (9,  'Paper Towels',       'Paper Products', 'Household',      'Non-Food'),
    (10, 'Shampoo',            'Personal Care',  'Health & Beauty','Non-Food'),
    (11, 'Vitamins',           'Supplements',    'Health & Beauty','Non-Food'),
    (12, 'Dog Food',           'Pet Food',       'Pet',            'Non-Food');

-- ============================================================
-- Products (13 total — exactly 2 are both low_fat AND recyclable → 15.38%)
-- ============================================================
INSERT OR IGNORE INTO products (product_id, product_class_id, brand_name, product_name, is_low_fat_flg, is_recyclable_flg, gross_weight, net_weight) VALUES
    (1,  1,  'Lays',            'Classic Chips',        0, 1, 300.0,  250.0),
    (2,  1,  'Pringles',        'Light Crisps',         1, 1, 150.0,  130.0),  -- both ✓
    (3,  2,  'Ritz',            'Original Crackers',    0, 1, 200.0,  180.0),
    (4,  3,  'Horizon',         'Organic Whole Milk',   0, 1, 1000.0, 946.0),
    (5,  4,  'Chobani',         'Greek Yogurt',         1, 0, 170.0,  150.0),
    (6,  5,  'Tropicana',       'Orange Juice',         1, 1, 500.0,  473.0),  -- both ✓
    (7,  5,  'Minute Maid',     'Apple Juice',          1, 0, 500.0,  473.0),
    (8,  6,  'Coca-Cola',       'Classic Coke',         0, 1, 355.0,  355.0),
    (9,  6,  'Pepsi',           'Diet Pepsi',           1, 0, 355.0,  355.0),
    (10, 7,  'Folgers',         'Classic Roast',        0, 0, 500.0,  450.0),
    (11, 8,  'Tide',            'Liquid Detergent',     0, 1, 2000.0, 1800.0),
    (12, 9,  'Bounty',          'Paper Towels',         0, 0, 500.0,  450.0),
    (13, 10, 'Head & Shoulders','Classic Shampoo',      0, 1, 400.0,  350.0);
    -- Note: No products in classes 11 (Supplements) or 12 (Pet Food)
    -- Product 13 (Personal Care) exists but has no sales

-- ============================================================
-- Promotions (10 total: 7 single-channel, 3 multi-channel)
-- Single-channel = media_type without commas
-- ============================================================
INSERT OR IGNORE INTO promotions (promotion_id, promotion_name, media_type, cost, start_date, end_date) VALUES
    (1,  'Summer Sale',       'TV',                    5000.00,  '2023-06-01', '2023-06-30'),
    (2,  'Back to School',    'Radio',                 3000.00,  '2023-08-15', '2023-09-15'),
    (3,  'Holiday Special',   'TV, Radio',             8000.00,  '2023-12-01', '2023-12-31'),
    (4,  'Spring Clearance',  'Newspaper',             2000.00,  '2023-03-01', '2023-03-31'),
    (5,  'Flash Friday',      'Email',                 1500.00,  '2023-07-07', '2023-07-14'),
    (6,  'Weekend Deal',      'Social Media',          2500.00,  '2023-09-01', '2023-09-03'),
    (7,  'Bundle Bonanza',    'Email, Social Media',   4000.00,  '2023-10-01', '2023-10-31'),
    (8,  'Morning Special',   'In-Store',              1000.00,  '2023-04-01', '2023-04-30'),
    (9,  'Super Bowl',        'TV, Radio, Newspaper', 12000.00,  '2023-02-10', '2023-02-13'),
    (10, 'New Year Kick-off', 'In-Store',               800.00,  '2023-01-01', '2023-01-31');

-- ============================================================
-- Sales (25 rows)
-- Mix of promoted and non-promoted sales across product families.
-- Some transactions land on promo start/end dates (for Q18).
-- No sales for product 13 (Personal Care) → never sold category.
-- ============================================================
INSERT INTO sales (product_id, store_id, customer_id, promotion_id, store_sales, store_cost, units_sold, transaction_date) VALUES
    -- Promo 1: Summer Sale (TV, 2023-06-01 to 2023-06-30)
    (1,  1, 101, 1, 4.99,  2.50, 3.0, '2023-06-01'),   -- start date
    (2,  1, 102, 1, 3.99,  2.00, 2.0, '2023-06-15'),   -- middle
    (6,  2, 103, 1, 5.49,  3.00, 4.0, '2023-06-30'),   -- end date

    -- Promo 2: Back to School (Radio, 2023-08-15 to 2023-09-15)
    (3,  1, 104, 2, 3.29,  1.50, 5.0, '2023-08-15'),   -- start date
    (10, 2, 105, 2, 8.99,  5.00, 2.0, '2023-09-01'),   -- middle

    -- Promo 4: Spring Clearance (Newspaper, 2023-03-01 to 2023-03-31)
    (4,  3, 106, 4, 4.49,  2.50, 3.0, '2023-03-15'),   -- middle
    (5,  1, 107, 4, 1.29,  0.60, 6.0, '2023-03-31'),   -- end date

    -- Promo 5: Flash Friday (Email, 2023-07-07 to 2023-07-14)
    (8,  2, 108, 5, 1.99,  0.80, 10.0, '2023-07-07'),  -- start date
    (9,  3, 109, 5, 1.79,  0.70,  8.0, '2023-07-14'),  -- end date

    -- Promo 8: Morning Special (In-Store, 2023-04-01 to 2023-04-30)
    (11, 1, 110, 8, 12.99, 7.00, 2.0, '2023-04-10'),   -- middle

    -- Non-promoted sales (promotion_id = NULL)
    (1,  2, 111, NULL, 4.99,  2.50, 2.0, '2023-02-10'),
    (2,  3, 112, NULL, 3.99,  2.00, 1.0, '2023-03-05'),
    (4,  1, 113, NULL, 4.49,  2.50, 2.0, '2023-05-20'),
    (5,  2, 114, NULL, 1.29,  0.60, 4.0, '2023-06-12'),
    (6,  3, 115, NULL, 5.49,  3.00, 3.0, '2023-07-22'),
    (7,  1, 116, NULL, 4.99,  2.80, 2.0, '2023-08-05'),
    (8,  2, 117, NULL, 1.99,  0.80, 6.0, '2023-09-18'),
    (9,  3, 118, NULL, 1.79,  0.70, 5.0, '2023-10-03'),
    (10, 1, 119, NULL, 8.99,  5.00, 1.0, '2023-11-15'),
    (11, 2, 120, NULL, 12.99, 7.00, 1.0, '2023-01-20'),
    (12, 3, 121, NULL, 6.99,  3.50, 3.0, '2023-04-22'),
    (3,  1, 122, NULL, 3.29,  1.50, 2.0, '2023-05-10'),
    (7,  2, 123, NULL, 4.99,  2.80, 5.0, '2023-12-01'),
    (1,  3, 124, NULL, 4.99,  2.50, 4.0, '2023-11-28'),
    (12, 1, 125, NULL, 6.99,  3.50, 2.0, '2023-08-30');

-- ============================================================
-- Payment Processing Schema (Experience-Based Questions)
-- ============================================================
-- Supports IDs 21-28: ROW_NUMBER dedup, multi-level CTEs,
-- anti-join cascading match, COALESCE fallback, self-join
-- hierarchy, incremental upsert, currency conversion.
-- SQLite-compatible (sql.js): TEXT dates, REAL decimals.
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_sales_agents (
    person_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    subsidiary_id INTEGER,
    manager_email TEXT,
    region TEXT,
    is_active INTEGER DEFAULT 1,
    created_date TEXT
);

CREATE TABLE IF NOT EXISTS payment_clients (
    client_id INTEGER PRIMARY KEY,
    client_name TEXT NOT NULL,
    multi_client_id INTEGER REFERENCES payment_clients(client_id),
    sales_agent_id INTEGER,
    country_code TEXT,
    region TEXT,
    client_status TEXT DEFAULT 'active',
    onboarding_date TEXT
);

CREATE TABLE IF NOT EXISTS payment_currency_rates (
    rate_id INTEGER PRIMARY KEY,
    currency_code TEXT NOT NULL,
    rate_date TEXT NOT NULL,
    rate_to_usd REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    txn_id INTEGER PRIMARY KEY,
    client_id INTEGER REFERENCES payment_clients(client_id),
    amount REAL,
    currency_code TEXT,
    txn_date TEXT,
    txn_status TEXT
);

CREATE TABLE IF NOT EXISTS payment_banks (
    bank_id INTEGER NOT NULL,
    subsidiary_id INTEGER NOT NULL,
    bank_name TEXT,
    swift_code TEXT,
    country_code TEXT,
    is_active INTEGER DEFAULT 1,
    updated_date TEXT,
    PRIMARY KEY (bank_id, subsidiary_id)
);

CREATE TABLE IF NOT EXISTS payment_banks_staging (
    bank_id INTEGER NOT NULL,
    subsidiary_id INTEGER NOT NULL,
    bank_name TEXT,
    swift_code TEXT,
    country_code TEXT,
    is_active INTEGER DEFAULT 1,
    updated_date TEXT
);

-- ============================================================
-- Payment Sales Agents (20 rows)
-- Duplicate emails: sarah.cohen (1,6), david.levy (2,7),
-- jessica.park (5,13), rachel.green (3,14), kevin.brown (15,19)
-- Manager emails form a matching hierarchy for anti-join cascade
-- ============================================================
INSERT OR IGNORE INTO payment_sales_agents (person_id, full_name, email, subsidiary_id, manager_email, region, is_active, created_date) VALUES
    (1,  'Sarah Cohen',    'sarah.cohen@nuvpay.com',     1, NULL,                            'EMEA',  1, '2021-03-15'),
    (2,  'David Levy',     'david.levy@nuvpay.com',      1, 'sarah.cohen@nuvpay.com',        'EMEA',  1, '2021-06-01'),
    (3,  'Rachel Green',   'rachel.green@nuvpay.com',    1, 'sarah.cohen@nuvpay.com',        'EMEA',  1, '2022-01-10'),
    (4,  'Michael Ross',   'michael.ross@nuvpay.com',    2, 'david.levy@nuvpay.com',         'NA',    1, '2021-08-20'),
    (5,  'Jessica Park',   'jessica.park@nuvpay.com',    2, NULL,                            'NA',    1, '2021-04-05'),
    (6,  'Sarah Cohen',    'sarah.cohen@nuvpay.com',     3, NULL,                            'APAC',  1, '2022-06-01'),
    (7,  'David Levy',     'david.levy@nuvpay.com',      3, 'sarah.cohen@nuvpay.com',        'APAC',  1, '2022-07-15'),
    (8,  'Emma Watson',    'emma.watson@payflow.com',    3, 'jessica.park@nuvpay.com',       'APAC',  1, '2022-03-10'),
    (9,  'James Chen',     'james.chen@payflow.com',     4, 'emma.watson@payflow.com',       'APAC',  1, '2022-09-01'),
    (10, 'Maria Santos',   'maria.santos@payflow.com',   4, 'unknown.mgr@payflow.com',       'LATAM', 1, '2023-01-15'),
    (11, 'Tom Wilson',     'tom.wilson@nuvpay.com',      1, 'rachel.green@nuvpay.com',       'EMEA',  1, '2022-05-20'),
    (12, 'Ana Silva',      'ana.silva@payflow.com',      5, 'missing@other.com',             'LATAM', 1, '2023-03-01'),
    (13, 'Jessica Park',   'jessica.park@nuvpay.com',    4, NULL,                            'APAC',  0, '2023-04-05'),
    (14, 'Rachel Green',   'rachel.green@nuvpay.com',    2, 'sarah.cohen@nuvpay.com',        'NA',    1, '2023-01-10'),
    (15, 'Kevin Brown',    'kevin.brown@acqpay.com',     5, NULL,                            'LATAM', 1, '2023-06-01'),
    (16, 'Lisa Wang',      'lisa.wang@nuvpay.com',       1, 'tom.wilson@nuvpay.com',         'EMEA',  1, '2023-02-15'),
    (17, 'Omar Hassan',    'omar.hassan@acqpay.com',     5, 'kevin.brown@acqpay.com',        'LATAM', 1, '2023-07-01'),
    (18, 'Priya Sharma',   'priya.sharma@nuvpay.com',    3, NULL,                            'APAC',  1, '2023-04-10'),
    (19, 'Kevin Brown',    'kevin.brown@acqpay.com',     2, NULL,                            'NA',    0, '2022-12-01'),
    (20, 'Alex Turner',    'alex.turner@nuvpay.com',     1, 'non.existent@nuvpay.com',       'EMEA',  1, '2023-08-01');

-- ============================================================
-- Payment Clients (15 rows)
-- Hierarchy via multi_client_id self-reference:
--   GlobalPay Corp(1) → EU(2), UK(3)
--   MerchantFlow(4) → Canada(5)
--   PayRight(6) → NZ(7)
--   QuickCharge(8) → MX(9)
--   EuroMerchant(11) → AT(12)
--   AsiaGate(13) → HK(14)
-- ============================================================
INSERT OR IGNORE INTO payment_clients (client_id, client_name, multi_client_id, sales_agent_id, country_code, region, client_status, onboarding_date) VALUES
    (1,  'GlobalPay Corp',      NULL, 1,    'US', 'NA',    'active',    '2020-01-15'),
    (2,  'GlobalPay EU',        1,    2,    'DE', 'EMEA',  'active',    '2020-06-01'),
    (3,  'GlobalPay UK',        1,    3,    'GB', 'EMEA',  'active',    '2020-08-20'),
    (4,  'MerchantFlow Inc',    NULL, 4,    'US', 'NA',    'active',    '2021-02-10'),
    (5,  'MerchantFlow Canada', 4,    5,    'CA', 'NA',    'active',    '2021-05-15'),
    (6,  'PayRight Ltd',        NULL, 8,    'AU', 'APAC',  'active',    '2021-09-01'),
    (7,  'PayRight NZ',         6,    9,    'NZ', 'APAC',  'active',    '2022-01-10'),
    (8,  'QuickCharge SA',      NULL, 10,   'BR', 'LATAM', 'active',    '2022-03-20'),
    (9,  'QuickCharge MX',      8,    12,   'MX', 'LATAM', 'active',    '2022-07-01'),
    (10, 'TechPay Solutions',   NULL, 11,   'IL', 'EMEA',  'suspended', '2020-11-05'),
    (11, 'EuroMerchant GmbH',   NULL, 16,   'DE', 'EMEA',  'active',    '2023-01-15'),
    (12, 'EuroMerchant AT',     11,   16,   'AT', 'EMEA',  'active',    '2023-04-01'),
    (13, 'AsiaGate Payments',   NULL, 18,   'SG', 'APAC',  'active',    '2023-05-20'),
    (14, 'AsiaGate HK',         13,   18,   'HK', 'APAC',  'pending',   '2023-09-01'),
    (15, 'NordicPay AB',        NULL, NULL, 'SE', 'EMEA',  'inactive',  '2019-06-15');

-- ============================================================
-- Currency Rates (15 rows — 5 currencies × 3 months)
-- ============================================================
INSERT OR IGNORE INTO payment_currency_rates (rate_id, currency_code, rate_date, rate_to_usd) VALUES
    (1,  'EUR', '2024-01-15', 1.0875),
    (2,  'GBP', '2024-01-15', 1.2690),
    (3,  'AUD', '2024-01-15', 0.6580),
    (4,  'BRL', '2024-01-15', 0.2045),
    (5,  'CAD', '2024-01-15', 0.7450),
    (6,  'EUR', '2024-02-15', 1.0780),
    (7,  'GBP', '2024-02-15', 1.2610),
    (8,  'AUD', '2024-02-15', 0.6520),
    (9,  'BRL', '2024-02-15', 0.2010),
    (10, 'CAD', '2024-02-15', 0.7410),
    (11, 'EUR', '2024-03-15', 1.0920),
    (12, 'GBP', '2024-03-15', 1.2750),
    (13, 'AUD', '2024-03-15', 0.6610),
    (14, 'BRL', '2024-03-15', 0.1980),
    (15, 'CAD', '2024-03-15', 0.7390);

-- ============================================================
-- Payment Transactions (20 rows)
-- Mix of currencies, statuses, and clients for conversion queries
-- USD transactions don't need conversion (rate = 1.0)
-- ============================================================
INSERT OR IGNORE INTO payment_transactions (txn_id, client_id, amount, currency_code, txn_date, txn_status) VALUES
    (1,  1,  15000.00, 'USD', '2024-01-10', 'approved'),
    (2,  2,  12500.00, 'EUR', '2024-01-15', 'approved'),
    (3,  3,   8750.00, 'GBP', '2024-01-18', 'approved'),
    (4,  4,  22000.00, 'USD', '2024-01-22', 'approved'),
    (5,  5,   5400.00, 'CAD', '2024-01-25', 'declined'),
    (6,  6,  18200.00, 'AUD', '2024-02-01', 'approved'),
    (7,  7,   3100.00, 'AUD', '2024-02-05', 'approved'),
    (8,  8,  45000.00, 'BRL', '2024-02-10', 'approved'),
    (9,  9,  28000.00, 'BRL', '2024-02-15', 'approved'),
    (10, 1,  17500.00, 'USD', '2024-02-18', 'approved'),
    (11, 2,   9800.00, 'EUR', '2024-02-20', 'approved'),
    (12, 10,  6200.00, 'USD', '2024-03-01', 'chargeback'),
    (13, 11, 14300.00, 'EUR', '2024-03-05', 'approved'),
    (14, 3,  11200.00, 'GBP', '2024-03-10', 'approved'),
    (15, 6,  21500.00, 'AUD', '2024-03-15', 'approved'),
    (16, 4,  19000.00, 'USD', '2024-03-18', 'approved'),
    (17, 8,  38000.00, 'BRL', '2024-03-20', 'declined'),
    (18, 13,  7600.00, 'USD', '2024-03-22', 'approved'),
    (19, 5,   4200.00, 'CAD', '2024-03-25', 'approved'),
    (20, 12,  8900.00, 'EUR', '2024-03-28', 'approved');

-- ============================================================
-- Payment Banks — target table (7 rows, composite PK)
-- ============================================================
INSERT OR IGNORE INTO payment_banks (bank_id, subsidiary_id, bank_name, swift_code, country_code, is_active, updated_date) VALUES
    (1, 1, 'First National Bank',  'FNBKUS33', 'US', 1, '2024-01-01'),
    (2, 1, 'Chase Manhattan',      'CHASUS33', 'US', 1, '2024-01-01'),
    (3, 2, 'Deutsche Bank',        'DEUTDEFF', 'DE', 1, '2024-01-01'),
    (4, 2, 'Barclays UK',          'BARCGB22', 'GB', 1, '2024-01-01'),
    (5, 3, 'ANZ Bank',             'ANZBAU3M', 'AU', 1, '2024-01-01'),
    (6, 4, 'Banco do Brasil',      'BRASBRRJ', 'BR', 1, '2024-01-01'),
    (7, 5, 'Santander',            'BSCHESMM', 'ES', 0, '2023-06-15');

-- ============================================================
-- Payment Banks Staging — incoming changes (5 rows: 3 updates, 2 new)
-- ============================================================
INSERT OR IGNORE INTO payment_banks_staging (bank_id, subsidiary_id, bank_name, swift_code, country_code, is_active, updated_date) VALUES
    (3, 2, 'Deutsche Bank AG',     'DEUTDEFF', 'DE', 1, '2024-03-01'),
    (5, 3, 'ANZ Banking Group',    'ANZBAU3M', 'AU', 1, '2024-03-01'),
    (7, 5, 'Santander Group',      'BSCHESMM', 'ES', 1, '2024-03-01'),
    (8, 1, 'Wells Fargo',          'WFBIUS6S', 'US', 1, '2024-03-01'),
    (9, 4, 'Itau Unibanco',        'ITAUBRSP', 'BR', 1, '2024-03-01');

-- ============================================================
-- User Events Table (for DAU/WAU, funnel, sessionization patterns)
-- ============================================================
-- Used by sql-advanced questions 500-524:
--   - Sessionization (30-min gap)
--   - DAU/WAU/MAU calculations
--   - Conversion funnels
--   - Streak detection
--   - Power user identification
-- ============================================================

CREATE TABLE IF NOT EXISTS user_events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_ts TEXT NOT NULL
);

-- 100 events across 20 users over 30 days
-- Mix of event types: page_view, click, search, purchase, app_open, add_to_cart, checkout_start
-- Patterns:
--   Users 1-5: power users (daily activity, multiple event types)
--   Users 6-10: regular users (every 2-3 days)
--   Users 11-15: casual users (weekly)
--   Users 16-20: churned users (active early, then stopped)

INSERT INTO user_events (event_id, user_id, event_type, event_ts) VALUES
    -- User 1: power user, daily activity
    (1,  1, 'page_view',      '2024-03-01 08:15:00'),
    (2,  1, 'search',         '2024-03-01 08:20:00'),
    (3,  1, 'click',          '2024-03-01 08:22:00'),
    (4,  1, 'add_to_cart',    '2024-03-01 08:25:00'),
    (5,  1, 'purchase',       '2024-03-01 08:30:00'),
    (6,  1, 'page_view',      '2024-03-02 09:00:00'),
    (7,  1, 'click',          '2024-03-02 09:05:00'),
    (8,  1, 'page_view',      '2024-03-03 10:15:00'),
    (9,  1, 'search',         '2024-03-03 10:20:00'),
    (10, 1, 'purchase',       '2024-03-03 10:45:00'),
    (11, 1, 'page_view',      '2024-03-04 08:00:00'),
    (12, 1, 'click',          '2024-03-05 11:30:00'),
    (13, 1, 'page_view',      '2024-03-06 09:00:00'),
    (14, 1, 'search',         '2024-03-07 14:00:00'),
    (15, 1, 'purchase',       '2024-03-07 14:15:00'),

    -- User 2: power user
    (16, 2, 'page_view',      '2024-03-01 10:00:00'),
    (17, 2, 'search',         '2024-03-01 10:05:00'),
    (18, 2, 'page_view',      '2024-03-02 11:00:00'),
    (19, 2, 'click',          '2024-03-02 11:10:00'),
    (20, 2, 'add_to_cart',    '2024-03-02 11:15:00'),
    (21, 2, 'page_view',      '2024-03-03 08:30:00'),
    (22, 2, 'page_view',      '2024-03-04 09:00:00'),
    (23, 2, 'search',         '2024-03-05 13:00:00'),
    (24, 2, 'purchase',       '2024-03-05 13:20:00'),
    (25, 2, 'page_view',      '2024-03-06 10:00:00'),

    -- User 3: power user with sessions
    (26, 3, 'app_open',       '2024-03-01 07:00:00'),
    (27, 3, 'page_view',      '2024-03-01 07:02:00'),
    (28, 3, 'search',         '2024-03-01 07:10:00'),
    (29, 3, 'page_view',      '2024-03-01 09:00:00'),
    (30, 3, 'click',          '2024-03-01 09:05:00'),
    (31, 3, 'page_view',      '2024-03-02 08:00:00'),
    (32, 3, 'search',         '2024-03-03 14:00:00'),
    (33, 3, 'click',          '2024-03-03 14:02:00'),
    (34, 3, 'add_to_cart',    '2024-03-03 14:05:00'),
    (35, 3, 'checkout_start', '2024-03-03 14:06:00'),
    (36, 3, 'purchase',       '2024-03-03 14:10:00'),
    (37, 3, 'page_view',      '2024-03-04 10:00:00'),
    (38, 3, 'page_view',      '2024-03-05 08:00:00'),

    -- User 4: power user
    (39, 4, 'page_view',      '2024-03-01 12:00:00'),
    (40, 4, 'click',          '2024-03-01 12:05:00'),
    (41, 4, 'page_view',      '2024-03-02 13:00:00'),
    (42, 4, 'search',         '2024-03-03 09:00:00'),
    (43, 4, 'purchase',       '2024-03-04 15:00:00'),
    (44, 4, 'page_view',      '2024-03-05 10:00:00'),
    (45, 4, 'page_view',      '2024-03-06 11:00:00'),

    -- User 5: power user
    (46, 5, 'app_open',       '2024-03-01 06:00:00'),
    (47, 5, 'page_view',      '2024-03-01 06:02:00'),
    (48, 5, 'search',         '2024-03-02 07:00:00'),
    (49, 5, 'click',          '2024-03-02 07:05:00'),
    (50, 5, 'page_view',      '2024-03-03 08:00:00'),
    (51, 5, 'add_to_cart',    '2024-03-04 09:00:00'),
    (52, 5, 'purchase',       '2024-03-04 09:10:00'),
    (53, 5, 'page_view',      '2024-03-05 10:00:00'),

    -- User 6: regular user (every 2-3 days)
    (54, 6, 'page_view',      '2024-03-01 14:00:00'),
    (55, 6, 'click',          '2024-03-01 14:10:00'),
    (56, 6, 'page_view',      '2024-03-03 15:00:00'),
    (57, 6, 'search',         '2024-03-05 11:00:00'),
    (58, 6, 'page_view',      '2024-03-07 09:00:00'),
    (59, 6, 'purchase',       '2024-03-07 09:15:00'),

    -- User 7: regular user
    (60, 7, 'page_view',      '2024-03-02 10:00:00'),
    (61, 7, 'search',         '2024-03-02 10:05:00'),
    (62, 7, 'page_view',      '2024-03-04 12:00:00'),
    (63, 7, 'click',          '2024-03-06 14:00:00'),
    (64, 7, 'page_view',      '2024-03-08 09:00:00'),

    -- User 8: regular user
    (65, 8, 'app_open',       '2024-03-01 08:00:00'),
    (66, 8, 'page_view',      '2024-03-01 08:05:00'),
    (67, 8, 'page_view',      '2024-03-03 10:00:00'),
    (68, 8, 'search',         '2024-03-06 11:00:00'),
    (69, 8, 'click',          '2024-03-06 11:05:00'),

    -- User 9: regular user
    (70, 9, 'page_view',      '2024-03-02 16:00:00'),
    (71, 9, 'page_view',      '2024-03-04 17:00:00'),
    (72, 9, 'search',         '2024-03-07 10:00:00'),

    -- User 10: regular user
    (73, 10, 'page_view',     '2024-03-01 09:00:00'),
    (74, 10, 'click',         '2024-03-03 11:00:00'),
    (75, 10, 'page_view',     '2024-03-05 14:00:00'),
    (76, 10, 'search',        '2024-03-08 10:00:00'),

    -- User 11: casual user (weekly)
    (77, 11, 'page_view',     '2024-03-01 10:00:00'),
    (78, 11, 'page_view',     '2024-03-08 10:00:00'),

    -- User 12: casual user
    (79, 12, 'page_view',     '2024-03-03 12:00:00'),
    (80, 12, 'search',        '2024-03-03 12:05:00'),

    -- User 13: casual user
    (81, 13, 'page_view',     '2024-03-05 15:00:00'),
    (82, 13, 'click',         '2024-03-05 15:10:00'),

    -- User 14: casual user
    (83, 14, 'app_open',      '2024-03-02 08:00:00'),
    (84, 14, 'page_view',     '2024-03-02 08:02:00'),

    -- User 15: casual user
    (85, 15, 'page_view',     '2024-03-07 13:00:00'),

    -- User 16: churned (active early, stopped)
    (86, 16, 'page_view',     '2024-02-01 10:00:00'),
    (87, 16, 'search',        '2024-02-01 10:05:00'),
    (88, 16, 'click',         '2024-02-02 11:00:00'),
    (89, 16, 'page_view',     '2024-02-03 09:00:00'),

    -- User 17: churned
    (90, 17, 'page_view',     '2024-02-01 14:00:00'),
    (91, 17, 'page_view',     '2024-02-02 15:00:00'),
    (92, 17, 'search',        '2024-02-05 10:00:00'),

    -- User 18: churned
    (93, 18, 'app_open',      '2024-02-03 08:00:00'),
    (94, 18, 'page_view',     '2024-02-03 08:05:00'),
    (95, 18, 'click',         '2024-02-04 09:00:00'),

    -- User 19: churned
    (96, 19, 'page_view',     '2024-02-02 12:00:00'),
    (97, 19, 'search',        '2024-02-02 12:10:00'),

    -- User 20: churned
    (98, 20, 'page_view',     '2024-02-01 16:00:00'),
    (99, 20, 'click',         '2024-02-01 16:05:00'),
    (100, 20, 'page_view',    '2024-02-03 10:00:00');
