# Supabase Helper Files

This directory contains helper SQL files for common database operations and queries.

## How to Use Helper Files in Supabase

### Method 1: Using Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run Helper Queries**
   - Open the helper file (e.g., `get_uuids.sql`)
   - Copy the query you need
   - Paste it into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Save as Favorite (Optional)**
   - After running a query, click the **Save** button
   - Give it a name (e.g., "Get User UUIDs")
   - Access it later from **Saved Queries**

### Method 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)

   ```bash
   npm install -g supabase
   ```

2. **Link to Your Project**

   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Run SQL File**
   ```bash
   # Run a specific helper file
   supabase db execute --file supabase/helpers/get_uuids.sql
   ```

### Method 3: Copy Individual Queries

You can copy individual queries from helper files and run them as needed:

1. Open the helper file
2. Copy the specific query you need
3. Paste into Supabase SQL Editor
4. Modify parameters if needed
5. Run the query

## Available Helper Files

### `get_uuids.sql`

Contains queries to retrieve UUIDs from various tables:

- Get current user UUID
- List all user UUIDs
- Get customer/professional UUIDs
- Get service/address/booking UUIDs
- Quick reference queries

**Usage Example:**

```sql
-- Copy and paste this into SQL Editor
SELECT
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email;
```

## Creating Your Own Helper Files

1. **Create a new `.sql` file** in the `helpers/` directory
2. **Add SQL queries** with comments explaining what each does
3. **Use clear naming** (e.g., `seed_data.sql`, `cleanup_test_data.sql`)
4. **Document usage** in comments at the top of the file

**Example Helper File Structure:**

```sql
-- ============================================
-- Helper: Description of what this file does
-- ============================================
-- Usage: Copy queries as needed into SQL Editor

-- Query 1: Description
SELECT * FROM table_name;

-- Query 2: Description
INSERT INTO table_name (column) VALUES ('value');
```

## Best Practices

1. **Use Comments**: Always add comments explaining what each query does
2. **Test First**: Test queries on a development/staging environment first
3. **Use Parameters**: For reusable queries, consider using functions or prepared statements
4. **Organize by Purpose**: Group related queries in the same file
5. **Version Control**: Keep helper files in git for team collaboration

## Common Helper File Ideas

- `get_uuids.sql` - Get UUIDs for testing
- `seed_data.sql` - Seed initial data
- `cleanup_test_data.sql` - Clean up test data
- `analytics_queries.sql` - Common analytics queries
- `migration_helpers.sql` - Helper queries for migrations
- `debug_queries.sql` - Queries for debugging

## Running Multiple Queries

You can run multiple queries from a helper file:

1. **Select All** queries in the file (`Ctrl+A` / `Cmd+A`)
2. **Copy** them
3. **Paste** into SQL Editor
4. **Run** - Supabase will execute them in order

**Note:** Make sure queries are separated by semicolons (`;`)

## Saving Queries for Later

### Save as Favorite in Dashboard

1. Run a query in SQL Editor
2. Click the **Save** button (floppy disk icon)
3. Give it a descriptive name
4. Access from **Saved Queries** menu

### Create Reusable Functions

For frequently used queries, consider creating database functions:

```sql
-- Create a function
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.role::TEXT
  FROM profiles p
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Use the function
SELECT * FROM get_user_profile(auth.uid());
```

## Troubleshooting

### Query Not Running

- Check for syntax errors
- Ensure you're connected to the correct project
- Verify table names and column names are correct

### Permission Errors

- Check RLS policies
- Ensure you're authenticated (for queries using `auth.uid()`)
- Verify your user has the necessary permissions

### UUID Errors

- Always use proper UUID format or `auth.uid()`
- Cast strings to UUID: `'uuid-string'::uuid`
- Use `gen_random_uuid()` to generate new UUIDs

## Resources

- [Supabase SQL Editor Docs](https://supabase.com/docs/guides/database/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
