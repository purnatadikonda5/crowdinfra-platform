# Microservices Architecture Plan & Task Distribution (Exhaustive)

I have deeply cross-referenced this plan with the master Claude analysis. I have added the missing OAuth, Refresh Tokens, Password Resets, Property Inquiries, Heatmaps, and Swagger UI configurations to ensure **nothing** is left behind.

---

## 👨‍💻 Person 1: Gateway, Identity, & Infrastructure

### 1. Infra: Docker Compose & Base Config
**Prompt:**
> "Create a `docker-compose.yml` file to spin up our local infrastructure for a Spring Boot microservices project. It needs: one MongoDB instance (exposing 27017, we will create 3 logical DBs inside it), one Redis instance (exposing 6379), and a MinIO instance for local object storage (exposing 9000). Also provide the base Maven `pom.xml` configurations for Spring Boot 3.2, ensuring we have dependencies for Web, Data MongoDB, Data Redis, `springdoc-openapi-starter-webmvc-ui` (for Swagger UI), and Lombok."

### 2. API Gateway: Routing & CORS Configuration
**Prompt:**
> "Initialize a Spring Cloud Gateway project running on port `8080`. Create an `application.yml` file that defines routes for three backend services: `user-service` (URI `http://localhost:8081`, predicates `/api/auth/**`, `/api/user/**`), `demand-service` (URI `http://localhost:8082`, predicates `/api/demand/**`, `/api/comments/**`, `/api/analytics/**`), and `property-service` (URI `http://localhost:8083`, predicates `/api/property/**`). Configure global CORS to allow requests from `http://localhost:3000` with all methods, headers, and allow-credentials true."

### 3. API Gateway: JWT Edge Filter
**Prompt:**
> "In the Spring Cloud Gateway project, implement a global `JwtAuthFilter`. Create a `PUBLIC_PATHS` list (`/api/auth/login`, `/api/auth/signup`, `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/auth/refresh`, `/api/auth/forgot-password`, `/api/auth/reset-password`). If the request path is not public, intercept it, extract the `Authorization: Bearer` token, and validate it using `jjwt`. Extract the user's ID and role from the token claims, mutate the incoming request to append `X-User-Id` and `X-User-Role` headers, and forward it. If validation fails, return 401."

### 4. User Service: Project & Exhaustive Model Setup
**Prompt:**
> "Initialize the `user-service` Spring Boot project on port `8081`. Configure `application.yml` for MongoDB `users_db` and Redis. Include `springdoc-openapi` for Swagger. Create the `User` entity mapping to `users`. Fields: `id`, `email` (unique), `phone` (unique), `name`, `passwordHash`, `role` (Enum: `CITIZEN`, `BUSINESS`, `LANDLORD`, `ADMIN`), `profileImageUrl`, `isEmailVerified`, `age`, `bio`, `refreshTokenHash`, `socialProvider` (String), and `socialId` (String). Create a `UserRepository`."

### 5. User Service: Redis OTP Service
**Prompt:**
> "In `user-service`, create an `OtpService` using `StringRedisTemplate`. Implement `generate(String phone)` that creates a 6-digit string, saves it to Redis with key `otp:{phone}` and a 5-minute TTL, and prints it (placeholder for SMS). Implement `verify(String phone, String otp)` that retrieves, compares, and deletes the key on success."

### 6. User Service: Auth Controller (JWT, Refresh, OAuth)
**Prompt:**
> "In `user-service`, implement `AuthService` and `AuthController`. Implement `POST /api/auth/signup` (hash password, save User, call OtpService). Implement `POST /api/auth/login` (verify password, generate an Access JWT and a long-lived Refresh JWT, save refresh hash to DB, return both). Implement `POST /api/auth/refresh` (validate refresh token, issue new access token). Implement basic OAuth stub `POST /api/auth/oauth/google` that accepts a Google token, verifies it, and upserts a User with `socialProvider='google'`."

### 7. User Service: Password Reset & Profile
**Prompt:**
> "In `user-service`, implement password recovery: `POST /api/auth/forgot-password` (generates a unique token to Redis with 15m TTL and prints reset link) and `POST /api/auth/reset-password` (validates token, updates `passwordHash`). Then, in `UserController` (using `@RequestHeader(\"X-User-Id\")`), implement `GET /api/user/profile`, `PUT /api/user/profile` (update name, age, bio), and `POST /api/user/avatar` (accepts `MultipartFile`, uploads to MinIO/Cloudinary, saves URL)."

