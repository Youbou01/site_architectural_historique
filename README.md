# Site Architectural Historique

A web application for discovering and managing Tunisian historical and cultural heritage sites and monuments.

The project has two main parts:

- **Front Office** — public interface for browsing heritage sites and monuments.
- **Back Office** — administrator interface for managing sites, monuments, comments, and administrators.

## Features

### Front Office

- Browse heritage sites (`/patrimoines`)
- Browse monuments
- View detailed information about heritage sites and monuments
- View image galleries
- Manage favorites
- Submit comments and optional ratings
- Comments submitted by visitors require administrator moderation
- Only approved comments are displayed publicly

### Back Office

The administration area is protected by authentication and administrator authorization.

Available features include:

- Dashboard statistics
  - Total sites
  - Total monuments
  - Total comments
  - Average rating
- Create, edit, and delete heritage sites
- Add, edit, and delete monuments belonging to a site
- Moderate comments
  - Approve pending comments
  - Reject pending comments
  - Delete comments
- Manage administrators
- Change administrator password
- Light/dark interface support

## Technology Stack

| Technology | Purpose |
|---|---|
| Angular | Frontend framework |
| TypeScript | Application language |
| Bootstrap / Bootstrap Icons | UI and icons |
| RxJS | Asynchronous operations |
| JSON Server | Local REST API |
| JSON | Local database |
| HTML / CSS | Structure and styling |

The project uses Angular standalone components and modern Angular APIs.

## Project Structure

```text
src/
├── app/
│   ├── back/
│   │   └── admin/
│   │       ├── pages/
│   │       │   ├── dashboard/
│   │       │   ├── site-crud/
│   │       │   ├── site-edit/
│   │       │   ├── comments-moderation/
│   │       │   ├── user-management/
│   │       │   ├── login/
│   │       │   └── change-password/
│   │       └── admin-layout/
│   │
│   ├── front/
│   │   └── components/
│   │       ├── patrimoine-list/
│   │       ├── patrimoine-detail/
│   │       ├── monument-list/
│   │       ├── monument-detail/
│   │       ├── favorites/
│   │       └── footer/
│   │
│   ├── models/
│   ├── services/
│   ├── core/
│   │   └── guards/
│   └── database/
│       └── db.json
│
└── public/
    └── images/
```

## Requirements

Install:

- Node.js
- npm

Check your versions:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd site_architectural_historique
```

Install dependencies:

```bash
npm install
```

## Running the Project

The project requires **two development servers**:

1. JSON Server — local REST API
2. Angular — web application

### Terminal 1 — Start JSON Server

```bash
npm run api
```

The API runs on:

```text
http://localhost:3000
```

The main endpoint is:

```text
http://localhost:3000/patrimoines
```

You should be able to open that URL directly in your browser and see the heritage-site data.

### Terminal 2 — Start Angular

```bash
npm start
```

Angular normally runs on:

```text
http://localhost:4200
```

Open that address in your browser.

### Correct Startup Order

```text
Terminal 1
npm run api
        ↓
JSON Server :3000

Terminal 2
npm start
        ↓
