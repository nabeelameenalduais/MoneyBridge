-- Exchange Office Database - Complete Schema and Data Backup
-- Updated: 2025-08-01 with all improvements and features
-- Includes all tables, relations, and sample data

-- Drop existing tables if they exist (in correct order to handle foreign keys)
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

-- Sample Data
INSERT INTO clients (id, username, hashed_password, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYCBCwLRKkIvW4y', 'Demo User'),
('550e8400-e29b-41d4-a716-446655440001', 'alice', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYCBCwLRKkIvW4y', 'Alice Johnson'),
('550e8400-e29b-41d4-a716-446655440002', 'bob', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYCBCwLRKkIvW4y', 'Bob Smith'),
('550e8400-e29b-41d4-a716-446655440003', 'carol', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYCBCwLRKkIvW4y', 'Carol Davis'),
('550e8400-e29b-41d4-a716-446655440004', 'david', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYCBCwLRKkIvW4y', 'David Wilson');

INSERT INTO accounts (id, client_id, currency, balance) VALUES 
-- Demo user accounts
('a50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'USD', 5000.00),
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'SAR', 12000.00),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'YER', 850000.00),
-- Alice accounts  
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'USD', 2500.00),
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'SAR', 7500.00),
-- Bob accounts
('a50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'USD', 1000.00),
('a50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'YER', 500000.00),
-- Carol accounts
('a50e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'SAR', 15000.00),
('a50e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'YER', 1200000.00),
-- David accounts
('a50e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'USD', 3000.00),
('a50e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'SAR', 9000.00);

-- Exchange rates (will be populated by the service)
INSERT INTO exchange_rates (base_currency, target_currency, rate) VALUES 
('USD', 'SAR', 3.7500),
('USD', 'YER', 250.0000),
('SAR', 'USD', 0.2667),
('SAR', 'YER', 66.6700),
('YER', 'USD', 0.0040),
('YER', 'SAR', 0.0150);

-- Sample transactions for analytics
INSERT INTO transactions (client_id, type, amount, currency_from, currency_to, exchange_rate, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'exchange', '500.00', 'USD', 'SAR', 3.7500, NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'exchange', '1000.00', 'SAR', 'YER', 66.6700, NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440001', 'exchange', '200.00', 'USD', 'SAR', 3.7500, NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440002', 'exchange', '300.00', 'USD', 'YER', 250.0000, NOW() - INTERVAL '1 day');