# AI_CONTEXT.md

# TaskFlow Backend - AI Context

> This document provides essential context for AI coding assistants (Antigravity, Claude Code, Cursor, GitHub Copilot, etc.) working on the TaskFlow backend. Read this before generating, modifying, or reviewing any code.

---

# Project Overview

TaskFlow is a modern Kanban-based task management system built with NestJS.

The backend follows a feature-based modular architecture where every business feature is isolated into its own module.

The project is intentionally kept small but follows production-ready engineering practices including dependency injection, repository pattern, DTO validation, JWT authentication, Socket.IO, BullMQ, PostgreSQL, and Prisma.

This is **not** intended to replicate Jira or ClickUp. The focus is clean architecture, maintainability, and scalability.

---

# Technology Stack

## Framework

- NestJS 11

## Language

- TypeScript

## Database

- PostgreSQL

## ORM

- Prisma

## Authentication

- JWT
- Passport

## Validation

- class-validator
- class-transformer

## Realtime

- Socket.IO

## Background Jobs

- BullMQ

## Queue Storage

- Redis

## Email

- NestJS Mailer
- Nodemailer

## API Documentation

- Swagger

---

# Project Architecture

The backend follows a layered architecture.

```

HTTP Request
↓
Controller
↓
DTO Validation
↓
Service
↓
Repository
↓
Prisma
↓
PostgreSQL

```

Responses always travel back through the same layers.

---

# Module Structure

Each feature exists inside its own module.

Example

```

task/

controller

service

repository

dto

module

```

Every module is responsible only for its own business logic.

Never mix business logic between unrelated modules.

---

# Current Modules

Authentication

Workspace

Workspace Member

Project

Project Member

Board

Board Column

Task

Task Assignee

Comment

Attachment

Label

Task Label

Notification

Notification Dispatcher

Notification Queue

Socket

Queue

Email

Storage

Health

Logger

Prisma

---

# Responsibilities

## Controller

Controllers are responsible only for:

- Routing
- Authentication decorators
- Authorization decorators
- DTO validation
- Returning responses

Controllers should never contain business logic.

Controllers should never call Prisma.

---

## Service

Services contain all business logic.

Examples

- Task assignment
- Permission checks
- Validation
- Notification triggering
- Email dispatching
- Socket events

Business rules always belong here.

---

## Repository

Repositories are responsible only for database access.

Repositories should

- read
- create
- update
- delete

Repositories must never

- send email
- emit sockets
- perform permission checks
- contain business rules

Repositories communicate only with Prisma.

---

# DTO Rules

Every request entering the application must be validated using DTOs.

Never accept raw request bodies.

Always use

- class-validator
- class-transformer

DTOs belong inside the module.

Example

```

task/dto

```

---

# Authentication

Authentication uses JWT.

Flow

Login

↓

JWT Created

↓

Client stores token

↓

Authorization Header

↓

JWT Guard

↓

JwtStrategy

↓

Current User

The authenticated user is available as JwtPayload.

Never trust user IDs sent from the frontend when authenticated user information already exists in the JWT.

Always use

```

user.sub

```

instead of

```

body.userId

```

whenever possible.

---

# Authorization

Authentication and authorization are different.

Authentication

Who are you?

Authorization

Are you allowed to perform this action?

Ownership and permission checks belong inside services.

---

# Database Access

Prisma is the only database layer.

Never write raw SQL unless absolutely necessary.

Repositories should communicate with Prisma only.

---

# Notification System

Notifications follow this flow

Task Assigned

↓

NotificationService

↓

NotificationRepository

↓

Database

↓

NotificationDispatcher

↓

Socket.IO

↓

BullMQ

↓

Email Worker

The notification should always be saved before realtime delivery.

---

# Socket.IO

Socket.IO is used only for realtime communication.

Current usage

- Live notifications

Users join a private room

```

user:{id}

```

The dispatcher emits to that room.

---

# BullMQ

BullMQ handles background processing.

Current jobs

- Email notifications

Future jobs may include

- Due date reminders
- Daily summaries
- Cleanup jobs

Workers should never contain business logic.

Workers execute background tasks only.

---

# Email

Emails are never sent directly from feature modules.

Feature modules

↓

Notification Dispatcher

↓

BullMQ

↓

Worker

↓

Email Service

This keeps API responses fast.

---

# Error Handling

Use NestJS exceptions.

Examples

```

NotFoundException

ConflictException

ForbiddenException

UnauthorizedException

BadRequestException

```

Never throw plain Error.

---

# Response Style

Successful responses should be predictable.

Example

```json
{
  "message": "Task created successfully",
  "data": {}
}
```

Paginated responses should include metadata.

Example

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

---

# Dependency Injection Rules

Always inject dependencies through constructors.

Example

```ts
constructor(
    private readonly taskRepository: TaskRepository,
    private readonly notificationService: NotificationService,
) {}
```

Never manually instantiate services.

Never use `new SomeService()`.

---

# File Naming

Use lowercase.

Examples

```

task.controller.ts

task.service.ts

task.repository.ts

task.module.ts

request.dto.ts

response.dto.ts

```

---

# Naming Conventions

Classes

PascalCase

Variables

camelCase

Interfaces

PascalCase

Enums

PascalCase

Constants

UPPER_SNAKE_CASE

---

# Coding Standards

Prefer readability over clever code.

Avoid deeply nested if statements.

Extract reusable logic.

Keep methods focused on a single responsibility.

Use descriptive method names.

Avoid duplicate logic.

---

# Things AI Should Never Do

Never bypass repositories.

Never access Prisma directly inside controllers.

Never place business logic inside repositories.

Never expose passwords.

Never disable validation.

Never remove authentication.

Never remove authorization checks.

Never use `any` unless absolutely necessary.

Never break existing API contracts without updating documentation.

---

# Preferred Development Workflow

When implementing a new feature

1. Create DTO
2. Create Repository methods
3. Implement Service logic
4. Update Controller
5. Update Swagger
6. Add notifications if required
7. Add Socket events if required
8. Queue email if required
9. Test API
10. Update documentation

Follow this workflow consistently.

---

# AI Instructions

When modifying this project

- Preserve the existing architecture.
- Follow the module boundaries.
- Reuse existing services whenever possible.
- Prefer consistency over introducing new patterns.
- Do not create duplicate utilities if an existing implementation already exists.
- Keep code simple, readable, and aligned with the project's current structure.