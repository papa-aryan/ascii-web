# ASCII Web - Supabase + Vercel Migration

This project has been migrated from Express.js + SQLite to **Supabase + Vercel** for better scalability and deployment.

## 🚀 Quick Setup

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to **SQL Editor**
3. Create the posts table:

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'blog' CHECK (type IN ('blog', 'journal')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your needs)
CREATE POLICY "Enable all operations for all users" ON posts
FOR ALL USING (true);
```

4. Get your **Project URL** and **Anon Key** from Settings > API

### 2. Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Local Development

```bash
npm run dev
```

This will start Vercel's development server with API routes.

## 📦 Deployment to Vercel

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Go to Project Settings > Environment Variables
# Add SUPABASE_URL and SUPABASE_ANON_KEY
```

### 2. Custom Domain

In your Vercel dashboard:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

## 🗃️ Data Migration

If you have existing SQLite data, you can export it and import to Supabase:

1. **Export from SQLite** (if you have existing data):
```bash
# First, get your data from the old database
node manage-content.js list journal
```

2. **Import to Supabase**:
   - Use the Supabase dashboard to manually insert data
   - Or create a migration script to bulk import

## 🛠️ Architecture Changes

### Before (Express + SQLite)
- ❌ `server.js` - Express server
- ❌ `database/database.js` - SQLite implementation
- ❌ Local file-based database

### After (Vercel + Supabase)
- ✅ `api/` folder - Serverless API routes
- ✅ `database/supabase-database.js` - Supabase implementation
- ✅ `lib/content-publisher.js` - Refactored publisher
- ✅ Cloud PostgreSQL database

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/drafts` | GET | Get drafts (with optional `?type=blog\|journal`) |
| `/api/drafts` | POST | Save/update draft |
| `/api/drafts/[id]` | DELETE | Delete draft |
| `/api/publish` | POST | Publish content |
| `/api/journals` | GET | Get all published journals |
| `/api/journals/[id]` | GET | Get specific journal |
| `/api/journals/[id]` | DELETE | Delete journal |

## 🔧 Content Management

Use the updated management script:

```bash
# List all published journals
node manage-content.js list journal

# Delete a specific journal
node manage-content.js delete journal 12
```

## 🔒 Security Notes

- Database credentials are environment variables
- Supabase provides built-in authentication (ready for future auth implementation)
- Row Level Security can be configured for additional protection

## 📝 What's Next

1. **Authentication**: Implement admin authentication using Supabase Auth
2. **Backup**: Supabase provides automatic backups
3. **Monitoring**: Use Vercel Analytics and Supabase monitoring

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables**: Make sure `.env` file exists and has correct values
2. **Database Connection**: Verify Supabase URL and key in your dashboard
3. **API Routes**: Check Vercel functions logs in dashboard

### Logs

- **Local development**: Check terminal output
- **Production**: Check Vercel dashboard > Functions tab 