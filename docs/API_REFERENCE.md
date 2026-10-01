# API Reference

Version: 1.0.0

---

# Overview

TaskFlow exposes REST APIs grouped by feature modules.

Base URL

/api

Authentication

All protected APIs require

Authorization: Bearer <JWT_TOKEN>

except

- Login
- Register
- Health

---

# Authentication Module

Base Path

/auth

---

## Login

POST /auth/login

Description

Authenticate a user and return JWT.

Authentication

❌ Not Required

Request

{
    "email": "user@example.com",
    "password": "password"
}

Success

200 OK

{
    "accessToken": "...",
    "user": {}
}

Errors

400

401

---

## Register

POST /auth/register

Authentication

❌ Not Required

Purpose

Create a new user account.

---

## Current User

GET /auth/me

Authentication

✅ Required

Returns

Current authenticated user.

---

# Workspace Module

Base Path

/workspaces

---

## Create Workspace

POST /workspaces

Authentication

✅

---

## Get Workspaces

GET /workspaces

Authentication

✅

Pagination

Supported

---

## Workspace Details

GET /workspaces/:id

Authentication

✅

---

## Update Workspace

PATCH /workspaces/:id

Authentication

✅

---

## Delete Workspace

DELETE /workspaces/:id

Authentication

✅

---

# Workspace Members

/workspaces/:workspaceId/members

GET

POST

DELETE

Purpose

Manage workspace members.

---

# Project Module

Base Path

/projects

---

## Create Project

POST /projects

---

## Project List

GET /projects

Supports

Pagination

---

## Project Details

GET /projects/:id

---

## Update Project

PATCH /projects/:id

---

## Delete Project

DELETE /projects/:id

---

# Project Members

/projects/:projectId/members

GET

POST

DELETE

---

# Board Module

Base Path

/boards

---

GET /boards

POST /boards

GET /boards/:id

PATCH /boards/:id

DELETE /boards/:id

---

# Board Column Module

Base Path

/columns

---

GET /columns

POST /columns

PATCH /columns/:id

DELETE /columns/:id

---

# Task Module

Base Path

/tasks

---

## Create Task

POST /tasks

Purpose

Create a new task.

---

## Get Tasks

GET /tasks

Supports

Pagination

---

Future Filters

status

priority

assignee

label

search

---

## Task Details

GET /tasks/:id

Returns

Task

Reporter

Assignees

Labels

Comments

Attachments

---

## Update Task

PATCH /tasks/:id

---

## Delete Task

DELETE /tasks/:id

---

## Move Task

PATCH /tasks/:id/move

Purpose

Move task between columns.

---

# Task Assignee Module

Base Path

/tasks/:taskId/assignees

---

## Assign User

POST

Purpose

Assign a user to task.

Automatically

Creates notification

Emits socket event

Queues email

---

## Remove User

DELETE

---

## List Assignees

GET

---

## User Assigned Tasks

GET

/users/:userId/tasks

---

# Label Module

Base Path

/labels

---

GET

POST

PATCH

DELETE

---

# Task Label Module

/tasks/:taskId/labels

---

POST

Assign label

DELETE

Remove label

GET

List labels

---

# Comment Module

Base Path

/comments

---

POST

Create comment

GET

List comments

PATCH

Update comment

DELETE

Delete comment

---

# Attachment Module

Base Path

/attachments

---

POST

Upload attachment

GET

List attachments

DELETE

Delete attachment

---

# Notification Module

Base Path

/notifications

---

## Get Notifications

GET

Supports Pagination

---

## Unread Count

GET

/notifications/unread-count

Returns

{
    "unreadCount": 5
}

---

## Mark Read

PATCH

/notifications/:id/read

---

## Mark All Read

PATCH

/notifications/read-all

---

## Delete Notification

DELETE

/notifications/:id

---

# Health Module

GET

/health

Returns

Application status.

---

# Response Format

Successful response

{
    "message": "...",
    "data": {}
}

Paginated response

{
    "items": [],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
    }
}

---

# Authentication

Protected endpoints require

Authorization

Bearer JWT_TOKEN

---

# Common Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Server Error

---

# Pagination

Supported query parameters

?page=1

&limit=10

Example

GET /tasks?page=1&limit=20

---

# File Upload

Multipart/Form-Data

Supported

Images

Documents

PDF

Response returns uploaded file metadata.

---

# Realtime Integration

Some APIs automatically trigger realtime events.

Task Assignment

↓

Notification Created

↓

Socket Event

↓

BullMQ Job

↓

Email Worker

---

# Swagger

All endpoints are documented through Swagger.

Swagger URL

/api/docs

Always update Swagger documentation whenever a new endpoint is introduced.