Angular :4200
```

**Do not run only `npm start`**, because the application depends on JSON Server for its local API.

## Available npm Commands

```bash
npm start
```

Starts the Angular development server.

```bash
npm run api
```

Starts JSON Server using:

```text
src/app/database/db.json
```

on port `3000`.

```bash
npm run build
```

Builds the Angular application.

```bash
npm test
```

Runs the Angular tests.

## Main Routes

### Public Routes

| Route | Description |
|---|---|
| `/patrimoines` | Heritage-site listing |
| `/monuments` | Monument listing |
| `/patrimoines/:patrimoineId` | Heritage-site details |
| `/patrimoines/:patrimoineId/monuments/:monumentId` | Monument details |
| `/favoris` | Favorites |
| `/login` | Administrator login |

### Administrator Routes

The administration section is protected by authentication and administrator guards.

| Route | Description |
|---|---|
| `/admin/dashboard` | Dashboard |
| `/admin/site-crud` | Site management |
| `/admin/site-edit` | Create a site |
| `/admin/site-edit/:id` | Edit a site |
| `/admin/comments-moderation` | Comment moderation |
| `/admin/change-password` | Change administrator password |

## Administrator Login

Administrator accounts are stored in:

```text
src/app/database/db.json
```

under the `admins` collection.

For local development, use the administrator credentials provided in the project's `db.json`.

> These development credentials must not be used for a real production application.

## Data and Persistence

The project uses JSON Server as a lightweight local backend.

The database file is:

```text
src/app/database/db.json
```

It contains collections such as:

```json
{
  "patrimoines": [],
  "admins": []
}
```

Changes made through the application are persisted by JSON Server.

For example, patrimoine updates use endpoints such as:

```text
http://localhost:3000/patrimoines/{id}
```

Because JSON Server writes changes back to `db.json`, the file can change while testing the application.

## Comment Moderation

Comments follow a moderation workflow.

### 1. Visitor submits a comment

A visitor submits a comment from a site or monument detail page.

The comment is initially pending.

### 2. Administrator reviews it

The administrator opens:

```text
/admin/comments-moderation
```

Pending comments can be:

- Approved
- Rejected

### 3. Public visibility

Only approved comments are displayed publicly.

Rejected comments are hidden from the public interface.

## Site and Monument Management

Administrators can manage heritage content from the back office.

### Sites

A site can be:

- Created
- Edited
- Deleted

### Monuments

Each site can contain multiple monuments.

Administrators can:

- Open monument management for a site
- Add a monument
- Edit a monument
- Delete a monument

The site and monument forms are displayed in modals. Long forms can be vertically scrolled so that fields near the bottom remain accessible.

## Images

Local images are stored under:

```text
public/images/
```

They are referenced by paths such as:

```text
/images/example.jpg
```

When adding or changing image references, make sure the referenced file exists in `public/images/`.

Pay attention to the exact filename and extension, including capitalization.

## Troubleshooting

### Data or cards do not appear

Check that JSON Server is running:

```text
http://localhost:3000/patrimoines
```

If it does not respond, run:

```bash
npm run api
```

Then restart Angular if necessary:

```bash
npm start
```

### API requests fail

Make sure:

- JSON Server is running on port `3000`
- Angular is running on port `4200`
- `src/app/database/db.json` exists

### Images do not appear

Check that:

1. The image exists in `public/images/`.
2. The filename in `db.json` is correct.
3. The extension has the correct capitalization.
4. The image can be opened directly.

For example:

```text
http://localhost:4200/images/<image-name>
```

### Admin pages are inaccessible

Log in through:

```text
http://localhost:4200/login
```

The `/admin` section is protected by authentication and administrator guards.

### Changes are not saved

Make sure JSON Server is running and that:

```text
http://localhost:3000/patrimoines
```

is accessible.

Also check the browser console and JSON Server terminal for errors.

## Development Workflow

A normal development session is:

```bash
# Terminal 1
npm run api

# Terminal 2
npm start
```

Then open:

```text
http://localhost:4200
```

For administration:

```text
http://localhost:4200/login
```

Angular automatically recompiles the application when source files are changed.

## Testing Checklist

### Public Interface

- [ ] Heritage sites load
- [ ] Monument list loads
- [ ] Site details load
- [ ] Monument details load
- [ ] Images display correctly
- [ ] Favorites work
- [ ] Comment submission works
- [ ] Only approved comments are publicly visible

### Administration

- [ ] Administrator login works
- [ ] Dashboard statistics load
- [ ] Sites can be created
- [ ] Sites can be edited
- [ ] Sites can be deleted
- [ ] Monuments can be created
- [ ] Monuments can be edited
- [ ] Monuments can be deleted
- [ ] Long forms can be scrolled
- [ ] Comments can be approved
- [ ] Comments can be rejected
- [ ] Comments can be deleted
- [ ] Administrator management works

### API

- [ ] JSON Server runs on port `3000`
- [ ] `/patrimoines` returns data
- [ ] Changes are persisted to `db.json`

## Production Note

JSON Server is intended only as a **local development backend**.

For production, it should be replaced with a real backend and database with proper:

- Authentication
- Authorization
- Input validation
- Secure password handling
- Database management

## Quick Start

The shortest way to run the project is:

```bash
npm install
```

Then open **two terminals**.

**Terminal 1:**

```bash
npm run api
```

**Terminal 2:**

```bash
npm start
```

Finally open:

```text
http://localhost:4200
```
