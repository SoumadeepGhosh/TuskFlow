# Backend Development Rules

Version: 1.0.0

---

# Purpose

This document defines the coding standards and architectural rules for the TaskFlow backend.

Every new feature should follow these rules to maintain consistency across the project.

These rules apply to every module.

---

# Project Philosophy

TaskFlow follows

- Clean Code
- Modular Architecture
- Separation of Concerns
- Dependency Injection
- Repository Pattern

The project should remain simple, readable and maintainable.

Avoid unnecessary abstraction or over-engineering.

---

# Standard Module Structure

Every feature module should follow this structure.

```

module-name/

│

├── dto/

│ ├── request.dto.ts

│ └── response.dto.ts

│

├── repositories/

│ └── module.repository.ts

│

├── module.controller.ts

├── module.service.ts

├── module.module.ts

```

Optional folders

```

guards/

decorators/

interfaces/

constants/

types/

```

---

# Controller Rules

Controllers are responsible only for

- HTTP routes
- Swagger decorators
- Validation
- Authentication
- Calling services
- Returning responses

Controllers must NEVER

- Query Prisma
- Write business logic
- Send emails
- Emit socket events
- Perform permission checks
- Call Redis

Correct

Controller

↓

Service

Incorrect

Controller

↓

Repository

Incorrect

Controller

↓

Prisma

---

# Service Rules

Services contain all business logic.

Examples

- Validation
- Permission checking
- Assignment rules
- Notification creation
- Queue dispatching

Services may call

Repositories

Other Services

Socket Dispatcher

Notification Dispatcher

Queue

Services should NOT

Write raw SQL

Access Prisma directly

Contain HTTP logic

---

# Repository Rules

Repositories only interact with Prisma.

Repository responsibilities

Create

Read

Update

Delete

Nothing else.

Repositories should never

Send Email

Create JWT

Emit Socket

Call BullMQ

Perform Validation

Business Rules

Repositories are intentionally kept thin.

---

# DTO Rules

Every request must have a DTO.

Never accept

```

any

```

Never use

```

req.body

```

directly.

Always validate.

Example

```

CreateTaskDto

UpdateTaskDto

AssignUserDto

PaginationDto

```

---

# Validation Rules

Always validate

Required fields

Email

UUID

Numbers

Enums

Strings

Dates

Arrays

Use

class-validator

Example

```

@IsString()

@IsEmail()

@IsEnum()

@IsOptional()

@IsNumber()

```

---

# Dependency Injection

Always use constructor injection.

Correct

```ts
constructor(
    private readonly repository: TaskRepository,
    private readonly notificationService: NotificationService,
) {}
```

Incorrect

```ts
const repository = new TaskRepository();
```

Never manually instantiate services.

---

# Database Rules

Database access always follows

Controller

↓

Service

↓

Repository

↓

Prisma

Never

Controller

↓

Prisma

Never

Service

↓

Prisma

---

# Error Handling

Always use NestJS exceptions.

Correct

```ts
throw new NotFoundException();
```

Correct

```ts
throw new ConflictException();
```

Correct

```ts
throw new ForbiddenException();
```

Never

```ts
throw new Error();
```

---

# Authentication

JWT authentication is mandatory for protected APIs.

Current user

```ts
user.sub
```

Never trust

```ts
body.userId
```

when user information already exists inside JWT.

---

# Authorization

Authentication

Who is the user?

Authorization

Can this user perform the action?

Permission checks belong inside services.

Never inside controllers.

---

# Notification Rules

Whenever business logic requires notifying a user

Do NOT

SocketGateway.send()

Instead

NotificationService

↓

NotificationDispatcher

↓

Socket

↓

BullMQ

↓

Email

Notification must always be stored before delivery.

---

# Queue Rules

Business modules never interact directly with BullMQ.

Correct

TaskService

↓

NotificationDispatcher

↓

BullMQ

Incorrect

TaskService

↓

BullMQ

Dispatcher acts as the central notification entry point.

---

# Socket Rules

SocketGateway should only contain

Connection

Authentication

Room Management

Event Emission

Business logic does not belong inside gateways.

---

# Email Rules

Feature modules never send email directly.

Correct

Notification Dispatcher

↓

BullMQ

↓

Worker

↓

Email Service

Incorrect

Task Service

↓

Email Service

---

# API Response Rules

Successful response

```json
{
    "message": "Success",
    "data": {}
}
```

Paginated response

```json
{
    "items": [],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
    }
}
```

Keep responses consistent.

---

# Naming Rules

Folders

kebab-case

```

task-assignee

workspace-member

```

Files

kebab-case

```

task.service.ts

```

Classes

PascalCase

```

TaskService

```

Variables

camelCase

```

taskRepository

```

Constants

UPPER_SNAKE_CASE

```

MAX_FILE_SIZE

```

Enums

PascalCase

```

NotificationType

```

---

# Function Rules

Functions should

Do one thing

Be small

Have descriptive names

Good

```

createTask()

assignUser()

markRead()

findWorkspace()

```

Avoid

```

processEverything()

handleData()

```

---

# Code Style

Prefer early return.

Good

```ts
if (!task) {
    throw new NotFoundException();
}

return task;
```

Avoid deeply nested if statements.

Extract reusable logic.

Avoid duplicated code.

---

# Logging

Log only important events.

Examples

User Login

Task Assigned

Notification Created

Socket Connected

Worker Processed Job

Avoid excessive console logging in production.

---

# Swagger Rules

Every controller should include

Operation summary

Request DTO

Response DTO

Authentication decorator

Status codes

Swagger must stay synchronized with implementation.

---

# Security Rules

Never expose

Password

Refresh Token

JWT Secret

Internal IDs unnecessarily

Always hash passwords.

Always validate input.

Never trust frontend data.

---

# File Upload Rules

Store only metadata in PostgreSQL.

Actual files remain in object storage.

Always validate

File Size

Mime Type

Extension

---

# Pagination Rules

Every list endpoint should support

```

?page=1

&limit=10

```

Return

Items

Meta

---

# Future Features

New features should follow the same architecture.

Controller

↓

Service

↓

Repository

↓

Database

If realtime is required

↓

Notification Dispatcher

↓

Socket

↓

BullMQ

↓

Worker

↓

Email

Never bypass this flow.

---

# General Principles

Keep modules independent.

Reuse existing services.

Avoid duplicate code.

Follow existing project patterns.

Write readable code.

Maintain consistency over cleverness.

Prefer simplicity.

A developer unfamiliar with the project should be able to understand any module within a few minutes.
