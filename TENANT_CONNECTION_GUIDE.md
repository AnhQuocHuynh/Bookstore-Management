# Tenant Database Connection Guide

## Overview
Once a user signs in and selects a bookstore, the system automatically connects to that bookstore's tenant database. Here's how it works:

---

## 1. How Tenant DB Connection is Established

### Frontend Flow
```
User Login → Select BookStore → Re-authenticate → Get New JWT with bookStoreId
```

### Authentication & Store Selection
- **File:** [auth.api.ts](apps/web/src/features/auth/api/auth.api.ts)
- User authenticates with email/password
- System returns available bookstores
- User selects a bookstore
- User calls `bookstoreLogin()` endpoint with selected `bookStoreId`
- Backend returns JWT token containing `bookStoreId` in payload

### JWT Token Structure
```typescript
JwtTokenPayload = {
  userId: string;
  role: UserRole;
  bookStoreId?: string;  // ← Identifies which tenant DB to use
  iat: number;
  exp: number;
}
```

### Storage & Axios Interception
- **File:** [axios.ts](apps/web/src/lib/axios.ts)
- Auth data stored in `localStorage` under key `"auth-storage"`
- Contains: `accessToken`, `refreshToken`, `currentStore` (which has `id` = bookStoreId)
- Every API request automatically includes:
  ```typescript
  Authorization: Bearer ${accessToken}
  X-BookStore-Id: ${currentStore.id}  // Defensive header
  ```

---

## 2. Backend - How bookStoreId is Extracted

### JWT Strategy
- **File:** [jwt.strategy.ts](apps/api/src/modules/auth/strategies/jwt.strategy.ts)
- JWT token is decoded and `bookStoreId` is extracted
- Set in request user object as `TUserSession.bookStoreId`

### Decorator: @BookStoreId()
- **File:** [book-store-id.decorator.ts](apps/api/src/common/decorators/book-store-id.decorator.ts)
- Custom parameter decorator that extracts `bookStoreId` from authenticated user session
- Throws error if `bookStoreId` is missing

```typescript
export const BookStoreId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest<Request>()
      .user as TUserSession;

    if (!user?.bookStoreId?.trim())
      throw new BadRequestException('Không thể lấy được mã nhà sách.');

    return user.bookStoreId;
  },
);
```

---

## 3. Using @BookStoreId() Decorator in Controllers

### Example: Supplier API
```typescript
// File: supplier.controller.ts
@Get()
async getSuppliers(@BookStoreId() bookStoreId: string) {
  return this.supplierService.getSuppliers(bookStoreId);
}

@Post()
@Roles(UserRole.OWNER)
async createSupplier(
  @Body() createSupplierDto: CreateSupplierDto,
  @BookStoreId() bookStoreId: string,
) {
  return this.supplierService.createSupplier(createSupplierDto, bookStoreId);
}
```

### How It Works
1. `@BookStoreId()` decorator automatically extracts bookStoreId from JWT
2. Pass it to service methods
3. Service uses it to get tenant DataSource

---

## 4. Getting Tenant DataSource in Services

### TenantService
- **File:** [tenant.service.ts](apps/api/src/tenants/tenant.service.ts)

### Method: getTenantConnection()
```typescript
async getTenantConnection(params: {
  bookStoreId?: string;
  storeCode?: string;
}): Promise<DataSource> {
  // Returns initialized DataSource for the tenant
}
```

### Usage in Services

**Example: Supplier Service**
```typescript
// File: supplier.service.ts
async getSuppliers(bookStoreId: string) {
  // Step 1: Get DataSource (DB connection) for this bookstore
  const dataSource = await this.tenantService.getTenantConnection({
    bookStoreId,
  });

  // Step 2: Get repository from DataSource
  const supplierRepo = dataSource.getRepository(Supplier);

  // Step 3: Query tenant database
  return supplierRepo.find();
}

async createSupplier(
  createSupplierDto: CreateSupplierDto,
  bookStoreId: string,
) {
  const dataSource = await this.tenantService.getTenantConnection({
    bookStoreId,
  });

  const supplierRepo = dataSource.getRepository(Supplier);

  // Validate uniqueness in tenant DB
  const existingEmail = await supplierRepo.findOne({
    where: { email: createSupplierDto.email }
  });

  if (existingEmail)
    throw new ConflictException('Email already used');

  const newSupplier = supplierRepo.create(createSupplierDto);
  return supplierRepo.save(newSupplier);
}
```

**Other Examples:**
- [shifts.service.ts](apps/api/src/modules/shifts/shifts.service.ts)
- [transactions.service.ts](apps/api/src/modules/transactions/transactions.service.ts)
- All tenant-scoped modules follow this pattern

---

## 5. How TenantService Initializes Connection

### Flow
```
getTenantConnection({ bookStoreId })
  ↓
Check if DataSource already initialized
  ↓ (Cache hit)
Return cached DataSource
  ↓ (Cache miss)
Check Redis for connection config
  ↓ (Redis hit)
Use cached config, initialize DataSource
  ↓ (Redis miss)
Fetch from main DB (database_connection table)
  ↓
Decrypt password (encryption.utils)
  ↓
Create and initialize DataSource to tenant DB
  ↓
Cache in Redis (TTL: 3600s default)
  ↓
Return DataSource
```

