-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_generations INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trend data table (mock data for MVP)
CREATE TABLE IF NOT EXISTS trend_data (
    trend_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT DEFAULT 'tiktok',
    title TEXT NOT NULL,
    description TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policies for usage table
CREATE POLICY "Users can view own usage" ON usage
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

CREATE POLICY "Users can update own usage" ON usage
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- RLS Policies for trend_data (public read access for all authenticated users)
CREATE POLICY "Authenticated users can view trends" ON trend_data
    FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for usage table
CREATE TRIGGER update_usage_updated_at 
    BEFORE UPDATE ON usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily generations (for cron job)
CREATE OR REPLACE FUNCTION reset_daily_generations()
RETURNS void AS $$
BEGIN
    UPDATE usage 
    SET daily_generations = 0, last_reset_date = CURRENT_DATE 
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Insert some mock trend data
INSERT INTO trend_data (title, description) VALUES
('Dancing Trend', 'Latest dance moves trending on TikTok with upbeat music'),
('Recipe Hack', 'Quick cooking hacks that save time and look amazing'),
('Fashion Transition', 'Quick outfit changes and style transformations'),
('Pet Content', 'Cute pets doing funny or impressive tricks'),
('Before & After', 'Transformation content showing dramatic changes'),
('Day in My Life', 'Authentic daily routine content with personal touches'),
('Workout Challenge', 'Quick fitness routines and exercise challenges'),
('Study Tips', 'Productive study methods and organization hacks'),
('DIY Projects', 'Easy crafts and home improvement projects'),
('Food ASMR', 'Satisfying food preparation and eating sounds')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_reset_date ON usage(last_reset_date);
CREATE INDEX IF NOT EXISTS idx_trends_platform ON trend_data(platform);
CREATE INDEX IF NOT EXISTS idx_trends_date ON trend_data(date_added);
