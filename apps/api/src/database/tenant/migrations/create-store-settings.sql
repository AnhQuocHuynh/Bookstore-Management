-- Migration: Create store_settings table for tenant databases
-- Run this SQL on each tenant database

CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    general JSONB NOT NULL DEFAULT '{}',
    pos JSONB NOT NULL DEFAULT '{}',
    hr JSONB NOT NULL DEFAULT '{}',
    inventory JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE store_settings IS 'Store configuration settings (single row per tenant)';
COMMENT ON COLUMN store_settings.general IS 'General store info: storeName, slogan, address, phone, email, website, facebook';
COMMENT ON COLUMN store_settings.pos IS 'POS settings: vatRate, receiptFooter, payment methods, etc.';
COMMENT ON COLUMN store_settings.hr IS 'HR settings: baseSalary, shift times, etc.';
COMMENT ON COLUMN store_settings.inventory IS 'Inventory settings: lowStockThreshold, autoReorder, etc.';

-- Verify
SELECT 'store_settings table created successfully' AS status;
