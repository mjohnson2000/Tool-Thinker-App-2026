-- Fix RLS Policies to Avoid Infinite Recursion
-- Run this SQL in Supabase SQL Editor AFTER running schema-collaboration.sql
-- This fixes the infinite recursion issue in the policies

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Members can view project activity" ON project_activity;
DROP POLICY IF EXISTS "Members can create activity" ON project_activity;
DROP POLICY IF EXISTS "Members can view comments" ON project_comments;
DROP POLICY IF EXISTS "Members can create comments" ON project_comments;

-- Recreate project_members SELECT policy without recursion
-- Users can view members if they own the project OR if the member record is their own
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    -- Project owner can view all members
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Users can see their own membership record
    project_members.user_id = auth.uid()
  );

-- Recreate project_activity SELECT policy without recursion
CREATE POLICY "Members can view project activity" ON project_activity
  FOR SELECT USING (
    -- Project owner can always view
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_activity.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Check membership without recursion - use direct user_id check on project_members
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_activity.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

-- Recreate project_activity INSERT policy without recursion
CREATE POLICY "Members can create activity" ON project_activity
  FOR INSERT WITH CHECK (
    -- Project owner can always create
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_activity.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Check membership without recursion
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_activity.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

-- Recreate project_comments SELECT policy without recursion
CREATE POLICY "Members can view comments" ON project_comments
  FOR SELECT USING (
    -- Project owner can always view
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_comments.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Check membership without recursion
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_comments.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

-- Recreate project_comments INSERT policy without recursion
CREATE POLICY "Members can create comments" ON project_comments
  FOR INSERT WITH CHECK (
    -- Project owner can always create
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_comments.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Check membership without recursion
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_comments.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

