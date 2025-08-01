-- =====================================================
-- EXCHANGE OFFICE DATABASE BACKUP
-- Created: August 1, 2025
-- Contains complete schema and data for restoration
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency_from VARCHAR(3),
    currency_to VARCHAR(3),
    receiver_id UUID REFERENCES clients(id),
    exchange_rate DECIMAL(10,6),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create exchange_rates table
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read VARCHAR(10) NOT NULL DEFAULT 'false',
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system_settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert client data (all passwords are hashed for 'password123')
INSERT INTO clients (id, username, hashed_password, name, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo', '$2b$12$FK84CEvQGuJJi9xLjbDHq.m6jOC41t/X0BL/yY3h12kzZjhY2i3YK', 'Demo User', '2025-08-01 11:59:44.894013'),
('550e8400-e29b-41d4-a716-446655440001', 'alice', '$2b$12$FK84CEvQGuJJi9xLjbDHq.m6jOC41t/X0BL/yY3h12kzZjhY2i3YK', 'Alice Johnson', '2025-08-01 11:59:44.894013'),
('550e8400-e29b-41d4-a716-446655440002', 'bob', '$2b$12$FK84CEvQGuJJi9xLjbDHq.m6jOC41t/X0BL/yY3h12kzZjhY2i3YK', 'Bob Smith', '2025-08-01 11:59:44.894013'),
('550e8400-e29b-41d4-a716-446655440003', 'carol', '$2b$12$FK84CEvQGuJJi9xLjbDHq.m6jOC41t/X0BL/yY3h12kzZjhY2i3YK', 'Carol Davis', '2025-08-01 11:59:44.894013'),
('550e8400-e29b-41d4-a716-446655440004', 'david', '$2b$12$FK84CEvQGuJJi9xLjbDHq.m6jOC41t/X0BL/yY3h12kzZjhY2i3YK', 'David Wilson', '2025-08-01 11:59:44.894013'),
('550e8400-e29b-41d4-a716-446655440005', 'sarah', '$2b$12$FK84CEvQGuJJi9xLjbDHq.m6jOC41t/X0BL/yY3h12kzZjhY2i3YK', 'Sarah Johnson', '2025-08-01 21:32:45.497092');

-- Insert account data with current balances
INSERT INTO accounts (id, client_id, currency, balance) VALUES
('a50e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'USD', 4700.01),
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'SAR', 11889.00),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'YER', 857118.93),
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'USD', 2600.00),
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'SAR', 7500.00),
('a50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'USD', 1199.99),
('a50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'YER', 500000.00),
('4e0f4f15-6b76-4600-bf6a-1ff3492417f2', '550e8400-e29b-41d4-a716-446655440002', 'SAR', 0.00),
('a50e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'SAR', 15000.00),
('a50e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'YER', 1200000.00),
('a50e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'USD', 3000.00),
('a50e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'SAR', 9000.00),
('a50e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', 'USD', 2000.00),
('a50e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 'SAR', 5000.00),
('a50e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'YER', 300000.00);

-- Insert transaction history
INSERT INTO transactions (id, client_id, type, amount, currency_from, currency_to, receiver_id, exchange_rate, message, created_at) VALUES
('1c5ecc06-f6ee-4a99-b9d6-c7f52986c850', '550e8400-e29b-41d4-a716-446655440000', 'exchange', 500.00, 'USD', 'SAR', NULL, 3.750000, NULL, '2025-07-27 12:00:16.992931'),
('dfea8af5-6a4d-4763-9876-3c72d83095fc', '550e8400-e29b-41d4-a716-446655440000', 'exchange', 1000.00, 'SAR', 'YER', NULL, 66.670000, NULL, '2025-07-29 12:00:16.992931'),
('44d67f6e-5d4b-43fc-b25b-41d0c11a57c1', '550e8400-e29b-41d4-a716-446655440001', 'exchange', 200.00, 'USD', 'SAR', NULL, 3.750000, NULL, '2025-07-30 12:00:16.992931'),
('6e002fea-df7b-4d8a-8e7d-f2f1ba50aeb8', '550e8400-e29b-41d4-a716-446655440002', 'exchange', 300.00, 'USD', 'YER', NULL, 250.000000, NULL, '2025-07-31 12:00:16.992931'),
('a172e791-0916-438e-9fe9-cc5b1338a4fe', '550e8400-e29b-41d4-a716-446655440000', 'exchange', 111.00, 'SAR', 'YER', NULL, 64.134494, NULL, '2025-08-01 21:04:49.498032'),
('1a388f3d-9dce-4b6b-8c57-014107943247', '550e8400-e29b-41d4-a716-446655440000', 'transfer', 100.00, 'USD', 'USD', '550e8400-e29b-41d4-a716-446655440001', NULL, '100$ YA', '2025-08-01 21:13:32.481529'),
('a96508c3-f6be-4616-b6e9-af7b7245ed1b', '550e8400-e29b-41d4-a716-446655440001', 'received', 100.00, 'USD', 'USD', '550e8400-e29b-41d4-a716-446655440000', NULL, '100$ YA', '2025-08-01 21:13:32.565302'),
('dcd26bc4-db84-430a-b793-82b5ad7f8c07', '550e8400-e29b-41d4-a716-446655440000', 'transfer', 199.99, 'USD', 'USD', '550e8400-e29b-41d4-a716-446655440002', NULL, NULL, '2025-08-01 21:37:05.590972'),
('e1b00729-27a4-4a6d-8e6a-4c3df6c6397a', '550e8400-e29b-41d4-a716-446655440002', 'received', 199.99, 'USD', 'USD', '550e8400-e29b-41d4-a716-446655440000', NULL, NULL, '2025-08-01 21:37:05.666839');

-- Insert current exchange rates
INSERT INTO exchange_rates (id, base_currency, target_currency, rate, updated_at) VALUES
('c7d00f05-87f6-464d-90eb-e2d2ad9f45a0', 'USD', 'SAR', 3.751104, '2025-08-01 21:34:48.891'),
('2b5601a9-0d1c-42d5-b30c-7263a9bc8dcc', 'USD', 'YER', 240.603489, '2025-08-01 21:34:49.087'),
('d98a53f4-59e5-4674-b665-6d8380c6b12a', 'SAR', 'USD', 0.266588, '2025-08-01 21:34:49.613'),
('dc651ff3-be96-4630-8958-f33148499f2e', 'SAR', 'YER', 64.142042, '2025-08-01 21:34:50.555'),
('963b415c-81b2-480a-8bad-9330aea57df7', 'YER', 'USD', 0.004156, '2025-08-01 21:34:50.778'),
('cc8b71d2-7023-4495-9b17-f603a15f1c01', 'YER', 'SAR', 0.015590, '2025-08-01 21:34:50.892');

-- Create indexes for better performance
CREATE INDEX idx_accounts_client_id ON accounts(client_id);
CREATE INDEX idx_accounts_currency ON accounts(currency);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);
CREATE INDEX idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX idx_notifications_client_id ON notifications(client_id);

-- =====================================================
-- BACKUP NOTES:
-- All user passwords are set to 'password123'
-- Test accounts: demo, alice, bob, carol, david, sarah
-- Exchange rates are current as of August 1, 2025
-- All transaction history and balances preserved
-- =====================================================