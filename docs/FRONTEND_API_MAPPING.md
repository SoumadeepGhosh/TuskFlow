# FRONTEND_API_MAPPING.md

# Frontend API Mapping

Version: 1.0.0

---

# Purpose

This document maps every frontend page to the backend APIs it consumes.

Its purpose is to help developers and AI assistants understand:

- Which API belongs to which page
- Which APIs should be called on page load
- Which APIs mutate data
- Which actions trigger notifications
- Which pages require Socket.IO updates

---

# Authentication

## Login Page

Route

```
/login
```

APIs

```
POST /auth/login
```

Flow

```
User enters credentials

↓

Login API

↓

Receive JWT

↓

Store Token

↓

Navigate to Dashboard
```

---

## Register Page

Route

```
/register
```

API

```
POST /auth/register
```

---

## Current User

Called immediately after login.

```
GET /auth/me
```

Purpose

- User Name
- Email
- Avatar
- Profile

---

# Dashboard

Route

```
/
```

Dashboard loads summary information.

Example future API

```
GET /dashboard
```

Possible widgets

Workspace Count

Project Count

Task Count

Completed Tasks

Pending Tasks

Assigned Tasks

Recent Activity

Notifications

---

# Workspace Page

Route

```
/workspaces
```

Load

```
GET /workspaces
```

Create

```
POST /workspaces
```

Update

```
PATCH /workspaces/:id
```

Delete

```
DELETE /workspaces/:id
```

---

# Workspace Details

Route

```
/workspaces/:id
```

Load

```
GET /workspaces/:id
```

Also loads

Projects

Members

---

# Workspace Members

Load

```
GET /workspaces/:id/members
```

Invite

```
POST /workspaces/:id/members
```

Remove

```
DELETE /workspaces/:id/members/:userId
```

---

# Project List

Route

```
/projects
```

Load

```
GET /projects
```

Create

```
POST /projects
```

Update

```
PATCH /projects/:id
```

Delete

```
DELETE /projects/:id
```

---

# Project Details

Route

```
/projects/:id
```

Load

```
GET /projects/:id
```

Should include

Project

Boards

Members

Statistics

---

# Project Members

Load

```
GET /projects/:id/members
```

Add

```
POST /projects/:id/members
```

Remove

```
DELETE /projects/:id/members/:userId
```

---

# Board Page

Route

```
/boards/:id
```

Main API

```
GET /boards/:id
```

Should return

Board

Columns

Tasks

Used for Kanban UI.

---

# Board Column

Create

```
POST /columns
```

Update

```
PATCH /columns/:id
```

Delete

```
DELETE /columns/:id
```

---

# Task Modal

Opening a task should require only one API.

```
GET /tasks/:id
```

Should return

Task

Reporter

Assignees

Labels

Comments

Attachments

Project

Column

---

# Create Task

```
POST /tasks
```

---

# Edit Task

```
PATCH /tasks/:id
```

---

# Delete Task

```
DELETE /tasks/:id
```

---

# Move Task

When drag-and-drop occurs.

```
PATCH /tasks/:id/move
```

Frontend should optimistically update UI.

---

# Task Assignees

Load

```
GET /tasks/:taskId/assignees
```

Assign

```
POST /tasks/:taskId/assignees
```

Remove

```
DELETE /tasks/:taskId/assignees/:userId
```

Assigning a user automatically

- Creates Notification
- Emits Socket Event
- Queues Email

Frontend only calls one API.

---

# Labels

Load

```
GET /labels
```

Create

```
POST /labels
```

Update

```
PATCH /labels/:id
```

Delete

```
DELETE /labels/:id
```

---

# Task Labels

Assign

```
POST /tasks/:taskId/labels
```

Remove

```
DELETE /tasks/:taskId/labels/:labelId
```

---

# Comments

Load

```
GET /comments?taskId=:id
```

Create

```
POST /comments
```

Update

```
PATCH /comments/:id
```

Delete

```
DELETE /comments/:id
```

---

# Attachments

Upload

```
POST /attachments
```

List

```
GET /attachments?taskId=:id
```

Delete

```
DELETE /attachments/:id
```

---

# Notifications

Load

```
GET /notifications
```

Unread Count

```
GET /notifications/unread-count
```

Mark Read

```
PATCH /notifications/:id/read
```

Mark All

```
PATCH /notifications/read-all
```

Delete

```
DELETE /notifications/:id
```

---

# Profile

Load

```
GET /auth/me
```

Future

```
PATCH /profile

PATCH /profile/password
```

---

# Search

Future

```
GET /users?search=

GET /tasks?search=

GET /projects?search=
```

---

# Socket.IO

After login

Connect Socket

```
socket.connect()
```

Authentication

```
JWT Token
```

Listen

```
notification
```

When received

Update

Unread Count

Notification List

Toast

No API request required.

---

# React Query Recommendation

Each page should have one query.

Examples

```
useProjects()

useProject()

useBoard()

useTask()

useNotifications()

useLabels()

useComments()
```

Mutations

```
useCreateTask()

useUpdateTask()

useDeleteTask()

useAssignUser()

useCreateComment()
```

---

# Cache Invalidation

Creating Task

↓

Invalidate

```
tasks

board
```

Assign User

↓

Invalidate

```
task

assignees
```

Comment

↓

Invalidate

```
comments
```

Notification

↓

Invalidate

```
notifications

notification-count
```

---

# Loading Strategy

Every page should support

Loading

Empty State

Error State

Success State

Avoid blank screens.

---

# API Ownership Summary

| Frontend Page | Primary Backend Module |
|---------------|------------------------|
| Login | Auth |
| Register | Auth |
| Dashboard | Dashboard (Future) |
| Workspace | Workspace |
| Workspace Members | Workspace Member |
| Projects | Project |
| Project Members | Project Member |
| Board | Board |
| Columns | Board Column |
| Tasks | Task |
| Task Assignees | Task Assignee |
| Labels | Label |
| Task Labels | Task Label |
| Comments | Comment |
| Attachments | Attachment |
| Notifications | Notification |
| Profile | Auth/Profile |

---

# Frontend Rule

Each page should communicate only with its corresponding API module.

Do not duplicate business logic in the frontend.

Business rules belong to the backend.

The frontend should focus on rendering UI, handling user interactions, and managing client-side state.