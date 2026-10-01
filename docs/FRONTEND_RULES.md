# FRONTEND_RULES.md

# TaskFlow Frontend Development Rules

## Purpose

This document defines the coding standards, architecture rules, and best practices for the TaskFlow frontend.

Every feature must follow these rules.

Do not ignore them.

---

# Core Principles

- Simplicity over complexity
- Reusability over duplication
- Readability over clever code
- Consistency over personal preference
- Production-ready code only

---

# Technology Stack

- Next.js 16 App Router
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
- Lucide React
- dnd-kit
- Sonner

Do not introduce additional libraries unless necessary.

---

# TypeScript Rules

Always use strict TypeScript.

Never use

```
any
```

Prefer

```
unknown
```

or proper interfaces.

Always define types.

Example

```
interface Project {
  id: number;
  name: string;
}
```

---

# Component Rules

Keep components small.

One component should have one responsibility.

If a component exceeds approximately 250 lines, consider splitting it.

---

# Component Types

Use

Shared Components

```
components/
```

Feature Components

```
features/project/components/
```

Never place reusable UI inside feature folders.

---

# File Naming

Use

```
kebab-case
```

Examples

```
project-card.tsx

task-table.tsx

create-task-dialog.tsx
```

---

# Component Naming

Always use

```
PascalCase
```

Example

```
ProjectCard

TaskDialog

WorkspaceSwitcher
```

---

# Hooks

Every custom hook begins with

```
use
```

Example

```
useProjects

useTasks

useNotifications
```

Hooks should never render UI.

---

# API Layer

Never call Axios directly inside components.

Incorrect

```
page.tsx

axios.get(...)
```

Correct

```
services/project.service.ts

↓

useProjects()

↓

Component
```

---

# TanStack Query

Use Query for

- GET

Use Mutation for

- POST
- PATCH
- DELETE

Always invalidate affected queries after mutations.

---

# Forms

Every form must use

React Hook Form

+

Zod

Never use uncontrolled forms.

---

# Validation

Frontend validation should match backend DTO validation.

Do not invent validation rules.

---

# State Management

Use

React State

for

- Dialog Open
- Selected Item
- Search Text
- Filters

Use

TanStack Query

for

Server Data

Avoid unnecessary Context.

---

# Folder Ownership

Each feature owns

- components
- hooks
- api
- types
- schemas

Keep feature logic together.

---

# Imports

Order

1. React
2. Next
3. Third Party
4. Components
5. Hooks
6. Services
7. Types
8. Styles

---

# Styling

Only Tailwind CSS.

No inline CSS.

No CSS Modules.

No styled-components.

---

# Icons

Only use

Lucide React

Do not mix icon libraries.

---

# Animations

Use Framer Motion.

Keep animations short.

150–250ms

Avoid excessive motion.

---

# Responsive Design

Every page must support

Desktop

Tablet

Mobile

Never build desktop-only layouts.

---

# Accessibility

Every button

Must have accessible labels.

Every input

Must have labels.

Support keyboard navigation.

---

# Error Handling

Always handle

Loading

Error

Empty

Success

Never leave blank screens.

---

# Loading States

Use

Skeletons

for page loading.

Use

Spinner

only for small actions.

---

# Empty States

Every list page should display

- Illustration
- Title
- Description
- CTA Button

---

# Notifications

Use Sonner.

Success

Error

Warning

Info

Never use browser alerts.

---

# Tables

Support

Pagination

Search

Sorting

Responsive layout

---

# Dialogs

Reuse one dialog component pattern.

Never create multiple dialog styles.

---

# Drawers

Right-side drawer.

Consistent width.

Scrollable content.

---

# API Errors

Display backend messages whenever available.

Do not expose stack traces.

---

# Authentication

Protect private pages.

Redirect unauthenticated users to Login.

Never expose private routes.

---

# Socket.IO

Only initialize socket after successful login.

Disconnect on logout.

---

# Performance

Use

React.memo

only where beneficial.

Lazy load heavy components.

Avoid unnecessary re-renders.

---

# Code Reuse

If similar code exists,

reuse it.

Do not duplicate.

---

# Security

Never store tokens in component state.

Never expose secrets.

Never hardcode URLs.

Use environment variables.

---

# Git Rules

One feature per commit.

Write meaningful commit messages.

Avoid mixing unrelated changes.

---

# Before Creating New Components

Ask yourself

Can an existing component be reused?

If yes,

reuse it.

---

# Before Creating New Hooks

Ask yourself

Can an existing hook be extended?

If yes,

extend it.

---

# General Philosophy

The frontend should feel like one cohesive application.

Every page should look and behave consistently.

Prioritize maintainability, readability, accessibility, and a polished user experience over unnecessary complexity.