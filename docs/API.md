# HackMate REST API Documentation

The HackMate backend exposes a RESTful API versioned under `/api/v1`. All JSON requests and responses use `application/json` formatting. Authenticated requests require the HTTP header:

```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication & Onboarding (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Creates a new user account.
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Marcus Vance",
  "username": "marcus_vance",
  "email": "marcus@hackmate.dev",
  "password": "Password@123",
  "college": "Stanford University",
  "skills": ["Python", "FastAPI", "PyTorch"],
  "primaryRole": "AI/ML",
  "experienceLevel": "Advanced",
  "collaborationMode": "remote"
}
```
- **Response `(201 Created)`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "_id": "60d0fe4f5311236168a109ca",
    "fullName": "Marcus Vance",
    "username": "marcus_vance",
    "email": "marcus@hackmate.dev",
    "role": "user",
    "profileCompleted": true
  }
}
```

### `POST /api/v1/auth/login`
Authenticates a user and returns a signed JWT.
- **Access**: Public
- **Request Body**:
```json
{
  "email": "sophia@hackmate.dev",
  "password": "Password@123"
}
```
- **Response `(200 OK)`**:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": { ... }
}
```

### `GET /api/v1/auth/me`
Retrieves current authenticated user's session profile.
- **Access**: Protected (`Bearer`)
- **Response `(200 OK)`**:
```json
{
  "success": true,
  "user": { ... }
}
```

### `PUT /api/v1/auth/profile`
Updates current user's profile information.
- **Access**: Protected (`Bearer`)
- **Request Body**: Fields to update (e.g., `bio`, `skills`, `collaborationMode`, `lookingForTeam`, `githubUrl`, `portfolioUrl`).

### `POST /api/v1/auth/forgot-password`
Generates a 1-hour password reset token and sends an email.
- **Access**: Public
- **Request Body**: `{ "email": "user@example.com" }`

### `POST /api/v1/auth/reset-password/:token`
Resets user password with token verification.
- **Access**: Public
- **Request Body**: `{ "password": "NewStrongPassword@123" }`

---

## 2. Teammate Discovery & Profiles (`/api/v1/users`)

### `GET /api/v1/users`
Lists teammate discovery candidates with query filters and explainable compatibility scores.
- **Access**: Public / Optional Auth (when authenticated, returns compatibility score relative to current user)
- **Query Parameters**:
  - `search`: Name, username, skill keyword
  - `role`: e.g., `Frontend`, `Backend`, `AI/ML`, `UI/UX`, `Full-Stack`
  - `experienceLevel`: `Beginner`, `Intermediate`, `Advanced`
  - `collaborationMode`: `remote`, `in-person`, `hybrid`
  - `lookingForTeam`: `true` | `false`
  - `page`: default 1
  - `limit`: default 12
- **Response `(200 OK)`**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "fullName": "Sophia Chen",
      "username": "sophia_chen",
      "college": "UC Berkeley",
      "skills": ["React", "TypeScript", "Tailwind CSS"],
      "primaryRole": "Frontend",
      "experienceLevel": "Advanced",
      "compatibility": {
        "score": 88,
        "reasons": [
          "Complementary technical skills (Frontend + Backend)",
          "Shared interest in AI and Web3",
          "Aligned collaboration preference (remote)"
        ]
      }
    }
  ],
  "pagination": { "page": 1, "pages": 2, "total": 15 }
}
```

### `GET /api/v1/users/:username`
Retrieves public profile details and compatibility breakdown.
- **Access**: Public / Optional Auth

---

## 3. Connections & Teammate Requests (`/api/v1/connections`)

### `GET /api/v1/connections`
Lists mutual connections, incoming pending requests, and outgoing sent requests.
- **Access**: Protected (`Bearer`)
- **Response `(200 OK)`**:
```json
{
  "success": true,
  "connections": [ ... ],
  "incomingRequests": [ ... ],
  "sentRequests": [ ... ]
}
```

### `POST /api/v1/connections/request`
Sends a teammate connection request.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "recipientId": "...", "message": "Hi, let's team up!" }`

