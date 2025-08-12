# Trendly.ai

AI-powered social media content generator that uses current TikTok trends to create engaging content ideas, captions, and hashtags. Perfect for social media managers, freelance creators, influencers, and personal brand builders.

![Trendly.ai Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Trendly.ai+Dashboard)

## 🚀 Features

- **AI Content Generation**: Generate viral content ideas, captions, and hashtags using OpenAI
- **TikTok Trend Integration**: Incorporate current trending patterns and formats
- **User Authentication**: Secure auth with Clerk supporting Google and Apple OAuth
- **Subscription Management**: Free and Premium tiers with Stripe integration
- **Usage Tracking**: Daily generation limits with automatic reset
- **Copy-to-Clipboard**: Easy content copying and sharing
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Updates**: Dynamic usage tracking and content generation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety

### Backend
- **Next.js API Routes** - Serverless functions
- **Clerk** - Authentication and user management
- **Supabase** - PostgreSQL database with RLS
- **Stripe** - Payment processing and subscriptions
- **OpenAI API** - AI content generation

### Infrastructure
- **Vercel** - Hosting and deployment
- **Vercel Cron** - Daily usage reset
- **Webhooks** - Stripe payment events

## 📋 Prerequisites

- Node.js 18+ and npm
- Clerk account for authentication
- Supabase account for database
- Stripe account for payments
- OpenAI API key
- Vercel account for deployment

## 🏗️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd trendly-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in all required environment variables (see `.env.local` for complete list).

4. **Set up the database:**
   - Create a Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Configure Row Level Security policies

5. **Configure authentication:**
   - Set up Clerk application
   - Configure Google and Apple OAuth providers
   - Add redirect URLs

6. **Set up payments:**
   - Create Stripe products and pricing
   - Configure webhook endpoints
   - Set up subscription management

7. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Tables

1. **users**
   - `id` (UUID, Primary Key)
   - `clerk_user_id` (Text, Unique)
   - `email` (Text)
   - `subscription_tier` (Text: 'free' | 'premium')
   - `created_at` (Timestamp)

2. **usage**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key)
   - `daily_generations` (Integer)
   - `last_reset_date` (Date)
   - `created_at` / `updated_at` (Timestamps)

3. **trend_data**
   - `trend_id` (UUID, Primary Key)
   - `platform` (Text, default: 'tiktok')
   - `title` (Text)
   - `description` (Text)
   - `date_added` (Timestamp)

## 🔐 Authentication Flow

1. User signs up/in via Clerk (email, Google, or Apple)
2. On first login, user record is created in Supabase
3. JWT token is used for API authentication
4. User subscription status stored in both Clerk metadata and Supabase

## 💳 Subscription Flow

### Free Tier
- 5 generations per day
- All content types (ideas, captions, hashtags)
- TikTok trends integration
- Watermark on generated content

### Premium Tier ($19/month)
- Unlimited generations
- No watermark
- Priority support
- Early access to new features

### Upgrade Process
1. User clicks "Upgrade to Premium"
2. Stripe Checkout session created
3. User completes payment
4. Webhook updates user to premium tier
5. Immediate access to premium features

## 🤖 Content Generation

### API Endpoint: `/api/generate`

**Request:**
```json
{
  "topic": "healthy breakfast",
  "types": ["ideas", "captions", "hashtags"],
  "trends_enabled": true
}
```

**Response:**
```json
{
  "ideas": ["5 content ideas..."],
  "captions": ["5 engaging captions..."],
  "hashtags": ["20-30 strategic hashtags..."],
  "remainingGenerations": 4
}
```

### Generation Process
1. Validate user permissions and usage limits
2. Fetch trending data if enabled
3. Build AI prompt with topic and trends
4. Call OpenAI API for content generation
5. Apply watermark for free users
6. Update usage counter
7. Return generated content

## 📱 Mobile Responsiveness

- **Mobile-first design** with Tailwind CSS
- **Responsive breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** buttons and interactions
- **Optimized layouts** for all screen sizes
- **Fast loading** with Next.js optimization

## 🔄 Daily Reset Cron Job

Automatically resets daily generation counts at midnight UTC:

### Vercel Cron (Recommended)
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

### Manual Reset
```bash
curl -X POST https://yourdomain.com/api/cron/reset-daily-usage \
  -H "Authorization: Bearer your_cron_secret"
```

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Configure webhooks:**
   - Stripe: `https://yourdomain.vercel.app/api/webhooks/stripe`

4. **Test the deployment:**
   - User registration and authentication
   - Content generation
   - Subscription upgrade
   - Daily reset functionality

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- API endpoints
- Authentication flows
- Payment processing
- Content generation
- Database operations

### Manual Testing Checklist
- [ ] User can sign up and sign in
- [ ] Content generation works for all types
- [ ] Usage limits are enforced
- [ ] Subscription upgrade flow works
- [ ] Webhooks process correctly
- [ ] Daily reset functions properly
- [ ] Mobile experience is smooth

## 📈 Performance

- **Response Time**: Target <4 seconds per generation
- **Uptime**: 99% availability target
- **Mobile Performance**: Lighthouse score 90+
- **Database**: Optimized queries with indexing
- **CDN**: Static assets served via Vercel Edge

## 🔍 Monitoring

### KPIs
- Daily Active Users (DAU)
- Free-to-premium conversion rate
- Content generation success rate
- Average response time
- User retention (Week 1)

### Tools
- Vercel Analytics for performance
- Supabase Dashboard for database metrics
- Stripe Dashboard for payment analytics
- Clerk Dashboard for auth analytics

## 🛡️ Security

- **Authentication**: JWT tokens with Clerk
- **Database**: Row Level Security (RLS) policies
- **API**: Rate limiting and input validation
- **Payments**: PCI compliant via Stripe
- **Environment**: Secure secret management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check the deployment guide
- **Issues**: Submit GitHub issues
- **Email**: support@trendly.ai

## 🗺️ Roadmap

- [ ] Instagram and YouTube content support
- [ ] Content scheduling and posting
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] AI-powered trend prediction
- [ ] Content performance tracking
- [ ] Dark mode support
- [ ] Multi-language support

---

Built with ❤️ using Next.js, Tailwind CSS, and modern web technologies.

