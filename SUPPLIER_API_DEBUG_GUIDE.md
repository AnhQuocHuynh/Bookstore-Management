# Debugging Supplier API Returns Nothing

## Problem
Your supplier API returns an empty array `[]` but you want to verify:
1. Is the **tenant database** actually empty?
2. Or is there a **connection issue**?
3. Or is the **wrong bookStoreId** being used?

---

## Solution 1: Check Logs (Easiest)

I've added detailed logging to `supplier.service.ts`. When you call the API, check your backend logs:

```
[DEBUG] getSuppliers called with bookStoreId: abc-123-def-456
[DEBUG] DataSource initialized successfully
[DEBUG] DataSource connection options: {
  type: 'postgres',
  host: '192.168.1.100',
  port: 5432,
  database: 'bookstore_a_db',
  username: 'postgres'
}
[DEBUG] Total suppliers in tenant DB: 0
[WARNING] No suppliers found in tenant DB for bookStoreId: abc-123-def-456
```

### What To Look For

| Log Message | Meaning |
|------------|---------|
| `Total suppliers in tenant DB: 0` | ✅ Connected to correct DB, but it's empty |
| `Failed to get suppliers` | ❌ Connection failed - check error details |
| `DataSource initialized successfully` | ✅ Connection established |
| Error with host/database/username | ❌ Wrong database credentials |

---

## Solution 2: Query Directly (SQL)

If you have database access, check the tenant database directly:

### Step 1: Find the Bookstore's Database Connection
**Connect to MAIN database** and run:
```sql
SELECT 
  b.id as bookstore_id,
  b.code as store_code,
  dc.host,
  dc.port,
  dc.username,
  dc.database,
  dc.type
FROM book_store b
LEFT JOIN database_connection dc ON b.id = dc.book_store_id
WHERE b.code = 'NHASAC-F050';  -- Your store code
```

**Output Example:**
```
bookstore_id            | store_code    | host              | port | database
abc-123-def-456         | NHASAC-F050   | aws-prod.db.com   | 5432 | bookstore_a
```

### Step 2: Connect to TENANT Database
Using the credentials from above, connect to the tenant database:
```
Host: aws-prod.db.com
Port: 5432
Database: bookstore_a
Username: postgres
Password: [from database_connection.password - decrypted]
```

### Step 3: Check Supplier Table
```sql
-- Count suppliers
SELECT COUNT(*) FROM supplier;

-- List all suppliers
SELECT * FROM supplier;

-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'supplier';
```

**Possible Outcomes:**

| Result | Meaning |
|--------|---------|
| `COUNT(*) = 0` | ✅ Table exists but is empty |
| `0 rows returned` | ✅ Table empty |
| `ERROR: relation "supplier" does not exist` | ❌ Table not created - migration issue |
| Connection refused | ❌ Wrong credentials or DB not running |

---

## Solution 3: Add Debug Endpoint

Create a temporary debug endpoint to inspect the connection:

```typescript
// supplier.controller.ts - Add this endpoint temporarily

@Get('debug/connection-info')
async debugConnectionInfo(@BookStoreId() bookStoreId: string) {
  const dataSource = await this.tenantService.getTenantConnection({
    bookStoreId,
  });

  const supplierRepo = dataSource.getRepository(Supplier);
  
  // Check table existence
  const tableExists = await dataSource.query(`
    SELECT EXISTS(
      SELECT FROM information_schema.tables 
      WHERE table_name = 'supplier'
    );
  `);

  // Get count
  const count = await supplierRepo.count();

  // Get raw connection info
  const connInfo = {
    isInitialized: dataSource.isInitialized,
    connectionOptions: {
      type: dataSource.options.type,
      host: dataSource.options.host,
      port: dataSource.options.port,
      database: dataSource.options.database,
      username: dataSource.options.username,
    },
    tableExists: tableExists[0].exists,
    supplierCount: count,
  };

  return connInfo;
}
```

**Call it:**
```
GET /suppliers/debug/connection-info
Authorization: Bearer <YOUR_TOKEN>
X-BookStore-Id: abc-123-def-456
```

**Example Response:**
```json
{
  "isInitialized": true,
  "connectionOptions": {
    "type": "postgres",
    "host": "aws-prod.db.com",
    "port": 5432,
    "database": "bookstore_a",
    "username": "postgres"
  },
  "tableExists": true,
  "supplierCount": 0
}
```

---

## Solution 4: Check Common Issues

### Issue 1: Wrong bookStoreId
**Problem:** Using admin/system account instead of employee account

