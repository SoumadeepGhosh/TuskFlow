# DESIGN_SYSTEM.md

# TaskFlow Design System

## Design Philosophy

TaskFlow should look like a modern premium SaaS product.

The UI should feel

- Clean
- Elegant
- Minimal
- Professional
- Fast
- Spacious
- Premium

Avoid colorful dashboards.

Use soft colors.

Use depth instead of heavy borders.

Avoid visual clutter.

The interface should feel similar to modern products like:

- Linear
- Notion
- Vercel
- Arc Browser
- Stripe Dashboard
- GitHub
- Raycast
- Framer
- Dropbox Dash

Never copy them directly.

---

# Design Keywords

- Soft UI
- Minimal
- Airy
- Premium
- Modern
- Clean
- High readability
- Balanced whitespace
- Smooth animations
- Rounded corners
- Glass effects only where appropriate

---

# Color Palette

## Primary

Indigo

```
#5B5CEB
```

Hover

```
#4A4BD6
```

Light

```
#EEF0FF
```

---

## Success

```
#22C55E
```

---

## Warning

```
#F59E0B
```

---

## Error

```
#EF4444
```

---

## Information

```
#3B82F6
```

---

# Neutral Colors

Background

```
#FAFBFC
```

Secondary Background

```
#F5F7FA
```

Card

```
#FFFFFF
```

Border

```
#E9EDF3
```

Text Primary

```
#111827
```

Text Secondary

```
#6B7280
```

Placeholder

```
#9CA3AF
```

---

# Radius

Cards

```
20px
```

Buttons

```
14px
```

Inputs

```
14px
```

Dialogs

```
24px
```

Dropdown

```
14px
```

Badges

```
999px
```

---

# Shadows

Use soft shadows only.

Never use dark shadows.

Example

```
0 10px 35px rgba(15,23,42,.08)
```

Hover

```
0 16px 40px rgba(15,23,42,.12)
```

---

# Typography

Primary Font

```
Inter
```

Fallback

```
System UI
```

---

Heading 1

48px

Bold

---

Heading 2

36px

Semi Bold

---

Heading 3

28px

Semi Bold

---

Heading 4

22px

Medium

---

Body

16px

Regular

---

Small Text

14px

Regular

---

Caption

12px

Medium

---

# Buttons

Primary

Filled

Indigo

White text

---

Secondary

White

Border

Dark text

---

Danger

Soft Red

---

Ghost

Transparent

---

Icon Button

Rounded

Hover background only

---

# Inputs

Rounded

Soft border

Focus ring

Placeholder

Left icons where useful

Support helper text

Support validation messages

---

# Cards

White background

Rounded

Soft shadow

No heavy border

24px padding

Hover elevation

---

# Sidebar

Width

280px

Background

White

Collapsed

80px

Menu Item

Rounded

Soft hover

Active item

Indigo background

White icon

White text

---

# Header

Height

72px

Contains

- Breadcrumb
- Search
- Notifications
- User Avatar

Sticky

White background

Bottom border only

---

# Tables

Rounded container

Sticky header

Alternating hover

Compact spacing

Pagination footer

Search bar

Filters

---

# Kanban Board

Soft background

Columns separated

Cards elevated

Rounded cards

Drag animation

Smooth transitions

Priority indicators

Labels

Assignees

Due dates

Attachment count

Comment count

---

# Status Colors

Todo

Gray

In Progress

Blue

Review

Orange

Done

Green

---

# Priority Colors

Low

Gray

Medium

Blue

High

Orange

Urgent

Red

---

# Avatars

Circular

Support initials

Online indicator

Hover tooltip

---

# Badges

Rounded pill

Small

Minimal

Soft colors

---

# Dialog

Centered

Blur backdrop

Rounded corners

Large padding

Smooth animation

---

# Drawer

Slide from right

Rounded left corners

Blur backdrop

Scrollable

---

# Toasts

Top Right

Minimal

Auto close

Success

Warning

Error

Info

---

# Empty States

Illustration

Short title

Helpful description

Primary button

Secondary button if needed

---

# Loading

Skeletons

Shimmer animation

Avoid spinners for large pages

---

# Icons

Use

Lucide React

Only

Examples

Workspace

FolderKanban

Project

Briefcase

Board

LayoutGrid

Task

SquareCheckBig

Comment

MessageCircle

Attachment

Paperclip

Notification

Bell

Settings

Settings2

User

CircleUser

Search

Search

Calendar

CalendarDays

Label

Tag

---

# Animations

Use Framer Motion

Duration

200ms

Hover

Scale

1.02

Cards

Fade + Slide

Dialogs

Scale + Fade

Sidebar

Slide

Page

Fade

Never use flashy animations.

---

# Spacing

Section

40px

Card

24px

Grid Gap

24px

Input Gap

16px

Button Gap

12px

---

# Responsive

Desktop

1440+

Laptop

1280

Tablet

768

Mobile

390

Sidebar collapses automatically.

Tables become cards on mobile.

Dialogs become full screen on mobile.

---

# Accessibility

Minimum touch target

44px

Visible focus ring

Keyboard navigation

Proper contrast

Screen reader labels

---

# Design Principles

Always prefer

Less UI

More whitespace

Soft colors

Readable typography

Consistent spacing

Reusable components

Never use

Heavy gradients

Dark shadows

Oversaturated colors

Too many borders

Too many cards

Nested cards

Visual clutter

Every page should feel calm, premium, modern, and easy to use.