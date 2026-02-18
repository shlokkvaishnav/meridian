# Database Migration: Teams Feature

## Overview
This migration adds Team support to the Meridian Analytics platform, allowing users to group contributors into teams for better filtering and analytics.

## Migration Steps

1. **Run Prisma Migration:**
   ```bash
   npx prisma migrate dev --name add_teams
   ```

2. **Verify Migration:**
   ```bash
   npx prisma studio
   ```
   Check that the `Team` table exists with the following fields:
   - id (String, primary key)
   - name (String)
   - description (String, nullable)
   - color (String, nullable)
   - ownerId (String, foreign key to AppSettings)
   - memberLogins (JSON, array of GitHub logins)
   - createdAt, updatedAt (DateTime)

3. **Enable Supabase Realtime (Optional but Recommended):**
   
   In your Supabase dashboard:
   1. Go to Database → Replication
   2. Enable replication for:
      - `PullRequest` table
      - `Review` table
      - `Repository` table
   3. This enables real-time dashboard updates via webhooks

## Usage

### Creating Teams via API

```bash
# Create a team
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Team",
    "description": "Frontend developers",
    "color": "#8b5cf6",
    "memberLogins": ["alice", "bob", "charlie"]
  }'

# Get all teams
curl http://localhost:3000/api/teams

# Update a team
curl -X PATCH "http://localhost:3000/api/teams?id=TEAM_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "memberLogins": ["alice", "bob", "charlie", "diana"]
  }'

# Delete a team
curl -X DELETE "http://localhost:3000/api/teams?id=TEAM_ID"
```

### Setting Up GitHub Webhooks

1. Go to your GitHub repository → Settings → Webhooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL:** `https://your-domain.com/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Set `GITHUB_WEBHOOK_SECRET` in your `.env` file
   - **Events:** Select "Pull requests" and "Pushes"
4. Save webhook

Once configured, your dashboard will update in real-time when PRs are created, reviewed, or merged!

## Features Added

1. **Team Filter:** Filter dashboard metrics by team
2. **Team Management API:** Full CRUD operations for teams
3. **Real-time Updates:** Webhook-based updates with Supabase real-time subscriptions
4. **Enhanced Webhook Handler:** Handles PR and review events for instant updates

## Notes

- Teams are scoped to individual users (ownerId)
- Team members are stored as JSON array of GitHub logins
- Real-time updates require Supabase Realtime to be enabled
- Webhooks work independently of Supabase real-time