**Check:**
```typescript
// In supplier.controller.ts getSuppliers:
@Get()
async getSuppliers(@BookStoreId() bookStoreId: string) {
  console.log('BookStoreId:', bookStoreId);  // ← Add this
  return this.supplierService.getSuppliers(bookStoreId);
}
```

If `bookStoreId` is `undefined` or different from expected, issue is authentication.

**Fix:** Ensure you're using an authenticated employee/owner account for the specific bookstore.

### Issue 2: Database Not Initialized
**Problem:** Tenant database hasn't been created yet

**Check:**
```sql
-- In MAIN database
SELECT isConnected, lastConnectedAt FROM database_connection 
WHERE id = '<connection_id>';
```

**Expected:**
```
isConnected | lastConnectedAt
true        | 2025-12-31 10:00:00
```

If `false`, the connection was never established.

### Issue 3: Migration Not Run
**Problem:** `supplier` table doesn't exist in tenant DB

**Check:**
```sql
-- In TENANT database
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'supplier';
```

**Fix:** Ensure TypeORM synchronize is enabled (it is in tenant config) or manually run migrations.

### Issue 4: Wrong Store Selected on Frontend
**Problem:** Frontend is sending request for Store A but you expect Store B

**Check:**
```typescript
// In axios.ts interceptor (frontend)
const currentStore = authData?.state?.currentStore;
console.log('Current Store:', currentStore);  // ← Check this
```

---

## Diagnostic Checklist

Use this checklist to identify the issue:

```
□ 1. Check logs for "Total suppliers in tenant DB: X"
     If 0 → Database is empty (expected)
     If error → Connection failed (unexpected)

□ 2. Verify correct bookStoreId in logs
     Expected: abc-123-def-456 (from your store)
     If wrong → Authentication issue

□ 3. Check database connection credentials
     Host: Match from database_connection table
     Database: Should be bookstore-specific name
     
□ 4. Verify supplier table exists in tenant DB
     Query: SELECT * FROM information_schema.tables 
            WHERE table_name = 'supplier'
     
□ 5. If table exists, check if it has any data
     Query: SELECT COUNT(*) FROM supplier;
     
□ 6. If no data, check if you created test suppliers
     Did you POST to /suppliers/create endpoint?

□ 7. Check bookStoreId is set in user JWT token
     JWT should contain: { userId, role, bookStoreId }
     If bookStoreId missing → Need to re-login with store
```

---

## Quick Test: Add a Test Supplier

If the database is empty and you need to verify the connection works:

```bash
# 1. Create a test supplier
POST /suppliers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Test Supplier XYZ",
  "email": "test@supplier.com",
  "phoneNumber": "0393877632",
  "address": "Test Address",
  "taxCode": "1234567890",
  "contactPerson": "Test Person",
  "note": "Test supplier"
}

# 2. Get suppliers again
GET /suppliers

# 3. Should now return 1 supplier with generated supplierCode
```

If this works → Connection is fine, just no data

---

## Enhanced Logging Details

The added logging shows:

```typescript
// File: supplier.service.ts - getSuppliers method

// 1. Logs bookStoreId being used
this.logger.log(`[DEBUG] getSuppliers called with bookStoreId: ${bookStoreId}`);

// 2. Logs when connection established
this.logger.log(`[DEBUG] DataSource initialized successfully`);

// 3. Logs actual connection details
this.logger.debug(`[DEBUG] DataSource connection options:`, {
  type: dataSource.options.type,
  host: dataSource.options.host,
  port: dataSource.options.port,
  database: dataSource.options.database,
  username: dataSource.options.username,
});

// 4. Logs total count in DB
this.logger.log(`[DEBUG] Total suppliers in tenant DB: ${count}`);

// 5. Logs if results empty
if (suppliers.length === 0) {
  this.logger.warn(`[WARNING] No suppliers found...`);
}

// 6. Logs any errors
this.logger.error(`[ERROR] Failed to get suppliers:`, { ... });
```

---

## Summary

| Check | Command | Expected Result |
|-------|---------|-----------------|
| **Backend Logs** | Run API, check logs | Should see "Total suppliers in tenant DB: X" |
| **Tenant DB Connection** | Use credentials from main DB | Should connect successfully |
| **Supplier Table Exists** | `SELECT * FROM supplier LIMIT 1` | Returns columns or empty, not error |
| **Has Data** | `SELECT COUNT(*) FROM supplier` | Returns count (0 or more) |
| **BookStoreId Correct** | Check logs for bookStoreId | Should match your store |

**If Total Count = 0:** ✅ Everything working, just no data yet
**If Connection Error:** ❌ Wrong credentials or DB offline
**If Table Not Found:** ❌ Migration or initialization issue
