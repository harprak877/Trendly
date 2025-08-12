# Trendly.ai Deployment Guide

## Environment Variables

Before deploying, set up all required environment variables:

### Clerk Authentication
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Set up Google and Apple OAuth providers
3. Get your API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Supabase Database
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql`
3. Get your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Stripe Payments
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a Premium subscription product with monthly pricing
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Get your credentials:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID`

### OpenAI API
1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Set `OPENAI_API_KEY`

### App Configuration
- `NEXT_PUBLIC_APP_URL`: Your production domain
- `CRON_SECRET`: Generate a secure random string for cron job authentication

## Deployment on Vercel

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all the environment variables listed above

3. **Configure Webhooks:**
   - Stripe webhook URL: `https://yourdomain.vercel.app/api/webhooks/stripe`
   - Clerk webhook URL (optional): Configure if needed for additional user events

## Daily Usage Reset Cron Job

### Option 1: Vercel Cron (Recommended)
1. Create `vercel.json` in your project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reset-daily-usage",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```

2. Add the cron secret to your environment variables:
   ```
   CRON_SECRET=your_secure_random_string_here
   ```

### Option 2: External Cron Service
Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. **URL:** `https://yourdomain.vercel.app/api/cron/reset-daily-usage`
2. **Method:** POST
3. **Headers:** 
   ```
   Authorization: Bearer your_cron_secret_here
   Content-Type: application/json
   ```
4. **Schedule:** Daily at 00:00 UTC (`0 0 * * *`)

### Option 3: Supabase Cron (Alternative)
1. Enable the pg_cron extension in Supabase
2. Create a cron job in Supabase:
   ```sql
   SELECT cron.schedule('reset-daily-usage', '0 0 * * *', 'SELECT reset_daily_generations();');
   ```

## Database Setup

1. **Run the Schema:**
   - Copy the contents of `supabase/schema.sql`
   - Run it in your Supabase SQL editor

2. **Verify Tables:**
   - `users`
   - `usage` 
   - `trend_data`

3. **Check RLS Policies:**
   - Ensure Row Level Security is enabled
   - Verify policies are created correctly

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database schema is deployed
- [ ] Stripe webhook is configured and receiving events
- [ ] Clerk authentication is working
- [ ] OpenAI API is responding
- [ ] Daily reset cron job is scheduled
- [ ] Test user registration and content generation
- [ ] Test subscription upgrade flow
- [ ] Verify daily limits reset at midnight UTC

## Testing

### Local Development
```bash
npm run dev
```

### Test Webhook Endpoints
Use tools like ngrok for local webhook testing:
```bash
npx ngrok http 3000
```

### Test Cron Job
```bash
curl -X POST https://yourdomain.vercel.app/api/cron/reset-daily-usage \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

## Monitoring

1. **Vercel Dashboard:** Monitor deployments and function logs
2. **Supabase Dashboard:** Monitor database performance and logs
3. **Stripe Dashboard:** Monitor payment events and webhook deliveries
4. **Clerk Dashboard:** Monitor authentication events

## Support

For issues with deployment:
1. Check Vercel function logs
2. Check Supabase logs
3. Verify all environment variables are set correctly
4. Test API endpoints individually