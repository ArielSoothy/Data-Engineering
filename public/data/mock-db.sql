-- Mock Database for SQL Interview Questions
-- Base tables setup
CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY,
    department_name TEXT NOT NULL,
    location TEXT,
    budget DECIMAL(15,2),
    manager_id INTEGER
);

CREATE TABLE employees (
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

CREATE TABLE payroll (
    payroll_id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    salary DECIMAL(10,2),
    effective_date DATE,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Salary reviews table for year-over-year comparisons
CREATE TABLE salary_reviews (
    review_id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    review_date DATE,
    salary DECIMAL(10,2),
    performance_rating INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Orders table for running sum examples
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    order_date DATE,
    amount DECIMAL(10,2),
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table for normalized order-product relationships
CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Order summary table for denormalization examples
CREATE TABLE order_summary (
    order_id INTEGER,
    customer_name TEXT,
    product_name TEXT,
    quantity INTEGER,
    price DECIMAL(10,2),
    total_amount DECIMAL(10,2)
);

-- Clean orders table for deduplication examples
CREATE TABLE orders_clean AS
SELECT DISTINCT * FROM orders;

-- Customers table
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    signup_date DATE
);

-- Employees clean table (for deduplication examples)
CREATE TABLE employees_clean AS
SELECT DISTINCT * FROM employees;

-- Sales data for percentage calculations
CREATE TABLE sales_data (
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
CREATE TABLE stock_prices (
    price_id INTEGER PRIMARY KEY,
    stock_symbol TEXT,
    date_recorded DATE,
    stock_price DECIMAL(10,2),
    volume INTEGER
);

-- Products table
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT,
    category TEXT,
    price DECIMAL(10,2),
    inventory INTEGER
);

-- Projects table
CREATE TABLE projects (
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
CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    transaction_date DATE,
    amount DECIMAL(10,2),
    transaction_type TEXT,
    description TEXT,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Log events table
CREATE TABLE log_events (
    log_id INTEGER PRIMARY KEY,
    event_timestamp TIMESTAMP,
    level TEXT, -- 'INFO', 'WARNING', 'ERROR', etc.
    source TEXT,
    message TEXT,
    user_id INTEGER
);

-- Generic practice tables
CREATE TABLE table1 (
    id INTEGER PRIMARY KEY,
    column1 INTEGER,
    column2 TEXT,
    column3 DATE
);

CREATE TABLE table2 (
    id INTEGER PRIMARY KEY,
    column1 INTEGER,
    column2 TEXT,
    column3 DECIMAL(10,2),
    table1_id INTEGER,
    FOREIGN KEY (table1_id) REFERENCES table1(id)
);

CREATE TABLE table3 (
    id INTEGER PRIMARY KEY,
    column1 TEXT,
    column2 INTEGER,
    column3 BOOLEAN,
    table2_id INTEGER,
    FOREIGN KEY (table2_id) REFERENCES table2(id)
);

-- Sample data
INSERT INTO departments (department_id, department_name, location, budget, manager_id) VALUES
    (1, 'Engineering', 'Seattle', 1200000.00, NULL),
    (2, 'Sales', 'New York', 900000.00, NULL),
    (3, 'Marketing', 'San Francisco', 800000.00, NULL),
    (4, 'HR', 'Chicago', 500000.00, NULL);

INSERT INTO employees (employee_id, first_name, last_name, email, department_id, salary, hire_date, manager_id, job_title) VALUES
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

INSERT INTO table1 (id, column1, column2, column3) VALUES
    (1, 100, 'Value A', '2023-01-01'),
    (2, 200, 'Value B', '2023-02-01'),
    (3, 300, 'Value C', '2023-03-01'),
    (4, 400, 'Value D', '2023-04-01'),
    (5, 500, 'Value E', '2023-05-01');

INSERT INTO table2 (id, column1, column2, column3, table1_id) VALUES
    (1, 10, 'First', 1000.50, 1),
    (2, 20, 'Second', 2000.75, 1),
    (3, 30, 'Third', 3000.25, 2),
    (4, 40, 'Fourth', 4000.00, 3),
    (5, 50, 'Fifth', 5000.50, 3),
    (6, 60, 'Sixth', 6000.75, 4);

INSERT INTO table3 (id, column1, column2, column3, table2_id) VALUES
    (1, 'Row 1', 1000, true, 1),
    (2, 'Row 2', 2000, false, 2),
    (3, 'Row 3', 3000, true, 2),
    (4, 'Row 4', 4000, false, 3),
    (5, 'Row 5', 5000, true, 4),
    (6, 'Row 6', 6000, false, 5),
    (7, 'Row 7', 7000, true, 6);

-- Payroll history with some duplicate entries to simulate ETL errors
INSERT INTO payroll (payroll_id, employee_id, salary, effective_date) VALUES
    (1, 95000.00, '2020-01-15'),
    (1, 98000.00, '2021-01-15'),
    (1, 100000.00, '2022-01-15'),
    (1, 100000.00, '2022-01-15'),  -- Duplicate entry
    (2, 90000.00, '2020-02-01'),
    (2, 92000.00, '2021-02-01'),
    (2, 95000.00, '2022-02-01'),
    (2, 95000.00, '2022-02-01'),  -- Duplicate entry
    (3, 80000.00, '2020-03-15'),
    (3, 82000.00, '2021-03-15'),
    (3, 85000.00, '2022-03-15');

-- Salary reviews data
INSERT INTO salary_reviews (review_id, employee_id, review_date, salary, performance_rating) VALUES
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
INSERT INTO customers (customer_id, first_name, last_name, email, signup_date) VALUES
    (1, 'Michael', 'Jones', 'michael.j@example.com', '2020-01-10'),
    (2, 'Sarah', 'Williams', 'sarah.w@example.com', '2020-02-15'),
    (3, 'David', 'Brown', 'david.b@example.com', '2020-03-20'),
    (4, 'Jennifer', 'Miller', 'jennifer.m@example.com', '2020-04-25'),
    (5, 'Robert', 'Davis', 'robert.d@example.com', '2020-05-30');

-- Orders data
INSERT INTO orders (order_id, customer_id, order_date, amount, created_timestamp) VALUES
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
INSERT INTO products (product_id, product_name, category, price, inventory) VALUES
    (1, 'Laptop Pro', 'Electronics', 1200.00, 50),
    (2, 'Smartphone X', 'Electronics', 800.00, 100),
    (3, 'Office Chair', 'Furniture', 120.00, 30),
    (4, 'Desk Lamp', 'Furniture', 45.00, 80),
    (5, 'Notebook', 'Stationery', 5.00, 500);

-- Sales data
INSERT INTO sales_data (sale_id, salesperson_id, customer_id, product_id, sale_date, sales_amount) VALUES
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
INSERT INTO projects (project_id, project_name, start_date, end_date, budget, status, assigned_employee_id) VALUES
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
INSERT INTO transactions (transaction_id, account_id, transaction_date, amount, transaction_type, description, created_timestamp) VALUES
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
INSERT INTO log_events (log_id, event_timestamp, level, source, message, user_id) VALUES
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
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES
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
INSERT INTO order_summary (order_id, customer_name, product_name, quantity, price, total_amount) VALUES
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
INSERT INTO stock_prices (price_id, stock_symbol, date_recorded, stock_price, volume) VALUES
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