### `PUT /api/v1/connections/:id/respond`
Accepts or rejects an incoming teammate request.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "status": "accepted" }` or `{ "status": "rejected" }`

### `DELETE /api/v1/connections/:id/cancel`
Withdraws a pending sent connection request.
- **Access**: Protected (`Bearer`)

---

## 4. Hackathons Directory (`/api/v1/hackathons`)

### `GET /api/v1/hackathons`
Searches hackathons with domain, format, and status filters.
- **Access**: Public
- **Query Parameters**: `search`, `format` (`online`, `offline`, `hybrid`), `status` (`upcoming`, `ongoing`, `completed`), `track`

### `GET /api/v1/hackathons/featured`
Returns top 3 featured upcoming hackathons.
- **Access**: Public

### `GET /api/v1/hackathons/:id`
Returns full hackathon information including registered teams and deadline countdowns.
- **Access**: Public

### `POST /api/v1/hackathons`
Creates a hackathon listing.
- **Access**: Admin only

---

## 5. Team Management & Applications (`/api/v1/teams`)

### `GET /api/v1/teams`
Lists recruiting and public hackathon teams.
- **Access**: Public
- **Query Parameters**: `search`, `recruitmentStatus` (`open`, `closed`), `collaborationMode`

### `GET /api/v1/teams/my-teams`
Returns teams where the authenticated user is owner or member.
- **Access**: Protected (`Bearer`)

### `POST /api/v1/teams`
Creates a new team with open positions and desired size.
- **Access**: Protected (`Bearer`)
- **Request Body**:
```json
{
  "name": "Neural Pioneers",
  "description": "Building an autonomous multi-modal agent for accessibility.",
  "hackathonId": "...",
  "problemStatement": "Assistive computing for visually impaired coders.",
  "requiredSkills": ["Python", "PyTorch", "React", "WebSockets"],
  "desiredSize": 4,
  "collaborationMode": "hybrid",
  "openPositions": [
    {
      "role": "UI/UX Designer",
      "requiredSkills": ["Figma", "User Research"],
      "description": "Lead accessible design system",
      "status": "open"
    }
  ]
}
```

### `GET /api/v1/teams/:id`
Returns full team details, members, roles, activity log, and open positions.
- **Access**: Public / Optional Auth

### `POST /api/v1/teams/:id/apply`
Applies to join an open position on a team.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "positionId": "...", "message": "Why I'm a great fit..." }`

### `GET /api/v1/teams/:id/applications`
Lists pending applications for team leader review.
- **Access**: Protected (Team Leader only)

### `PUT /api/v1/teams/applications/:applicationId`
Accepts or rejects an applicant.
- **Access**: Protected (Team Leader only)
- **Request Body**: `{ "status": "accepted" }` or `{ "status": "rejected" }`

### `POST /api/v1/teams/:id/invite`
Invites a connected user directly into a team position.
- **Access**: Protected (Team Leader only)
- **Request Body**: `{ "userId": "...", "role": "Full-Stack Developer", "message": "..." }`

