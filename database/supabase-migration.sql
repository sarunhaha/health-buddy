-- Supabase Migration for Health Buddy
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (ผู้สูงอายุ)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    picture_url TEXT,
    language VARCHAR(10) DEFAULT 'th',
    persona VARCHAR(50) DEFAULT 'friendly',
    conditions JSONB DEFAULT '[]',
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    opt_in BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caregivers table (ลูกหลาน/ผู้ดูแล)
CREATE TABLE IF NOT EXISTS caregivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    line_user_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    receive_daily_report BOOLEAN DEFAULT true,
    receive_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    time_slots JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table (ตารางเตือน)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    time_of_day TIME NOT NULL,
    days_of_week TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'],
    active BOOLEAN DEFAULT true,
    next_send_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation logs
CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    intent VARCHAR(50),
    flags JSONB DEFAULT '[]',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Medication logs
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id),
    scheduled_time TIMESTAMPTZ,
    taken_at TIMESTAMPTZ,
    skipped BOOLEAN DEFAULT false,
    skipped_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vitals logs
CREATE TABLE IF NOT EXISTS vitals_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bp_systolic INTEGER,
    bp_diastolic INTEGER,
    heart_rate INTEGER,
    glucose INTEGER,
    weight DECIMAL(5,2),
    temperature DECIMAL(4,2),
    spo2 INTEGER,
    notes TEXT,
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood logs
CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(50) NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
    note TEXT,
    activities JSONB DEFAULT '[]',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Daily reports
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    mood_summary JSONB,
    medication_compliance DECIMAL(5,2),
    vitals_summary JSONB,
    conversation_highlights TEXT[],
    ai_insights TEXT,
    suggestions TEXT[],
    risk_level VARCHAR(20) DEFAULT 'normal',
    flex_message_json JSONB,
    sent_to_caregivers BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, report_date)
);

-- Alert logs
CREATE TABLE IF NOT EXISTS alert_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    trigger_data JSONB,
    notified_users UUID[],
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_send ON schedules(next_send_at) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user_timestamp ON conversation_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vitals_logs_user_date ON vitals_logs(user_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alert_logs(user_id, created_at) WHERE resolved = false;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for service role access)
CREATE POLICY "Service role has full access to users" ON users
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to caregivers" ON caregivers
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to medications" ON medications
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to schedules" ON schedules
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to conversation_logs" ON conversation_logs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to medication_logs" ON medication_logs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to vitals_logs" ON vitals_logs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to mood_logs" ON mood_logs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to daily_reports" ON daily_reports
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to alert_logs" ON alert_logs
    FOR ALL USING (true);

-- Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE alert_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_logs;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();