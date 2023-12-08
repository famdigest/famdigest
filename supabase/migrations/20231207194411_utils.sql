
create extension if not exists moddatetime schema extensions;

/**
  * By default we want to revoke execute from public
 */
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA PUBLIC REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

/**
  Create a schema for us to use for private functions
 */
CREATE SCHEMA IF NOT EXISTS saas;
GRANT USAGE ON SCHEMA saas to authenticated;
GRANT USAGE ON SCHEMA saas to service_role;

CREATE TABLE IF NOT EXISTS saas.config
(
  enable_personal_accounts boolean default true,
  enable_team_accounts     boolean default true
);

-- enable select on the config table
GRANT SELECT ON saas.config TO authenticated, service_role;

-- enable RLS on config
ALTER TABLE saas.config
  ENABLE ROW LEVEL SECURITY;

create policy "saas settings can be read by authenticated users" on saas.config
  for select
  to authenticated
  using (
    true
  );

/**
  Get the full config object to check saas settings
  This is not accessible fromt he outside, so can only be used inside postgres functions
 */
CREATE OR REPLACE FUNCTION saas.get_config()
    RETURNS json AS
$$
DECLARE
    result RECORD;
BEGIN
    SELECT * from saas.config limit 1 into result;
    return row_to_json(result);
END;
$$ LANGUAGE plpgsql;

grant execute on function saas.get_config() to authenticated;

/**
  Check a specific boolean config value
 */
CREATE OR REPLACE FUNCTION saas.is_set(field_name text)
    RETURNS boolean AS
$$
DECLARE
    result BOOLEAN;
BEGIN
    execute format('select %I from saas.config limit 1', field_name) into result;
    return result;
END;
$$ LANGUAGE plpgsql;

grant execute on function saas.is_set(text) to authenticated;
