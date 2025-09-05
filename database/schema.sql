-- Health Buddy Database Schema

-- Users table (ผู้สูงอายุ)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    picture_url TEXT,
    language VARCHAR(10) DEFAULT 'th',
    persona VARCHAR(50) DEFAULT 'friendly',
    conditions JSONB DEFAULT '[]',
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    opt_in BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Caregivers table (ลูกหลาน/ผู้ดูแล)
CREATE TABLE caregivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    line_user_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    receive_daily_report BOOLEAN DEFAULT true,
    receive_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Medications table
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    time_slots JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Schedule table (ตารางเตือน)
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'medication', 'vitals', 'mood_check'
    time_of_day TIME NOT NULL,
    days_of_week VARCHAR(20)[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'],
    active BOOLEAN DEFAULT true,
    next_send_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversation logs
CREATE TABLE conversation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    text TEXT NOT NULL,
    intent VARCHAR(50),
    flags JSONB DEFAULT '[]',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Medication logs
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id),
    scheduled_time TIMESTAMP,
    taken_at TIMESTAMP,
    skipped BOOLEAN DEFAULT false,
    skipped_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vitals logs
CREATE TABLE vitals_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bp_systolic INTEGER,
    bp_diastolic INTEGER,
    heart_rate INTEGER,
    glucose INTEGER,
    weight DECIMAL(5,2),
    temperature DECIMAL(4,2),
    spo2 INTEGER,
    notes TEXT,
    measured_at TIMESTAMP DEFAULT NOW()
);

-- Mood logs
CREATE TABLE mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(50) NOT NULL, -- 'happy', 'neutral', 'sad', 'anxious', 'angry'
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
    note TEXT,
    activities JSONB DEFAULT '[]',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Daily reports
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    mood_summary JSONB,
    medication_compliance DECIMAL(5,2),
    vitals_summary JSONB,
    conversation_highlights TEXT[],
    ai_insights TEXT,
    suggestions TEXT[],
    risk_level VARCHAR(20) DEFAULT 'normal', -- 'normal', 'warning', 'high', 'critical'
    flex_message_json JSONB,
    sent_to_caregivers BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, report_date)
);

-- Alert logs
CREATE TABLE alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    trigger_data JSONB,
    notified_users UUID[],
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_line_user_id ON users(line_user_id);
CREATE INDEX idx_schedules_next_send ON schedules(next_send_at) WHERE active = true;
CREATE INDEX idx_conversation_logs_user_timestamp ON conversation_logs(user_id, timestamp);
CREATE INDEX idx_medication_logs_user_date ON medication_logs(user_id, created_at);
CREATE INDEX idx_vitals_logs_user_date ON vitals_logs(user_id, measured_at);
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, timestamp);
CREATE INDEX idx_daily_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX idx_alerts_unresolved ON alert_logs(user_id, created_at) WHERE resolved = false;