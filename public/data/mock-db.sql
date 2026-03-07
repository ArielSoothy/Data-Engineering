-- Mock Database for SQL Interview Questions
-- Base tables setup
CREATE TABLE IF NOT EXISTS departments (
    department_id INTEGER PRIMARY KEY,
    department_name TEXT NOT NULL,
    location TEXT,
    budget DECIMAL(15,2),
    manager_id INTEGER
);

CREATE TABLE IF NOT EXISTS employees (
    employee_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    department_id INTEGER,
    salary DECIMAL(10,2),
    hire_date DATE,
    manager_id INTEGER,
    job_title TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE IF NOT EXISTS payroll (
    payroll_id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    salary DECIMAL(10,2),
    effective_date DATE,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Salary reviews table for year-over-year comparisons
CREATE TABLE IF NOT EXISTS salary_reviews (
    review_id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    review_date DATE,
    salary DECIMAL(10,2),
    performance_rating INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Orders table for running sum examples
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    order_date DATE,
    amount DECIMAL(10,2),
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table for normalized order-product relationships
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Order summary table for denormalization examples
CREATE TABLE IF NOT EXISTS order_summary (
    order_id INTEGER,
    customer_name TEXT,
    product_name TEXT,
    quantity INTEGER,
    price DECIMAL(10,2),
    total_amount DECIMAL(10,2)
);

-- Clean orders table for deduplication examples
DROP TABLE IF EXISTS orders_clean;
CREATE TABLE orders_clean AS
SELECT DISTINCT * FROM orders;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    signup_date DATE
);

-- Employees clean table (for deduplication examples)
DROP TABLE IF EXISTS employees_clean;
CREATE TABLE employees_clean AS
SELECT DISTINCT * FROM employees;

-- Sales data for percentage calculations
CREATE TABLE IF NOT EXISTS sales_data (
    sale_id INTEGER PRIMARY KEY,
    salesperson_id INTEGER,
    customer_id INTEGER,
    product_id INTEGER,
    sale_date DATE,
    sales_amount DECIMAL(10,2),
    FOREIGN KEY (salesperson_id) REFERENCES employees(employee_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Stock prices table for trend analysis
CREATE TABLE IF NOT EXISTS stock_prices (
    price_id INTEGER PRIMARY KEY,
    stock_symbol TEXT,
    date_recorded DATE,
    stock_price DECIMAL(10,2),
    volume INTEGER
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT,
    category TEXT,
    price DECIMAL(10,2),
    inventory INTEGER
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    status TEXT,
    assigned_employee_id INTEGER,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(employee_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    transaction_date DATE,
    amount DECIMAL(10,2),
    transaction_type TEXT,
    description TEXT,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Log events table
CREATE TABLE IF NOT EXISTS log_events (
    log_id INTEGER PRIMARY KEY,
    event_timestamp TIMESTAMP,
    level TEXT, -- 'INFO', 'WARNING', 'ERROR', etc.
    source TEXT,
    message TEXT,
    user_id INTEGER
);

-- Generic practice tables
CREATE TABLE IF NOT EXISTS table1 (
    id INTEGER PRIMARY KEY,
    column1 INTEGER,
    column2 TEXT,
    column3 DATE
);

CREATE TABLE IF NOT EXISTS table2 (
    id INTEGER PRIMARY KEY,
    column1 INTEGER,
    column2 TEXT,
    column3 DECIMAL(10,2),
    table1_id INTEGER,
    FOREIGN KEY (table1_id) REFERENCES table1(id)
);

CREATE TABLE IF NOT EXISTS table3 (
    id INTEGER PRIMARY KEY,
    column1 TEXT,
    column2 INTEGER,
    column3 BOOLEAN,
    table2_id INTEGER,
    FOREIGN KEY (table2_id) REFERENCES table2(id)
);

-- Sample data
INSERT OR IGNORE INTO departments (department_id, department_name, location, budget, manager_id) VALUES
    (1, 'Engineering', 'Seattle', 1200000.00, NULL),
    (2, 'Sales', 'New York', 900000.00, NULL),
    (3, 'Marketing', 'San Francisco', 800000.00, NULL),
    (4, 'HR', 'Chicago', 500000.00, NULL);

INSERT OR IGNORE INTO employees (employee_id, first_name, last_name, email, department_id, salary, hire_date, manager_id, job_title) VALUES
    (1, 'John', 'Smith', 'john.smith@company.com', 1, 100000.00, '2020-01-15', NULL, 'CTO'),
    (2, 'Alice', 'Johnson', 'alice.j@company.com', 1, 95000.00, '2020-02-01', 1, 'Sr. Developer'),
    (3, 'Bob', 'Wilson', 'bob.w@company.com', 2, 85000.00, '2020-03-15', NULL, 'Sales Director'),
    (4, 'Carol', 'Davis', 'carol.d@company.com', 3, 90000.00, '2020-04-01', NULL, 'Marketing Director'),
    (5, 'Eve', 'Brown', 'eve.b@company.com', 4, 75000.00, '2020-05-15', NULL, 'HR Director'),
    (6, 'Frank', 'Miller', 'frank.m@company.com', 2, 82000.00, '2020-06-01', 3, 'Account Executive'),
    (7, 'Grace', 'Taylor', 'grace.t@company.com', 1, 98000.00, '2020-07-15', 1, 'Sr. Developer'),
    (8, 'Henry', 'Clark', 'henry.c@company.com', 1, 85000.00, '2020-08-01', 1, 'Developer'),
    (9, 'Ivy', 'Lee', 'ivy.l@company.com', 3, 78000.00, '2020-09-15', 4, 'Marketing Manager'),
    (10, 'Jack', 'Wright', 'jack.w@company.com', 2, 80000.00, '2020-10-01', 3, 'Account Executive');

-- Now update the department manager_id references
UPDATE departments SET manager_id = 1 WHERE department_id = 1;
UPDATE departments SET manager_id = 3 WHERE department_id = 2;
UPDATE departments SET manager_id = 4 WHERE department_id = 3;
UPDATE departments SET manager_id = 5 WHERE department_id = 4;

INSERT OR IGNORE INTO table1 (id, column1, column2, column3) VALUES
    (1, 100, 'Value A', '2023-01-01'),
    (2, 200, 'Value B', '2023-02-01'),
    (3, 300, 'Value C', '2023-03-01'),
    (4, 400, 'Value D', '2023-04-01'),
    (5, 500, 'Value E', '2023-05-01');

INSERT OR IGNORE INTO table2 (id, column1, column2, column3, table1_id) VALUES
    (1, 10, 'First', 1000.50, 1),
    (2, 20, 'Second', 2000.75, 1),
    (3, 30, 'Third', 3000.25, 2),
    (4, 40, 'Fourth', 4000.00, 3),
    (5, 50, 'Fifth', 5000.50, 3),
    (6, 60, 'Sixth', 6000.75, 4);

INSERT OR IGNORE INTO table3 (id, column1, column2, column3, table2_id) VALUES
    (1, 'Row 1', 1000, true, 1),
    (2, 'Row 2', 2000, false, 2),
    (3, 'Row 3', 3000, true, 2),
    (4, 'Row 4', 4000, false, 3),
    (5, 'Row 5', 5000, true, 4),
    (6, 'Row 6', 6000, false, 5),
    (7, 'Row 7', 7000, true, 6);

-- Payroll history with some duplicate entries to simulate ETL errors
INSERT OR IGNORE INTO payroll (payroll_id, employee_id, salary, effective_date) VALUES
    (1, 1, 95000.00, '2020-01-15'),
    (2, 1, 98000.00, '2021-01-15'),
    (3, 1, 100000.00, '2022-01-15'),
    (4, 1, 100000.00, '2022-01-15'),  -- Duplicate entry
    (5, 2, 90000.00, '2020-02-01'),
    (6, 2, 92000.00, '2021-02-01'),
    (7, 2, 95000.00, '2022-02-01'),
    (8, 2, 95000.00, '2022-02-01'),  -- Duplicate entry
    (9, 3, 80000.00, '2020-03-15'),
    (10, 3, 82000.00, '2021-03-15'),
    (11, 3, 85000.00, '2022-03-15');

-- Salary reviews data
INSERT OR IGNORE INTO salary_reviews (review_id, employee_id, review_date, salary, performance_rating) VALUES
    (1, 1, '2020-12-15', 95000.00, 4),
    (2, 1, '2021-12-15', 98000.00, 5),
    (3, 1, '2022-12-15', 100000.00, 5),
    (4, 2, '2020-12-01', 90000.00, 3),
    (5, 2, '2021-12-01', 92000.00, 4),
    (6, 2, '2022-12-01', 95000.00, 4),
    (7, 3, '2020-12-15', 80000.00, 3),
    (8, 3, '2021-12-15', 82000.00, 3),
    (9, 3, '2022-12-15', 85000.00, 4);

-- Customer data
INSERT OR IGNORE INTO customers (customer_id, first_name, last_name, email, signup_date) VALUES
    (1, 'Michael', 'Jones', 'michael.j@example.com', '2020-01-10'),
    (2, 'Sarah', 'Williams', 'sarah.w@example.com', '2020-02-15'),
    (3, 'David', 'Brown', 'david.b@example.com', '2020-03-20'),
    (4, 'Jennifer', 'Miller', 'jennifer.m@example.com', '2020-04-25'),
    (5, 'Robert', 'Davis', 'robert.d@example.com', '2020-05-30');

-- Orders data
INSERT OR IGNORE INTO orders (order_id, customer_id, order_date, amount, created_timestamp) VALUES
    (1, 1, '2023-01-15', 250.00, '2023-01-15 09:30:00'),
    (2, 2, '2023-01-20', 120.50, '2023-01-20 10:15:00'),
    (3, 3, '2023-02-05', 75.25, '2023-02-05 11:45:00'),
    (4, 1, '2023-02-10', 310.75, '2023-02-10 14:20:00'),
    (5, 4, '2023-02-15', 420.00, '2023-02-15 16:30:00'),
    (6, 2, '2023-03-01', 85.50, '2023-03-01 09:15:00'),
    (7, 5, '2023-03-10', 150.00, '2023-03-10 13:10:00'),
    (8, 3, '2023-03-15', 200.25, '2023-03-15 15:45:00'),
    (9, 1, '2023-04-05', 175.00, '2023-04-05 11:20:00'),
    (10, 4, '2023-04-20', 95.75, '2023-04-20 10:05:00');

-- Products data
INSERT OR IGNORE INTO products (product_id, product_name, category, price, inventory) VALUES
    (1, 'Laptop Pro', 'Electronics', 1200.00, 50),
    (2, 'Smartphone X', 'Electronics', 800.00, 100),
    (3, 'Office Chair', 'Furniture', 120.00, 30),
    (4, 'Desk Lamp', 'Furniture', 45.00, 80),
    (5, 'Notebook', 'Stationery', 5.00, 500);

-- Sales data
INSERT OR IGNORE INTO sales_data (sale_id, salesperson_id, customer_id, product_id, sale_date, sales_amount) VALUES
    (1, 3, 1, 1, '2023-01-15', 1200.00),
    (2, 6, 2, 2, '2023-01-20', 800.00),
    (3, 10, 3, 3, '2023-02-05', 120.00),
    (4, 3, 1, 4, '2023-02-10', 45.00),
    (5, 6, 4, 1, '2023-02-15', 1200.00),
    (6, 10, 2, 5, '2023-03-01', 5.00),
    (7, 3, 5, 2, '2023-03-10', 800.00),
    (8, 6, 3, 1, '2023-03-15', 1200.00),
    (9, 10, 1, 3, '2023-04-05', 120.00),
    (10, 3, 4, 5, '2023-04-20', 5.00);

-- Projects data
INSERT OR IGNORE INTO projects (project_id, project_name, start_date, end_date, budget, status, assigned_employee_id) VALUES
    (1, 'Website Redesign', '2023-01-10', '2023-03-15', 50000.00, 'Completed', 2),
    (2, 'Mobile App Development', '2023-02-01', '2023-05-30', 120000.00, 'In Progress', 7),
    (3, 'Database Migration', '2023-01-15', '2023-04-20', 75000.00, 'Completed', 8),
    (4, 'CRM Implementation', '2023-03-01', '2023-07-15', 200000.00, 'In Progress', 1),
    (5, 'Network Security Audit', '2023-03-10', '2023-04-10', 30000.00, 'Completed', 2),
    (6, 'ERP Integration', '2023-04-01', '2023-09-30', 250000.00, 'In Progress', 7),
    (7, 'Cloud Migration', '2023-02-15', '2023-05-15', 100000.00, 'In Progress', 8),
    (8, 'Social Media Campaign', '2023-01-05', '2023-03-05', 25000.00, 'Completed', 9),
    (9, 'HR System Implementation', '2023-03-15', '2023-06-15', 80000.00, 'In Progress', 5),
    (10, 'Sales Training Program', '2023-04-01', '2023-05-15', 15000.00, 'In Progress', 3);

-- Transactions data
INSERT OR IGNORE INTO transactions (transaction_id, account_id, transaction_date, amount, transaction_type, description, created_timestamp) VALUES
    (1, 101, '2023-01-05', 500.00, 'DEPOSIT', 'Initial deposit', '2023-01-05 09:15:00'),
    (2, 102, '2023-01-10', 1000.00, 'DEPOSIT', 'Salary payment', '2023-01-10 10:30:00'),
    (3, 101, '2023-01-15', -200.00, 'WITHDRAWAL', 'ATM withdrawal', '2023-01-15 14:20:00'),
    (4, 103, '2023-01-20', 750.00, 'DEPOSIT', 'Client payment', '2023-01-20 16:45:00'),
    (5, 102, '2023-01-25', -300.00, 'PAYMENT', 'Utility bill', '2023-01-25 09:10:00'),
    (6, 101, '2023-02-01', 1200.00, 'DEPOSIT', 'Salary payment', '2023-02-01 11:05:00'),
    (7, 103, '2023-02-05', -150.00, 'WITHDRAWAL', 'ATM withdrawal', '2023-02-05 15:30:00'),
    (8, 102, '2023-02-10', -450.00, 'PAYMENT', 'Rent payment', '2023-02-10 09:45:00'),
    (9, 101, '2023-02-15', -120.00, 'PAYMENT', 'Phone bill', '2023-02-15 14:15:00'),
    (10, 103, '2023-02-20', 2000.00, 'DEPOSIT', 'Bonus payment', '2023-02-20 10:20:00'),
    (11, 101, '2023-02-25', -500.00, 'PAYMENT', 'Credit card bill', '2023-02-25 16:30:00'),
    (12, 102, '2023-03-01', 1000.00, 'DEPOSIT', 'Salary payment', '2023-03-01 09:15:00'),
    (13, 103, '2023-03-05', -200.00, 'WITHDRAWAL', 'Cash withdrawal', '2023-03-05 13:40:00'),
    (14, 101, '2023-03-10', -350.00, 'PAYMENT', 'Insurance premium', '2023-03-10 15:20:00'),
    (15, 102, '2023-03-15', -70.00, 'PAYMENT', 'Internet bill', '2023-03-15 10:05:00');

-- Log events data
INSERT OR IGNORE INTO log_events (log_id, event_timestamp, level, source, message, user_id) VALUES
    (1, '2023-01-15 08:30:15', 'INFO', 'Authentication Service', 'User login successful', 1),
    (2, '2023-01-15 09:45:22', 'WARNING', 'Payment Gateway', 'Payment attempt timeout', 3),
    (3, '2023-01-15 10:15:30', 'ERROR', 'Database Service', 'Connection pool exhausted', NULL),
    (4, '2023-01-15 11:20:45', 'INFO', 'User Management', 'New user registered', 5),
    (5, '2023-01-15 12:05:18', 'INFO', 'File Service', 'File upload completed', 2),
    (6, '2023-01-15 13:30:22', 'WARNING', 'API Gateway', 'Rate limit exceeded', 4),
    (7, '2023-01-15 14:45:35', 'ERROR', 'Authentication Service', 'Invalid credentials', NULL),
    (8, '2023-01-15 15:10:12', 'INFO', 'Email Service', 'Newsletter sent successfully', NULL),
    (9, '2023-01-15 16:25:50', 'WARNING', 'Storage Service', 'Disk space below 10%', NULL),
    (10, '2023-01-15 17:40:28', 'INFO', 'User Management', 'Password changed', 3),
    (11, '2023-01-16 09:15:33', 'INFO', 'Authentication Service', 'User logout', 2),
    (12, '2023-01-16 10:30:45', 'ERROR', 'Payment Gateway', 'Transaction failed', 5),
    (13, '2023-01-16 11:20:15', 'INFO', 'Search Service', 'Search index rebuilt', NULL),
    (14, '2023-01-16 12:45:22', 'WARNING', 'Cache Service', 'Cache eviction rate high', NULL),
    (15, '2023-01-16 13:50:40', 'INFO', 'Authentication Service', 'User login successful', 4);

-- Order Items data
INSERT OR IGNORE INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 1, 1200.00),
    (2, 1, 5, 10, 5.00),
    (3, 2, 2, 1, 800.00),
    (4, 3, 3, 1, 120.00),
    (5, 4, 1, 1, 1200.00),
    (6, 4, 4, 3, 45.00),
    (7, 5, 1, 1, 1200.00),
    (8, 5, 2, 1, 800.00),
    (9, 6, 5, 17, 5.00),
    (10, 7, 2, 1, 800.00),
    (11, 8, 3, 2, 120.00),
    (12, 9, 4, 4, 45.00),
    (13, 10, 5, 20, 5.00);

-- Order Summary data (denormalized)
INSERT OR IGNORE INTO order_summary (order_id, customer_name, product_name, quantity, price, total_amount) VALUES
    (1, 'Michael Jones', 'Laptop Pro', 1, 1200.00, 1200.00),
    (1, 'Michael Jones', 'Notebook', 10, 5.00, 50.00),
    (2, 'Sarah Williams', 'Smartphone X', 1, 800.00, 800.00),
    (3, 'David Brown', 'Office Chair', 1, 120.00, 120.00),
    (4, 'Michael Jones', 'Laptop Pro', 1, 1200.00, 1200.00),
    (4, 'Michael Jones', 'Desk Lamp', 3, 45.00, 135.00),
    (5, 'Jennifer Miller', 'Laptop Pro', 1, 1200.00, 1200.00),
    (5, 'Jennifer Miller', 'Smartphone X', 1, 800.00, 800.00),
    (6, 'Sarah Williams', 'Notebook', 17, 5.00, 85.00),
    (7, 'Robert Davis', 'Smartphone X', 1, 800.00, 800.00),
    (8, 'David Brown', 'Office Chair', 2, 120.00, 240.00),
    (9, 'Michael Jones', 'Desk Lamp', 4, 45.00, 180.00),
    (10, 'Jennifer Miller', 'Notebook', 20, 5.00, 100.00);

-- Stock prices data
INSERT OR IGNORE INTO stock_prices (price_id, stock_symbol, date_recorded, stock_price, volume) VALUES
    (1, 'ACME', '2023-01-01', 150.00, 1000000),
    (2, 'ACME', '2023-01-02', 152.50, 1200000),
    (3, 'ACME', '2023-01-03', 148.75, 900000),
    (4, 'ACME', '2023-01-04', 153.25, 1100000),
    (5, 'ACME', '2023-01-05', 155.00, 1300000),
    (6, 'XYZ', '2023-01-01', 75.00, 500000),
    (7, 'XYZ', '2023-01-02', 76.25, 550000),
    (8, 'XYZ', '2023-01-03', 74.50, 480000),
    (9, 'XYZ', '2023-01-04', 77.00, 520000),
    (10, 'XYZ', '2023-01-05', 76.50, 510000);

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
