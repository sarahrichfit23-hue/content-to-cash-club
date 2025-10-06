# Production Deployment Instructions

## Setting Environment Variables in DeployPad

To deploy this application to production, you need to set the following environment variables in your DeployPad dashboard:

### Required Environment Variables

```
VITE_SUPABASE_URL=https://lnxaedibxzwhlduylwls.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueGFlZGlieHp3aGxkdXlsd2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODk4MTYsImV4cCI6MjA2MTg2NTgxNn0.1HdQBDPECQfLTqTSPcTOFWZCe0KQJWVvPPmjpFuDEQg
```

### Steps to Deploy:

1. **Access DeployPad Dashboard**
   - Go to your Famous.ai project dashboard
   - Navigate to the DeployPad section

2. **Set Environment Variables**
   - Find the "Environment Variables" or "Settings" section
   - Add both variables listed above
   - Make sure to set them for the **Production** environment

3. **Trigger Deployment**
   - After setting the variables, trigger a fresh build/deploy
   - The build process will use these environment variables

4. **Verify Deployment**
   - Once deployed, test the login functionality
   - Check browser console for any Supabase connection errors

### Security Notes:
- These environment variables are already in your local .env file
- The .env file is gitignored and won't be committed to version control
- Production and local environments use the same Supabase project
- Never commit the .env file to your repository

### Troubleshooting:
If you see "Supabase configuration missing" errors after deployment:
- Verify the environment variables are set correctly in DeployPad
- Ensure variable names match exactly (including VITE_ prefix)
- Trigger a fresh build after setting variables
- Check DeployPad build logs for any errors