### Code Implementation
```typescript
private async initializeTenantDataSource(
  tenantKey: string,
  params: { bookStoreId?: string; storeCode?: string },
): Promise<DataSource> {
  const redisKey = `tenant_connection_config:${tenantKey}`;
  
  // Try Redis cache first
  let rawConfig = await this.redisClient.get(redisKey);
  
  if (!rawConfig) {
    // Fetch from main database
    const bookStoreData = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
      { connection: true },
    );

    rawConfig = {
      type: bookStoreData.connection.type,
      host: bookStoreData.connection.host,
      port: bookStoreData.connection.port,
      username: bookStoreData.connection.username,
      password: decryptPayload(bookStoreData.connection.password, this.configService),
      database: bookStoreData.connection.database,
    };

    // Cache in Redis
    await this.redisClient.set(
      redisKey,
      JSON.stringify(rawConfig),
      'EX',
      this.configTtlSeconds,
    );
  }

  // Initialize DataSource
  const options: DataSourceOptions = {
    type: rawConfig.type as any,
    host: rawConfig.host,
    port: rawConfig.port,
    username: rawConfig.username,
    password: rawConfig.password,
    database: rawConfig.database,
    entities: [join(__dirname, '../database/tenant/entities/**/*{.ts,.js}')],
    synchronize: true,
  };

  const ds = new DataSource(options);
  await ds.initialize();
  
  this.dataSourceMap.set(tenantKey, ds);
  return ds;
}
```

---

## 6. Complete Example: Supplier API Flow

### Step-by-Step
```
1. Frontend: User logs in and selects "Bookstore A"
   ↓
2. Frontend: Calls POST /auth/sign-in/bookstore with bookStoreId
   ↓
3. Backend: Returns JWT containing bookStoreId = "abc-123"
   ↓
4. Frontend: Stores JWT + currentStore.id in localStorage
   ↓
5. Frontend: User clicks "Get Suppliers"
   ↓
6. Frontend: Calls GET /suppliers with Authorization header
   ↓
7. Backend: @BookStoreId() extracts bookStoreId from JWT
   ↓
8. Controller: Calls supplierService.getSuppliers("abc-123")
   ↓
9. Service: Calls tenantService.getTenantConnection({ bookStoreId: "abc-123" })
   ↓
10. TenantService: 
    - Checks cache (DataSource map)
    - If miss: Checks Redis
    - If miss: Fetches connection config from main DB
    - Decrypts password
    - Initializes DataSource to tenant DB
    - Returns DataSource
   ↓
11. Service: Gets SupplierRepository from DataSource
   ↓
12. Service: Queries tenant database for suppliers
   ↓
13. Backend: Returns suppliers data
   ↓
14. Frontend: Displays suppliers
```

---

## 7. Important Patterns

### Pattern 1: Always Extract bookStoreId from @BookStoreId()
```typescript
@Get()
async getSuppliers(@BookStoreId() bookStoreId: string) {
  // bookStoreId is automatically extracted from JWT
  return this.supplierService.getSuppliers(bookStoreId);
}
```

### Pattern 2: Pass bookStoreId to Service Methods
```typescript
// Service method always receives bookStoreId
async getSuppliers(bookStoreId: string) {
  const dataSource = await this.tenantService.getTenantConnection({
    bookStoreId,
  });
  // ... rest of logic
}
```

### Pattern 3: Get Repository from DataSource
```typescript
const dataSource = await this.tenantService.getTenantConnection({ bookStoreId });
const repo = dataSource.getRepository(Entity); // NOT from main DB!
```

---

## 8. Configuration

### Environment Variables
- `tenant_config_ttl_second`: TTL for Redis cache (default: 3600s)
- Database connection credentials in `.env` (main DB)
- Tenant DB credentials stored encrypted in `database_connection` table

### Main vs Tenant Database
- **Main DB:** User authentication, bookstore metadata, database connections
- **Tenant DB:** Business data (suppliers, products, orders, etc.) isolated per bookstore

---

## 9. Error Handling

### Missing bookStoreId
```typescript
// @BookStoreId() decorator throws:
throw new BadRequestException('Không thể lấy được mã nhà sách.');
```

### Connection Failed
```typescript
// TenantService throws:
throw new NotFoundException('BookStore not found.');
// Or specific DB connection error
```

### Invalid Credentials
```typescript
// MainDatabaseConnectionService throws:
throw new BadRequestException(
  `Kết nối thất bại tới cơ sở dữ liệu: ${error.message}`,
);
```

---

## 10. Files Summary

| File | Purpose |
|------|---------|
| [jwt.strategy.ts](apps/api/src/modules/auth/strategies/jwt.strategy.ts) | Extracts bookStoreId from JWT token |
| [book-store-id.decorator.ts](apps/api/src/common/decorators/book-store-id.decorator.ts) | @BookStoreId() parameter decorator |
| [tenant.service.ts](apps/api/src/tenants/tenant.service.ts) | Manages tenant DB connections & caching |
| [supplier.service.ts](apps/api/src/modules/suppliers/supplier.service.ts) | Example: Using tenant connection |
| [supplier.controller.ts](apps/api/src/modules/suppliers/supplier.controller.ts) | Example: Using @BookStoreId() |
| [axios.ts](apps/web/src/lib/axios.ts) | Frontend: Sending bookStoreId in headers |
| [database-connection.entity.ts](apps/api/src/database/main/entities/database-connection.entity.ts) | Schema for storing tenant DB credentials |

---

## Quick Reference

### To Add a New Tenant-Scoped API:

1. **Controller:** Use `@BookStoreId()` decorator
```typescript
@Get()
async getData(@BookStoreId() bookStoreId: string) {
  return this.service.getData(bookStoreId);
}
```

2. **Service:** Get DataSource for bookstore
```typescript
async getData(bookStoreId: string) {
  const dataSource = await this.tenantService.getTenantConnection({ bookStoreId });
  const repo = dataSource.getRepository(Entity);
  return repo.find();
}
```

3. That's it! The tenant DB connection is automatic.
