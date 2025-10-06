# Supabase Setup Guide

## Step 1: Get Your Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API** in the settings menu
5. You'll see two important values:

### Project URL
```
https://YOUR-PROJECT-ID.supabase.co
```

### API Keys
- **anon/public key** - This is safe to use in your frontend
- **service_role key** - Keep this secret! Don't use in frontend

## Step 2: Create Your .env File

1. In your project root, create a file named `.env` (no extension)
2. Copy the contents from `.env.example`
3. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Step 3: Restart Your Dev Server

After saving your `.env` file:
1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`
3. Your app should now connect to Supabase!

## Troubleshooting

**"Invalid API key" error?**
- Make sure you copied the **anon/public** key, not the service_role key
- Check for extra spaces or missing characters

**Changes not taking effect?**
- Restart your dev server
- Clear browser cache
- Check that your .env file is in the root directory

**Still not working?**
- Verify your Supabase project is active
- Check the browser console for specific error messages
