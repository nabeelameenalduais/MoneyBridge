-- Exchange Office Database Backup
-- Generated on: 2025-07-31
-- Complete schema and data backup

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create tables
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
    balance NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, currency)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'exchange', 'transfer_sent', 'transfer_received'
    amount NUMERIC(15,2) NOT NULL,
    currency_from VARCHAR(3) NOT NULL,
    currency_to VARCHAR(3),
    exchange_rate NUMERIC(10,6),
    recipient_id UUID REFERENCES clients(id),
    sender_id UUID REFERENCES clients(id),
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

-- Insert sample data
-- Note: These passwords are hashed with bcrypt rounds=12
INSERT INTO clients (id, username, hashed_password, name) VALUES
('b724ef53-4356-4f17-b79a-f4e7b7591723', 'demo', '$2b$12$Jge6uTTzd1fh5QBCMbNfi.B2JW.GQY02fDvHCh7VaRhbhRsEWXsC2', 'Demo User'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'alice', '$2b$12$71jqcQAMpmxky9l9PLMTR.JgdrtBIIfWAowQdaQ4ff0Gcbm1yNRyS', 'Alice Johnson'),
('b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'bob', '$2b$12$XiFhwbCH8p9riUyodL2X3.CSVZKJonfTjWg5zFWZhjlmyaq3vjtim', 'Bob Smith'),
('c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'sarah', '$2b$12$mKi4rya.l3dmP8EaAwDKW.F6ohWFF6/LVD1Setw9cdgMHQJJFK43G', 'Sarah Davis');

-- Insert accounts with starting balances
INSERT INTO accounts (client_id, currency, balance) VALUES
-- Demo user accounts
('b724ef53-4356-4f17-b79a-f4e7b7591723', 'USD', 500.00),
('b724ef53-4356-4f17-b79a-f4e7b7591723', 'SAR', 6875.64),
('b724ef53-4356-4f17-b79a-f4e7b7591723', 'YER', 250000.00),
-- Alice accounts
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'USD', 500.00),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'SAR', 10000.00),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'YER', 50000.00),
-- Bob accounts
('b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'USD', 2000.00),
('b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'SAR', 3000.00),
('b2c3d4e5-f6g7-8901-2345-67890abcdef1', 'YER', 100000.00),
-- Sarah accounts
('c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'USD', 800.00),
('c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'SAR', 2000.00),
('c3d4e5f6-g7h8-9012-3456-7890abcdef12', 'YER', 500000.00);

-- Insert sample exchange rates
INSERT INTO exchange_rates (base_currency, target_currency, rate) VALUES
('USD', 'SAR', 3.7500),
('SAR', 'USD', 0.2667),
('USD', 'YER', 1050.0000),
('YER', 'USD', 0.0010),
('SAR', 'YER', 280.0000),
('YER', 'SAR', 0.0036);

-- Password reference for testing:
-- demo: password123
-- alice: alice2024  
-- bob: bob2024
-- sarah: sarah2024