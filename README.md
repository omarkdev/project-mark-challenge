# Project Mark Test

A Node.js application for managing topics, resources, and users with versioning support.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-mark-test
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## API Documentation (Swagger)

Access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Protected endpoints require a valid Bearer token in the Authorization header.

### User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "editor"  // Optional, defaults to "viewer"
}
```

Available roles:
- `admin`: Full access to all operations
- `editor`: Can create and edit topics and resources
- `viewer`: Read-only access (default)

### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "editor"
  }
}
```

### Using Authentication

Include the JWT token in the Authorization header for protected endpoints:
```http
Authorization: Bearer <jwt-token>
```

Protected endpoints:
- POST /topics (Create topic)
- PUT /topics/{id} (Update topic)
- DELETE /topics/{id} (Delete topic)
- POST /resources (Create resource)
- PUT /resources/{id} (Update resource)
- DELETE /resources/{id} (Delete resource)

## API Endpoints

### Topics

#### Create a Topic (Protected)
```http
POST /topics
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Topic Name",
  "content": "Topic Content",
  "parentTopicId": "optional-parent-id"
}
```

#### Get a Topic
```http
GET /topics/{id}
```
Returns the topic with its children and all versions.

#### Get Topic Path
```http
GET /topics/path/{fromId}/to/{toId}
```
Returns the shortest path between two topics in the hierarchy.

#### Update a Topic (Protected)
```http
PUT /topics/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "content": "Updated Content"
}
```

#### Delete a Topic (Protected)
```http
DELETE /topics/{id}
Authorization: Bearer <jwt-token>
```

### Resources

#### Create a Resource (Protected)
```http
POST /resources
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "topicId": "associated-topic-id",
  "url": "https://example.com",
  "description": "Resource description",
  "type": "article"
}
```

#### Get a Resource
```http
GET /resources/{id}
```

#### Update a Resource (Protected)
```http
PUT /resources/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "url": "https://example.com/updated",
  "description": "Updated description",
  "type": "video"
}
```

#### Delete a Resource (Protected)
```http
DELETE /resources/{id}
Authorization: Bearer <jwt-token>
```

### Role-Based Access Control

1. Admin Role (`admin`):
   - Full access to all operations
   - Can create, read, update, and delete any topic or resource
   - Can manage user roles

2. Editor Role (`editor`):
   - Can create new topics and resources
   - Can edit existing topics and resources
   - Can view all content

3. Viewer Role (`viewer`):
   - Can view all topics and resources
   - Cannot create, edit, or delete content
   - Default role for new users

## Testing Workflow

1. Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe", "role": "editor"}'
```

2. Login to get JWT token:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

3. Create a Root Topic:
```bash
curl -X POST http://localhost:3000/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"name": "Root Topic", "content": "Main content"}'
```

4. Create Child Topics:
```bash
curl -X POST http://localhost:3000/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"name": "Child Topic", "content": "Child content", "parentTopicId": "parent-id"}'
```

5. Add Resources to Topics:
```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"url": "https://example.com", "description": "Resource description", "type": "article", "topicId": "topic-id"}'
```

6. View Topic Hierarchy:
```bash
curl http://localhost:3000/topics/root-topic-id
```

## Development

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

Apply migrations:
```bash
npx prisma migrate deploy
```

### Code Style

The project uses ESLint and Prettier for code formatting. Run:
```bash
npm run lint
npm run format
```

## License

[MIT License](LICENSE)