### `POST /api/v1/teams/join-code`
Joins a team instantly via shareable join code.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "inviteCode": "HM-X7K9P2" }`

### `POST /api/v1/teams/:id/leave`
Leaves a team.
- **Access**: Protected (`Bearer`)

### `DELETE /api/v1/teams/:id/members/:memberId`
Removes a member from a team.
- **Access**: Protected (Team Leader only)

---

## 6. Team Workspace & Kanban Tasks (`/api/v1/tasks`)

### `GET /api/v1/tasks/team/:teamId`
Retrieves all Kanban tasks for a team (To Do, In Progress, Done).
- **Access**: Protected (Team members only)

### `POST /api/v1/tasks/team/:teamId`
Creates a new task in the team's Kanban board.
- **Access**: Protected (Team members only)
- **Request Body**:
```json
{
  "title": "Build WebSocket message handler",
  "description": "Handle typing indicators and delivery acknowledgments",
  "status": "in-progress",
  "priority": "high",
  "assignee": "60d0fe4f5311236168a109ca",
  "dueDate": "2026-11-15T00:00:00.000Z"
}
```

### `PUT /api/v1/tasks/:id`
Updates task status (drag-and-drop), priority, or assignee.
- **Access**: Protected (Team members only)

### `DELETE /api/v1/tasks/:id`
Deletes a task.
- **Access**: Protected (Task creator or Team leader)

---

## 7. Real-Time Chat & Direct Messaging (`/api/v1/chat`)

### `GET /api/v1/chat/conversations`
Retrieves all active conversations (direct 1-on-1 and team channels) with latest message preview and unread counters.
- **Access**: Protected (`Bearer`)

### `POST /api/v1/chat/conversations`
Initiates or retrieves a 1-on-1 direct conversation with a teammate.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "participantId": "..." }`

### `GET /api/v1/chat/conversations/:id/messages`
Retrieves paginated message history for a conversation.
- **Access**: Protected (Conversation participants only)
- **Query Parameters**: `page`, `limit` (default 50)

### `POST /api/v1/chat/conversations/:id/messages`
Sends a message to a conversation (also persisted to DB and broadcasted via Socket.IO).
- **Access**: Protected (Conversation participants only)
- **Request Body**: `{ "content": "Let's push the repo!", "attachments": [] }`

### `POST /api/v1/chat/messages/:id/react`
Adds an emoji reaction to a message.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "emoji": "🚀" }`

---

## 8. Notifications (`/api/v1/notifications`)

### `GET /api/v1/notifications`
Retrieves recent notifications.
- **Access**: Protected (`Bearer`)

### `PUT /api/v1/notifications/:id/read`
Marks a specific notification as read.
- **Access**: Protected (`Bearer`)

### `PUT /api/v1/notifications/mark-all-read`
Marks all user notifications as read.
- **Access**: Protected (`Bearer`)

---

## 9. Bookmarks (`/api/v1/bookmarks`)

### `GET /api/v1/bookmarks`
Lists all bookmarked teammates, teams, and hackathons.
- **Access**: Protected (`Bearer`)

### `POST /api/v1/bookmarks/toggle`
Toggles bookmark state for an item.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "itemType": "user" | "team" | "hackathon", "itemId": "..." }`

---

## 10. Moderation & Admin (`/api/v1/reports`, `/api/v1/admin`)

### `POST /api/v1/reports`
Submits a user or team report for safety violation.
- **Access**: Protected (`Bearer`)
- **Request Body**: `{ "reportedUser": "...", "reason": "harassment", "description": "..." }`

### `GET /api/v1/admin/stats`
Returns system metrics: total users, teams, hackathons, reports, and 7-day registration trends.
- **Access**: Admin only

### `GET /api/v1/admin/users`
Lists user accounts with role, ban, and verification statuses.
- **Access**: Admin only

### `PUT /api/v1/admin/users/:id/status`
Suspends, bans, or restores a user account.
- **Access**: Admin only

### `GET /api/v1/admin/reports`
Lists reported users and teams for investigation.
- **Access**: Admin only

### `PUT /api/v1/admin/reports/:id/resolve`
Resolves or dismisses a moderation report.
- **Access**: Admin only

### `GET /api/v1/admin/logs`
Retrieves system audit logs.
- **Access**: Admin only

---

## 11. File Uploads (`/api/v1/uploads`)

### `POST /api/v1/uploads`
Uploads profile avatars or team logos with size (5MB max) and MIME validation (`image/jpeg`, `image/png`, `image/webp`).
- **Access**: Protected (`Bearer`)
- **Body**: `multipart/form-data` with `file` field.
