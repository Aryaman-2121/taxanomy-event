-- Copyright (c) 2025 Eventful India Marketing Services, India
-- All rights reserved.
-- 
-- Service: taxonomy
-- Port: 3201
-- Migration: 002_rls_policies
-- Description: Enable Row Level Security (RLS) for multi-tenant isolation
-- Author: Eventzr Platform Team
-- Date: 2025-08-26T19:30:00Z

BEGIN;

-- Enable Row Level Security on all tables
ALTER TABLE taxonomies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS tenant_isolation_taxonomies ON taxonomies;
DROP POLICY IF EXISTS tenant_isolation_categories ON categories;
DROP POLICY IF EXISTS tenant_isolation_classifications ON classifications;
DROP POLICY IF EXISTS tenant_isolation_namespaces ON namespaces;
DROP POLICY IF EXISTS tenant_isolation_tags ON tags;
DROP POLICY IF EXISTS tenant_isolation_entity_tags ON entity_tags;

-- Create tenant isolation policies for taxonomies
CREATE POLICY tenant_isolation_taxonomies ON taxonomies
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create tenant isolation policies for categories
CREATE POLICY tenant_isolation_categories ON categories
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create tenant isolation policies for classifications
CREATE POLICY tenant_isolation_classifications ON classifications
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create tenant isolation policies for namespaces
CREATE POLICY tenant_isolation_namespaces ON namespaces
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create tenant isolation policies for tags
CREATE POLICY tenant_isolation_tags ON tags
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create tenant isolation policies for entity_tags
CREATE POLICY tenant_isolation_entity_tags ON entity_tags
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create bypass policies for service accounts (system operations)
CREATE POLICY service_account_bypass_taxonomies ON taxonomies
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_account_bypass_categories ON categories
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_account_bypass_classifications ON classifications
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_account_bypass_namespaces ON namespaces
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_account_bypass_tags ON tags
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_account_bypass_entity_tags ON entity_tags
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT current_setting('app.current_tenant_id', true)::uuid INTO tenant_id;
    RETURN tenant_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate tenant access
CREATE OR REPLACE FUNCTION validate_tenant_access(entity_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_tenant UUID;
BEGIN
    current_tenant := get_current_tenant_id();
    
    -- Allow access if no tenant context is set (service operations)
    IF current_tenant IS NULL THEN
        RETURN true;
    END IF;
    
    -- Allow access if tenant matches
    IF current_tenant = entity_tenant_id THEN
        RETURN true;
    END IF;
    
    -- Deny access otherwise
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_tenant_context(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION validate_tenant_access(UUID) TO authenticated, service_role;

-- Add comments for RLS policies
COMMENT ON POLICY tenant_isolation_taxonomies ON taxonomies IS 'Ensures users can only access taxonomies from their tenant';
COMMENT ON POLICY tenant_isolation_categories ON categories IS 'Ensures users can only access categories from their tenant';
COMMENT ON POLICY tenant_isolation_classifications ON classifications IS 'Ensures users can only access classifications from their tenant';
COMMENT ON POLICY tenant_isolation_namespaces ON namespaces IS 'Ensures users can only access namespaces from their tenant';
COMMENT ON POLICY tenant_isolation_tags ON tags IS 'Ensures users can only access tags from their tenant';
COMMENT ON POLICY tenant_isolation_entity_tags ON entity_tags IS 'Ensures users can only access entity tags from their tenant';

COMMENT ON FUNCTION set_tenant_context(UUID) IS 'Sets the tenant context for the current session';
COMMENT ON FUNCTION get_current_tenant_id() IS 'Returns the current tenant ID from session context';
COMMENT ON FUNCTION validate_tenant_access(UUID) IS 'Validates if current user has access to the specified tenant';

COMMIT;