### 8. User Service: Ratings & Admin
**Prompt:**
> "In `user-service`, implement Platform Ratings. Create a `Rating` entity (userId, rating, review). Implement `POST /api/user/rating` (using `X-User-Id`) ensuring only one review per user (upsert). Implement `GET /api/user/ratings` to fetch all reviews. Create an admin endpoint `PATCH /api/admin/users/{id}/suspend` checking that `X-User-Role` is `ADMIN`."

---

## 👨‍💻 Person 2: Demands, Properties, & AI

### 9. Demand Service: Project & Exhaustive Model Setup
**Prompt:**
> "Initialize the `demand-service` Spring Boot project on port `8082`. Configure MongoDB `demands_db` and Redis. Include `springdoc-openapi`. Create the `Demand` entity (fields: `id`, `title`, `description`, `category`, `status` [PENDING, FULFILLED], `userId` (required string), `location` [GeoJsonPoint, 2dsphere index], `address` (string), `images` (List of strings), `viewCount`, `upvoteCount`, `upvotedBy`, and `aiAnalysis`). Create the `Comment` entity."

### 10. Demand Service: CRUD & Image Uploads
**Prompt:**
> "In `demand-service`, create `DemandController` and `DemandService`. All protected routes must extract `@RequestHeader(\"X-User-Id\")` and `@RequestHeader(\"X-User-Role\")`. Implement `POST /api/demand` (accepting JSON plus optional image uploads to MinIO/Cloudinary). Implement `PUT /api/demand/{id}` and `DELETE /api/demand/{id}` (ensure ownership or ADMIN). Implement `PATCH /api/admin/demands/{id}/status` to mark demands fulfilled."

### 11. Demand Service: Pagination, Geospatial & Heatmaps
**Prompt:**
> "In `demand-service`, implement `GET /api/demand` returning a paginated `Page<Demand>` with optional filters (category, status, lat, lng, radius for `$near` geospatial queries). Also, implement a new endpoint `GET /api/demand/clusters` that accepts a bounding box (`minLat, maxLat, minLng, maxLng`) and returns lightweight coordinate data for frontend heatmaps."

### 12. Demand Service: Upvotes & Comments
**Prompt:**
> "In `demand-service`, implement `POST /api/demand/{id}/vote` using `X-User-Id`. If the user ID is in the demand's `upvotedBy` list, remove it and decrement `upvoteCount`; otherwise add it and increment. Implement `POST /api/comments/{demandId}` to add a comment (storing `userId`, `userName` [denormalized], and `text`), and `GET /api/comments/{demandId}`."

### 13. Demand Service: Gemini AI Proxy & Redis Cache
**Prompt:**
> "In `demand-service`, implement `GeminiService`. Read `gemini.api.key` from `application.yml`. Implement `analyze(Demand demand)` constructing a prompt asking for executive summary and market potential. Use `RestTemplate` to call the Gemini REST API. Cache the JSON response in Redis using key `gemini:demand:{id}` with a 24-hour TTL. Expose via `GET /api/analytics/demand/{id}` checking `X-User-Role` is `BUSINESS` or `ADMIN`. Add a force-refresh endpoint `POST /api/analytics/demand/{id}/refresh`."

### 14. Property Service: Project & Exhaustive Model Setup
**Prompt:**
> "Initialize the `property-service` Spring Boot project on port `8083`. Configure MongoDB `properties_db`. Include `springdoc-openapi`. Create `Property` entity. Fields: `id`, `title`, `description`, `category` (RESIDENTIAL, COMMERCIAL, LAND), `listingType` (SELL, RENT, LEASE), `ownerId` (required string), `contactNumber`, `price`, `areaSqft`, `status` (AVAILABLE, SOLD, RENTED), `images` (List of strings), `address` (string), `nearbyDemandCount` (int), and `location` (GeoJsonPoint, 2dsphere index)."

### 15. Property Service: CRUD & Inquiries
**Prompt:**
> "In `property-service`, create `PropertyController` using `@RequestHeader(\"X-User-Id\")`. Implement `POST /api/property` (enforcing ownership). Implement `PUT /api/property/{id}`, `DELETE /api/property/{id}`, and `PATCH /api/property/{id}/status`. Add a new engagement endpoint: `POST /api/property/{id}/inquiry`. It should accept a message and contact info, and simulate sending an email/notification to the property `ownerId`."

### 16. Property Service: Search & Geospatial
**Prompt:**
> "In `property-service`, implement `GET /api/property/search` supporting pagination and filters: `category`, `listingType`, `minPrice`, `maxPrice`. Add `GET /api/property/near-demand` accepting `lat`, `lng`, and `radius`, utilizing MongoDB `$near` queries to return properties geographically close to a specific point. Ensure all endpoints are documented automatically by the included Swagger UI."
