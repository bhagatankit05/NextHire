-- Create Interviews table
CREATE TABLE IF NOT EXISTS "Interviews" (
    id UUID PRIMARY KEY,
    job_position TEXT NOT NULL,
    job_description TEXT,
    duration INTEGER NOT NULL,
    interview_type JSONB,
    questions JSONB,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed'))
);

-- Create Users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_created_by ON "Interviews"(created_by);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON "Interviews"(status);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON "Interviews"(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);