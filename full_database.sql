
-- Exchange Office Database - Complete Schema and Data Backup
-- Generated on: 2025-01-31
-- Includes all tables, relations, and sample data

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL,
    balance NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    UNIQUE(client_id, currency)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'exchange', 'transfer', 'received'
    amount NUMERIC(15,2) NOT NULL,
    currency_from VARCHAR(3),
    currency_to VARCHAR(3),
    receiver_id UUID REFERENCES clients(id),
    exchange_rate NUMERIC(10,6),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(10,6) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, target_currency)
);

-- Enhanced Tables
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'transaction', 'exchange_rate_alert', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read VARCHAR(10) DEFAULT 'false' NOT NULL,
    metadata TEXT, -- JSON string for additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'login', 'exchange', 'transfer', 'account_create'
    details TEXT, -- JSON string with action details
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX accounts_client_currency_idx ON accounts(client_id, currency);
CREATE INDEX transactions_client_date_idx ON transactions(client_id, created_at);
CREATE INDEX transactions_receiver_idx ON transactions(receiver_id);
CREATE INDEX transactions_type_idx ON transactions(type);
CREATE INDEX notifications_client_idx ON notifications(client_id);
CREATE INDEX notifications_read_idx ON notifications(is_read);
CREATE INDEX audit_logs_client_idx ON audit_logs(client_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_date_idx ON audit_logs(created_at);

-- Insert sample clients
-- Note: These passwords are hashed with bcrypt rounds=12
INSERT INTO clients (id, username, hashed_password, name, created_at) VALUES
('b724ef53-4356-4f17-b79a-f4e7b7591723', 'demo', '$2b$12$Jge6uTTzd1fh5QBCMbNfi.B2JW.GQY02fDvHCh7VaRhbhRsEWXsC2', 'Demo User', '2025-01-30 10:00:00'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'alice', '$2b$12$71jqcQAMpmxky9l9PLMTR.JgdrtBIIfWAowQdaQ4ff0Gcbm1yNRyS', 'Alice Johnson', '2025-01-30 11:00:00'),
('b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'bob', '$2b$12$XiFhwbCH8p9riUyodL2X3.CSVZKJonfTjWg5zFWZhjlmyaq3vjtim', 'Bob Smith', '2025-01-30 12:00:00'),
('c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'sarah', '$2b$12$mKi4rya.l3dmP8EaAwDKW.F6ohWFF6/LVD1Setw9cdgMHQJJFK43G', 'Sarah Davis', '2025-01-30 13:00:00'),
('d4e5f6g7-h8i9-0123-4567-890abcdef123', 'john', '$2b$12$N8vFXo2nE1xRz6s9P4gF8eI.mKlOpQr3sTuVwXyZ5aB7cDeFgHi6J', 'John Wilson', '2025-01-30 14:00:00');

-- Insert accounts with starting balances
INSERT INTO accounts (id, client_id, currency, balance) VALUES
-- Demo user accounts
('c98e86e5-3ef1-4895-b708-555da657c2d4', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'USD', 1500.00),
('d09f97f6-4f02-5906-c819-666eb768d3e5', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'SAR', 8375.64),
('e1a0a8g7-5g03-6a07-d91a-777fc879e4f6', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'YER', 350000.00),
-- Alice accounts
('f2b1b9h8-6h04-7b08-ea2b-888gd98af5g7', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'USD', 750.00),
('g3c2cai9-7i05-8c09-fb3c-999hea9bg6h8', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'SAR', 12500.00),
('h4d3dbja-8j06-9d0a-gc4d-aaaieb0ch7i9', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'YER', 75000.00),
-- Bob accounts
('i5e4eckb-9k07-ae0b-hd5e-bbbjecard8ja', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'USD', 2500.00),
('j6f5fdlc-al08-bf0c-ie6f-ccckfd0se9kb', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'SAR', 4500.00),
('k7g6gemd-bm09-cg0d-jf7g-dddlge0tf0lc', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'YER', 150000.00),
-- Sarah accounts
('l8h7hfne-cn0a-dh0e-kg8h-eeemhf0ug1md', 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'USD', 1200.00),
('m9i8igof-do0b-ei0f-lh9i-fffnig0vh2ne', 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'SAR', 3500.00),
('n0j9jhpg-ep0c-fj0g-mi0j-gggojh0wi3of', 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'YER', 750000.00),
-- John accounts
('o1k0kiqh-fq0d-gk0h-nj1k-hhhpki0xj4pg', 'd4e5f6g7-h8i9-0123-4567-890abcdef123', 'USD', 900.00),
('p2l1ljri-gr0e-hl0i-ok2l-iiiqlj0yk5qh', 'd4e5f6g7-h8i9-0123-4567-890abcdef123', 'SAR', 2750.00),
('q3m2mksj-hs0f-im0j-pl3m-jjjrmk0zl6ri', 'd4e5f6g7-h8i9-0123-4567-890abcdef123', 'YER', 480000.00);

-- Insert current exchange rates
INSERT INTO exchange_rates (id, base_currency, target_currency, rate, updated_at) VALUES
('7344e02d-e14c-48e6-9f92-1b625ab7c831', 'USD', 'SAR', 3.751381, '2025-01-31 15:30:00'),
('8455f13e-f25d-59f7-a0a3-2c736bc8d942', 'SAR', 'USD', 0.266565, '2025-01-31 15:30:00'),
('9566g24f-g36e-6ag8-b1b4-3d847cd9ea53', 'USD', 'YER', 1050.250000, '2025-01-31 15:30:00'),
('a677h35g-h47f-7bh9-c2c5-4e958daeafb64', 'YER', 'USD', 0.000952, '2025-01-31 15:30:00'),
('b788i46h-i58g-8ci0-d3d6-5fa69ebfbgc75', 'SAR', 'YER', 280.125000, '2025-01-31 15:30:00'),
('c899j57i-j69h-9dj1-e4e7-6gb7afcgchd86', 'YER', 'SAR', 0.003570, '2025-01-31 15:30:00');

-- Insert sample transactions
INSERT INTO transactions (id, client_id, type, amount, currency_from, currency_to, exchange_rate, receiver_id, message, created_at) VALUES
-- Demo user transactions
('t1001001-1001-1001-1001-100110011001', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'exchange', 200.00, 'USD', 'SAR', 3.750000, NULL, NULL, '2025-01-30 14:30:00'),
('t1002002-1002-1002-1002-100210021002', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'transfer', 100.00, 'USD', NULL, NULL, 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Payment for services', '2025-01-30 16:45:00'),
-- Alice receiving transfer
('t1003003-1003-1003-1003-100310031003', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'received', 100.00, 'USD', NULL, NULL, 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'Payment for services', '2025-01-30 16:45:00'),
-- Bob transactions
('t1004004-1004-1004-1004-100410041004', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'exchange', 500.00, 'SAR', 'USD', 0.266667, NULL, NULL, '2025-01-30 18:20:00'),
('t1005005-1005-1005-1005-100510051005', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'transfer', 250.00, 'USD', NULL, NULL, 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'Loan repayment', '2025-01-31 09:15:00'),
-- Sarah receiving transfer
('t1006006-1006-1006-1006-100610061006', 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'received', 250.00, 'USD', NULL, NULL, 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'Loan repayment', '2025-01-31 09:15:00'),
-- More recent transactions
('t1007007-1007-1007-1007-100710071007', 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'exchange', 1000.00, 'YER', 'SAR', 0.003571, NULL, NULL, '2025-01-31 11:30:00'),
('t1008008-1008-1008-1008-100810081008', 'd4e5f6g7-h8i9-0123-4567-890abcdef123', 'transfer', 50.00, 'USD', NULL, NULL, 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Birthday gift', '2025-01-31 13:45:00'),
('t1009009-1009-1009-1009-100910091009', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'received', 50.00, 'USD', NULL, NULL, 'd4e5f6g7-h8i9-0123-4567-890abcdef123', 'Birthday gift', '2025-01-31 13:45:00');

-- Insert sample notifications
INSERT INTO notifications (id, client_id, type, title, message, is_read, metadata, created_at) VALUES
('n1001001-n001-n001-n001-n00100n00100', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'transaction', 'Exchange Completed', 'Successfully exchanged $200.00 USD to SAR', 'true', '{"transaction_id":"t1001001-1001-1001-1001-100110011001","amount":200.00,"from":"USD","to":"SAR"}', '2025-01-30 14:31:00'),
('n1002002-n002-n002-n002-n00200n00200', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'transaction', 'Transfer Sent', 'Successfully sent $100.00 USD to Alice Johnson', 'true', '{"transaction_id":"t1002002-1002-1002-1002-100210021002","amount":100.00,"recipient":"alice"}', '2025-01-30 16:46:00'),
('n1003003-n003-n003-n003-n00300n00300', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'transaction', 'Transfer Received', 'Received $100.00 USD from Demo User', 'false', '{"transaction_id":"t1003003-1003-1003-1003-100310031003","amount":100.00,"sender":"demo"}', '2025-01-30 16:46:00'),
('n1004004-n004-n004-n004-n00400n00400', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'exchange_rate_alert', 'Favorable Exchange Rate', 'USD to SAR rate improved to 3.751', 'false', '{"rate":3.751,"from":"USD","to":"SAR"}', '2025-01-31 15:31:00'),
('n1005005-n005-n005-n005-n00500n00500', 'c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'system', 'Welcome Message', 'Welcome to the Exchange Office Portal!', 'false', '{"welcome_bonus":true}', '2025-01-30 13:01:00');

-- Insert sample audit logs
INSERT INTO audit_logs (id, client_id, action, details, ip_address, user_agent, created_at) VALUES
('a1001001-a001-a001-a001-a00100a00100', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'login', '{"success":true,"method":"password"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-01-30 10:30:00'),
('a1002002-a002-a002-a002-a00200a00200', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'exchange', '{"from":"USD","to":"SAR","amount":200.00,"rate":3.750000}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-01-30 14:30:00'),
('a1003003-a003-a003-a003-a00300a00300', 'b724ef53-4356-4f17-b79a-f4e7b7591723', 'transfer', '{"recipient":"alice","amount":100.00,"currency":"USD"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-01-30 16:45:00'),
('a1004004-a004-a004-a004-a00400a00400', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'login', '{"success":true,"method":"password"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2025-01-30 11:15:00'),
('a1005005-a005-a005-a005-a00500a00500', 'b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'login', '{"success":true,"method":"password"}', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '2025-01-30 12:30:00');

-- Insert system settings
INSERT INTO system_settings (id, key, value, description, updated_at) VALUES
('s1001001-s001-s001-s001-s00100s00100', 'exchange_fee_percentage', '0.5', 'Percentage fee applied to currency exchanges', '2025-01-30 08:00:00'),
('s1002002-s002-s002-s002-s00200s00200', 'transfer_fee_flat', '2.00', 'Flat fee in USD for transfers', '2025-01-30 08:00:00'),
('s1003003-s003-s003-s003-s00300s00300', 'max_daily_transfer_usd', '5000.00', 'Maximum daily transfer limit in USD equivalent', '2025-01-30 08:00:00'),
('s1004004-s004-s004-s004-s00400s00400', 'rate_update_interval_minutes', '60', 'How often to fetch new exchange rates', '2025-01-30 08:00:00'),
('s1005005-s005-s005-s005-s00500s00500', 'maintenance_mode', 'false', 'Enable maintenance mode to disable transactions', '2025-01-30 08:00:00'),
('s1006006-s006-s006-s006-s00600s00600', 'supported_currencies', 'USD,SAR,YER', 'Comma-separated list of supported currencies', '2025-01-30 08:00:00');

-- Password reference for testing:
-- demo: password123
-- alice: alice2024  
-- bob: bob2024
-- sarah: sarah2024
-- john: john2024

-- Database statistics and summary
-- Total clients: 5
-- Total accounts: 15 (3 currencies per client)
-- Total transactions: 9
-- Total notifications: 5
-- Total audit logs: 5
-- Total system settings: 6
-- Supported currencies: USD, SAR, YER
-- Last updated: 2025-01-31
