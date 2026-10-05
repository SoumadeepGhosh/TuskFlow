# DATABASE.md

# TaskFlow Database Documentation

Version: 1.0.0

---

# Overview

TaskFlow uses PostgreSQL as its primary database.

Database access is handled exclusively through Prisma ORM.

Business logic never interacts with PostgreSQL directly.

Repositories are the only layer allowed to use Prisma.

---

# Database Principles

- PostgreSQL is the source of truth.
- Prisma manages all database operations.
- No raw SQL unless absolutely necessary.
- Foreign keys enforce relationships.
- IDs are auto-generated.
- All timestamps are stored in UTC.
- Soft delete is used where applicable.
- Repository layer owns all database queries.

---

# Entity Relationship Overview

Workspace
│
├── Workspace Members
│
└── Projects
      │
      ├── Project Members
      │
      └── Boards
             │
             └── Columns
                    │
                    └── Tasks
                           │
                           ├── Reporter (User)
                           ├── Assignees
                           ├── Labels
                           ├── Comments
                           ├── Attachments
                           └── Notifications

---

# User

Purpose

Stores every registered user.

Responsibilities

- Authentication
- Reporter
- Assignee
- Workspace Member
- Project Member
- Notification Receiver

Main Fields

id

name

email

password

avatarUrl

createdAt

updatedAt

Relations

WorkspaceMember

ProjectMember

TaskAssignee

Task Reporter

Comment

Notification

Attachment

---

# Workspace

Purpose

Top-level organization.

A workspace contains multiple projects.

Main Fields

id

name

description

createdBy

createdAt

updatedAt

Relations

WorkspaceMember

Project

---

# WorkspaceMember

Purpose

Connects users with workspaces.

Relationship

User

↓

WorkspaceMember

↓

Workspace

Fields

workspaceId

userId

role

joinedAt

Composite Key

workspaceId

userId

---

# Project

Purpose

Represents a project inside a workspace.

Examples

Website

Mobile App

Backend API

Main Fields

id

workspaceId

name

description

createdBy

createdAt

updatedAt

Relations

Workspace

ProjectMember

Board

---

# ProjectMember

Purpose

Maps users to projects.

Fields

projectId

userId

role

joinedAt

Composite Key

projectId

userId

---

# Board

Purpose

Kanban board.

Examples

Development

Marketing

HR

Main Fields

id

projectId

name

position

createdAt

Relations

Project

BoardColumn

---

# BoardColumn

Purpose

Kanban column.

Examples

Todo

In Progress

Review

Done

Main Fields

id

boardId

title

position

createdAt

Relations

Board

Task

---

# Task

Purpose

Represents a work item.

Main Fields

id

columnId

projectId

reporterId

title

description

priority

dueDate

position

createdAt

updatedAt

Relations

BoardColumn

Project

Reporter

TaskAssignee

TaskLabel

Comment

Attachment

Notification

Business Rules

A task belongs to exactly one column.

A task belongs to exactly one project.

A task can have many assignees.

A task can have many labels.

A task can have many comments.

A task can have many attachments.

---

# TaskAssignee

Purpose

Assign users to tasks.

Relationship

Task

↓

TaskAssignee

↓

User

Fields

taskId

userId

assignedBy

assignedAt

Composite Key

taskId

userId

Business Rules

One user cannot be assigned twice to the same task.

---

# Label

Purpose

Stores reusable labels.

Examples

Bug

Feature

Urgent

Backend

Frontend

Main Fields

id

name

color

projectId

createdAt

Relations

TaskLabel

Project

---

# TaskLabel

Purpose

Many-to-many relationship between Task and Label.

Fields

taskId

labelId

Composite Key

taskId

labelId

---

# Comment

Purpose

Stores comments on tasks.

Fields

id

taskId

userId

content

createdAt

updatedAt

Relations

Task

User

Business Rules

Only the author may edit or delete their comment.

---

# Attachment

Purpose

Stores uploaded files.

Examples

Images

PDF

Documents

Screenshots

Main Fields

id

taskId

uploadedBy

fileName

originalName

mimeType

size

storageKey

createdAt

Relations

Task

User

Business Rules

Actual file is stored in object storage.

Database stores only metadata.

---

# Notification

Purpose

Stores user notifications.

Examples

Task Assigned

Future

Task Updated

Comment Added

Due Reminder

Main Fields

id

recipientId

senderId

type

title

message

entityType

entityId

isRead

readAt

gesgwvelkjjnvjndcnhiowyuyseyrewyfceyriyefyeryeyrhieyc

createdAt

Relations

Recipient

Sender

Business Rules

Every notification belongs to one recipient.

Notifications remain stored after delivery.

Socket delivery does not delete notifications.

Email delivery does not delete notifications.

---

# Notification Types

Current

TASK_ASSIGNED

Future

TASK_UPDATED

TASK_COMPLETED

COMMENT_ADDED

TASK_DUE

PROJECT_INVITE

WORKSPACE_INVITE

---

# Relationship Summary

Workspace

1 → N

Project

Project

1 → N

Board

Board

1 → N

BoardColumn

BoardColumn

1 → N

Task

Task

N ↔ N

User

(using TaskAssignee)

Task

N ↔ N

Label

(using TaskLabel)

Task

1 → N

Comment

Task

1 → N

Attachment

User

1 → N

Notification

User

1 → N

Comment

User

1 → N

Attachment

User

N ↔ N

Workspace

(using WorkspaceMember)

User

N ↔ N

Project

(using ProjectMember)

---

# Data Ownership

Workspace

owns

Projects

Projects

own

Boards

Boards

own

Columns

Columns

own

Tasks

Tasks

own

Comments

Attachments

Assignments

Labels

Notifications reference tasks but do not own them.

---

# Cascade Rules

Deleting a Workspace removes:

Projects

Boards

Columns

Tasks

Comments

Attachments

Assignments

Labels

Task Labels

Project Members

Workspace Members

Deleting a Task removes:

Comments

Attachments

Assignments

Task Labels

Notifications may either remain for audit/history or be deleted based on future business requirements.

---

# Index Recommendations

Frequently queried fields should be indexed.

Examples

User.email

Notification.recipientId

Task.projectId

Task.columnId

Task.reporterId

TaskAssignee.userId

TaskAssignee.taskId

Project.workspaceId

Board.projectId

BoardColumn.boardId

---

# Repository Rule

Every database operation must go through the repository layer.

Correct

Controller

↓

Service

↓

Repository

↓

Prisma

Incorrect

Controller

↓

Prisma

Incorrect

Service

↓

Prisma

Repositories are the single source of database access throughout TaskFlow.