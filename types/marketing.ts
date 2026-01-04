// TypeScript types for Marketing Blueprint Tool
// Based on the Attention-to-Scale system

export type Platform = 
  | "tiktok" 
  | "instagram" 
  | "youtube" 
  | "facebook" 
  | "linkedin" 
  | "x" 
  | "other"

export interface BusinessContext {
  brand_name: string
  offer_summary: string
  target_customer: string
  category?: string
  primary_platforms: Platform[]
  proof_assets: string[]
  constraints: Record<string, string>
  current_channels: Record<string, string>
}

export interface AttentionHookSpec {
  hook_promise: string
  hook_mechanic: string
  opening_structure: string[]
  cognitive_load_rule: "low"
}

export interface ContentFormatSpec {
  format_name: string
  why_it_works: string
  required_beats: string[]
  variable_slots: string[]
  platform_fit: Platform[]
}

export interface PerformanceDriverSpec {
  driver_name: string
  observed_effect: "up" | "down" | "mixed"
  diagnostic_questions: string[]
  how_to_improve: string[]
}

export interface QualitativeReviewTemplate {
  retention_notes: string[]
  engagement_notes: string[]
  hook_notes: string[]
  story_notes: string[]
  actionable_edits_next_version: string[]
}

export interface ExperimentDesign {
  hypothesis: string
  test_variant_notes: string[]
  success_metrics: string[]
  pivot_rules: string[]
}

export interface TargetingSpec {
  audience_hypotheses: string[]
  targeting_inputs: Record<string, string>
  objective_priority: string[]
  retargeting_plan: string[]
}

export interface MessagingStrategy {
  core_message: string
  differentiation: string
  audience_desire_image: string
  attention_hook_angles: string[]
}

export interface AttentionToScaleSystem {
  context: BusinessContext
  messaging: MessagingStrategy
  attention_hooks: AttentionHookSpec[]
  format_library: ContentFormatSpec[]
  performance_drivers: PerformanceDriverSpec[]
  experimentation: ExperimentDesign[]
  qualitative_review: QualitativeReviewTemplate
  distribution_and_targeting: TargetingSpec
  operating_cadence: Record<string, string>
  output_artifacts: Record<string, string[]>
}

export interface AppliedSystemResult {
  system: AttentionToScaleSystem
  prioritized_next_actions: string[]
  test_matrix: Array<Record<string, string>>
  content_backlog: Array<Record<string, string>>
}

