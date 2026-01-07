-- Customer Validation Tracker Tables
-- Run this SQL in your Supabase SQL Editor

-- Customer Interviews table
CREATE TABLE IF NOT EXISTS customer_interviews (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  interview_guide_id TEXT, -- Reference to interview guide if generated from one
  interviewee_name TEXT,
  interviewee_email TEXT,
  interviewee_role TEXT,
  interviewee_company TEXT,
  interview_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interview_duration_minutes INTEGER,
  interview_type TEXT NOT NULL DEFAULT 'customer_interview', -- 'customer_interview', 'user_test', 'survey'
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  notes TEXT,
  key_insights TEXT,
  validation_score INTEGER, -- 1-10 score of how well it validated assumptions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interview Answers table
CREATE TABLE IF NOT EXISTS interview_answers (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL REFERENCES customer_interviews(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  question_category TEXT, -- 'opening', 'problem_validation', 'solution_validation', 'jtbd', 'pain_point', 'current_solution', 'willingness_to_pay', 'closing'
  signal_type TEXT, -- 'positive', 'negative', 'neutral'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Validation Assumptions table
CREATE TABLE IF NOT EXISTS validation_assumptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  assumption_text TEXT NOT NULL,
  assumption_category TEXT, -- 'problem', 'solution', 'customer', 'market', 'pricing', 'other'
  validation_status TEXT NOT NULL DEFAULT 'unvalidated', -- 'unvalidated', 'validated', 'invalidated', 'partially_validated'
  confidence_level INTEGER, -- 1-10 before validation
  evidence_count INTEGER DEFAULT 0, -- Number of interviews that support this
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assumption Evidence table (links assumptions to interview answers)
CREATE TABLE IF NOT EXISTS assumption_evidence (
  id TEXT PRIMARY KEY,
  assumption_id TEXT NOT NULL REFERENCES validation_assumptions(id) ON DELETE CASCADE,
  interview_id TEXT NOT NULL REFERENCES customer_interviews(id) ON DELETE CASCADE,
  answer_id TEXT REFERENCES interview_answers(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL, -- 'supports', 'contradicts', 'neutral'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_interviews_user_id ON customer_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_interviews_project_id ON customer_interviews(project_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id ON interview_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_validation_assumptions_user_id ON validation_assumptions(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_assumptions_project_id ON validation_assumptions(project_id);
CREATE INDEX IF NOT EXISTS idx_assumption_evidence_assumption_id ON assumption_evidence(assumption_id);
CREATE INDEX IF NOT EXISTS idx_assumption_evidence_interview_id ON assumption_evidence(interview_id);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assumption_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_interviews
CREATE POLICY "Users can view their own interviews" ON customer_interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews" ON customer_interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON customer_interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews" ON customer_interviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for interview_answers
CREATE POLICY "Users can view answers for their interviews" ON interview_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_interviews 
      WHERE customer_interviews.id = interview_answers.interview_id 
      AND customer_interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for their interviews" ON interview_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_interviews 
      WHERE customer_interviews.id = interview_answers.interview_id 
      AND customer_interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for their interviews" ON interview_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customer_interviews 
      WHERE customer_interviews.id = interview_answers.interview_id 
      AND customer_interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete answers for their interviews" ON interview_answers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customer_interviews 
      WHERE customer_interviews.id = interview_answers.interview_id 
      AND customer_interviews.user_id = auth.uid()
    )
  );

-- RLS Policies for validation_assumptions
CREATE POLICY "Users can view their own assumptions" ON validation_assumptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assumptions" ON validation_assumptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assumptions" ON validation_assumptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assumptions" ON validation_assumptions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for assumption_evidence
CREATE POLICY "Users can view evidence for their assumptions" ON assumption_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM validation_assumptions 
      WHERE validation_assumptions.id = assumption_evidence.assumption_id 
      AND validation_assumptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert evidence for their assumptions" ON assumption_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM validation_assumptions 
      WHERE validation_assumptions.id = assumption_evidence.assumption_id 
      AND validation_assumptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update evidence for their assumptions" ON assumption_evidence
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM validation_assumptions 
      WHERE validation_assumptions.id = assumption_evidence.assumption_id 
      AND validation_assumptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete evidence for their assumptions" ON assumption_evidence
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM validation_assumptions 
      WHERE validation_assumptions.id = assumption_evidence.assumption_id 
      AND validation_assumptions.user_id = auth.uid()
    )
  );

