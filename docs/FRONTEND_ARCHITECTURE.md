# FRONTEND_ARCHITECTURE.md

# TaskFlow Frontend Architecture

## Overview

The TaskFlow frontend is built using **Next.js 16 App Router** with **TypeScript** and follows a **feature-first architecture**.

The architecture emphasizes:

- Scalability
- Maintainability
- Reusability
- Clear separation of concerns
- Modern React best practices

The frontend consumes the existing NestJS REST APIs and Socket.IO events. It should never contain business logic that belongs to the backend.

---

# Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- dnd-kit
- Sonner
- Lucide React

---

# High Level Architecture

```
User
   │
   ▼
Next.js App Router
   │
   ▼
Layouts
   │
   ▼
Pages
   │
   ▼
Feature Components
   │
   ▼
Hooks
   │
   ▼
API Layer
   │
   ▼
NestJS Backend
   │
   ▼
PostgreSQL
```

Business logic belongs to the backend.

The frontend only:

- Displays data
- Sends requests
- Handles UI state
- Handles user interactions

---

# Folder Structure

```
frontend/

app/
components/
features/
hooks/
lib/
providers/
services/
types/
constants/
config/
utils/
styles/
public/
```

---

# App Router

The application uses the Next.js App Router.

Example

```
app/

(auth)

(dashboard)

api/

layout.tsx

loading.tsx

error.tsx

not-found.tsx
```

Use Route Groups to separate authenticated and public pages.

---

# Layout Architecture

## Root Layout

Responsible for:

- Fonts
- Global CSS
- Providers
- Theme
- Toasts

---

## Auth Layout

Used by

- Login
- Register

No sidebar.

No header.

---

## Dashboard Layout

Contains

- Sidebar
- Header
- Breadcrumb
- Main Content

Every authenticated page uses this layout.

---

# Feature First Architecture

Each module owns its own files.

Example

```
features/

workspace/

project/

board/

task/

notification/

attachment/

comment/
```

Each feature should contain

```
components/

hooks/

api/

schemas/

types/

constants/
```

Feature-specific code should remain inside the feature.

---

# Shared Components

Reusable UI components belong in

```
components/
```

Examples

- Button
- Card
- Modal
- Drawer
- Input
- Table
- Avatar
- Badge
- Spinner
- Skeleton
- Empty State
- Page Header
- Confirm Dialog

These components must remain generic.

---

# API Layer

All HTTP requests should use a centralized Axios instance.

Responsibilities

- Base URL
- Authentication Header
- Refresh Token
- Error Handling
- Request Interceptors
- Response Interceptors

Feature modules should never create their own Axios instance.

---

# TanStack Query

Server state must use TanStack Query.

Use

- Queries
- Mutations
- Cache Invalidation
- Optimistic Updates

Never manually manage server state using useState.

---

# Local State

Use React state only for UI.

Examples

- Modal Open
- Drawer Open
- Selected Item
- Expanded Card
- Search Input

---

# Global State

Use React Context only for

- Authentication
- Theme
- Workspace
- Sidebar State

Avoid unnecessary global state.

---

# Forms

All forms must use

- React Hook Form
- Zod Validation

No uncontrolled forms.

---

# Authentication Flow

```
Login

↓

Access Token

↓

Axios Interceptor

↓

Protected APIs

↓

Refresh Token

↓

New Access Token
```

The frontend should automatically refresh expired access tokens.

---

# Protected Routes

Authenticated pages

- Dashboard
- Workspace
- Projects
- Boards
- Tasks
- Notifications
- Profile
- Settings

Unauthenticated users must be redirected to Login.

---

# Socket.IO

Socket connection starts after login.

User joins

```
user:{id}
```

Current realtime events

- Notifications

Future events may include

- Task Updates
- Comments
- Workspace Activity

---

# File Upload

Attachments use multipart/form-data.

Frontend responsibilities

- Drag & Drop
- File Validation
- Progress Indicator
- Upload Status
- Preview
- Delete

---

# Error Handling

Application should handle

- Network Errors
- Unauthorized
- Forbidden
- Validation Errors
- Not Found
- Server Errors

Display user-friendly messages.

---

# Loading States

Never show blank pages.

Use

- Skeleton
- Spinner
- Loading Placeholder

depending on the UI.

---

# Empty States

Every list should have an empty state.

Examples

- No Tasks
- No Projects
- No Notifications
- No Attachments

---

# Pagination

Paginated APIs should use

- Page
- Limit

Future support

- Infinite Scroll
- Load More

---

# Search

Search inputs should be debounced.

Avoid firing API requests on every key press.

---

# Feature Modules

The frontend contains the following major features.

- Authentication
- Dashboard
- Workspace
- Workspace Members
- Projects
- Project Members
- Boards
- Columns
- Tasks
- Task Assignees
- Comments
- Attachments
- Labels
- Task Labels
- Notifications
- Profile
- Settings

Each feature should remain independent.

---

# Reusable Design Principles

Prefer composition over duplication.

Example

Instead of

```
WorkspaceButton

ProjectButton

TaskButton
```

Create

```
Button
```

and reuse it everywhere.

---

# Performance

Prefer

- Server Components where possible
- Client Components only when necessary

Lazy load

- Dialogs
- Drawers
- Heavy Components

Cache API responses using TanStack Query.

---

# Code Organization

Business Logic

Backend

UI Logic

Frontend

Database

Backend

Authentication

Backend

Validation

Both Frontend and Backend

---

# Naming Conventions

Components

```
PascalCase
```

Hooks

```
useSomething
```

Files

```
kebab-case
```

Types

```
PascalCase
```

Constants

```
UPPER_CASE
```

---

# Frontend Development Order

The frontend should be implemented in this order.

1. Authentication
2. Dashboard Layout
3. Workspace
4. Workspace Members
5. Projects
6. Project Members
7. Boards
8. Columns
9. Kanban Board
10. Tasks
11. Comments
12. Attachments
13. Labels
14. Notifications
15. Profile
16. Settings
17. Socket Integration
18. Final UI Polish

---

# Guiding Principles

- Keep components small.
- Reuse existing components.
- Keep feature modules isolated.
- Do not duplicate logic.
- Keep UI responsive.
- Follow the design system.
- Prefer readability over clever code.
- Build production-ready code.
- Maintain consistency across the application.