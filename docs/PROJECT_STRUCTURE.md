# Project Structure

Version: 1.0.0

---

# Purpose

This document explains the overall folder structure of the TaskFlow backend and the responsibility of each directory and module.

The project follows a **feature-based modular architecture**, where each business feature is isolated into its own module. Shared functionality is placed in the `common` directory, while infrastructure concerns are kept separate.

---

# Root Structure

```
src/
│
├── common/
├── config/
├── database/
├── modules/
├── main.ts
└── app.module.ts
```

---

# common/

Contains reusable components shared across the application.

```
common/
│
├── logger/
├── password/
├── storage/
└── token/
```

### logger/

Application logging.

Responsibilities

- Logger Module
- Request Logging
- Application Logging

---

### password/

Password utilities.

Responsibilities

- Hash Password
- Compare Password

Used by

- Auth Module

---

### storage/

File storage abstraction.

Responsibilities

- Upload Files
- Delete Files
- Generate URLs

Used by

- Attachment Module

---

### token/

JWT utilities.

Responsibilities

- Generate Access Token
- Generate Refresh Token
- Verify Tokens

Used by

- Auth Module

---

# config/

Contains application configuration.

```
config/

configuration.ts

index.ts

validation.ts
```

Responsibilities

- Environment Variables
- Config Validation
- Global Configuration

---

# database/

Database infrastructure.

```
database/

prisma/

├── prisma.module.ts

├── prisma.service.ts
```

Responsibilities

- Prisma Client
- Database Connection

No business logic belongs here.

---

# modules/

Contains every business module.

Each module owns its own

- Controller
- Service
- Repository
- DTO
- Module

---

# Auth Module

```
auth/

controller

service

repository

dto

jwt.strategy
```

Responsibilities

- Register
- Login
- JWT Authentication
- Current User

Depends On

- Password Module
- Token Module
- Prisma

---

# Workspace Module

Responsibilities

- Create Workspace
- Update Workspace
- Delete Workspace
- List Workspaces

---

# Workspace Member Module

Responsibilities

- Invite Members
- Remove Members
- List Members

---

# Project Module

Responsibilities

- Create Project
- Update Project
- Delete Project
- List Projects

---

# Project Member Module

Responsibilities

- Add Members
- Remove Members
- List Members

---

# Board Module

Responsibilities

- Create Board
- Update Board
- Delete Board

---

# Board Column Module

Responsibilities

- Create Column
- Update Column
- Delete Column
- Reorder Columns

---

# Task Module

Responsibilities

- Create Task
- Update Task
- Delete Task
- Move Task
- View Task

This is one of the largest business modules.

---

# Task Assignee Module

Responsibilities

- Assign User
- Remove User
- List Assignees

Uses

- Notification Module

---

# Label Module

Responsibilities

- CRUD Labels

---

# Task Label Module

Responsibilities

- Assign Labels
- Remove Labels

---

# Comment Module

Responsibilities

- Create Comment
- Update Comment
- Delete Comment

---

# Attachment Module

Responsibilities

- Upload Files
- Delete Files
- List Attachments

Uses

- Storage Module

---

# Notification Module

Responsibilities

- Store Notifications
- Read Notifications
- Delete Notifications
- Mark Read
- Unread Count

This module manages notification data only.

It does **not** send emails or emit socket events directly.

---

# Notification Dispatcher Module

Responsibilities

Central notification delivery service.

Flow

```
Business Module

↓

Notification Dispatcher

↓

Socket

↓

BullMQ

```

Used by

- Task Assignee
- Future business modules

Any feature that wants to notify users should use this module.

---

# Notification Queue Module

Responsibilities

Background processing of notification jobs.

Current Jobs

- Task Assigned Email

Future Jobs

- Due Date Reminder
- Daily Summary
- Weekly Summary

Workers only execute background jobs.

They do not contain business logic.

---

# Queue Module

Responsibilities

BullMQ Configuration

Redis Connection

Queue Registration

This module should not contain workers.

It only configures queues.

---

# Socket Module

Responsibilities

- Socket.IO Gateway
- JWT Authentication
- User Rooms
- Event Emission

Current Events

```
notification
```

Users automatically join

```
user:{id}
```

---

# Email Module

Responsibilities

- Send Email
- Build Email Templates

Current Email

Task Assigned

Future

Password Reset

Workspace Invitation

Project Invitation

---

# Health Module

Responsibilities

Health Check Endpoint

```
GET /health
```

---

# Module Dependency Flow

```
Task Module

↓

Notification Module

↓

Notification Dispatcher

↓

Socket Module

↓

Notification Queue

↓

Email Module
```

---

# Dependency Rules

Business modules may depend on

- Notification Module
- Storage Module
- Common Utilities

Business modules should **not** depend on unrelated feature modules unless necessary.

Example

Good

```
Task

↓

Notification
```

Bad

```
Workspace

↓

Comment

```

without a valid business reason.

---

# Typical Request Flow

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

Database

↓

Repository

↓

Service

↓

Controller

↓

HTTP Response
```

---

# Notification Flow

```
Assign User

↓

TaskAssigneeService

↓

NotificationService

↓

NotificationRepository

↓

Database

↓

NotificationDispatcher

↓

Socket Event

↓

BullMQ Queue

↓

Notification Worker

↓

Email Service

↓

SMTP
```

---

# Folder Naming Rules

Folders use

```
kebab-case
```

Examples

```
task-assignee

workspace-member

notification-dispatcher

notification-queue
```

---

# File Naming Rules

Examples

```
task.controller.ts

task.service.ts

task.module.ts

task.repository.ts

request.dto.ts

response.dto.ts
```

---

# General Principles

- Every module has a single responsibility.
- Business logic belongs in services.
- Database logic belongs in repositories.
- Shared functionality belongs in `common`.
- Infrastructure belongs in dedicated infrastructure modules.
- Modules should remain loosely coupled.
- Keep dependencies minimal and explicit.