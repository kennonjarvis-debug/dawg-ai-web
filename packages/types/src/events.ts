/**
 * @package @dawg-ai/types
 * @description Event types and Zod schemas for DAWG AI event bus
 * @owner Jerry (AI Conductor)
 */

import { z } from 'zod';

// ============================================================================
// Base Event Envelope
// ============================================================================

export const EventEnvelopeSchema = z.object({
  event: z.string(),
  version: z.string().default('v1'),
  id: z.string(),
  trace_id: z.string(),
  producer: z.string(),
  ts: z.string().datetime(),
  signature: z.string(),
  payload: z.record(z.string(), z.any()),
});

export type EventEnvelope<T = any> = {
  event: string;
  version: string;
  id: string;
  trace_id: string;
  producer: string;
  ts: string;
  signature: string;
  payload: T;
};

// ============================================================================
// Journey Events (journey.*)
// ============================================================================

export const VocalProfileSchema = z.object({
  lowest_note: z.string(),
  highest_note: z.string(),
  range_semitones: z.number(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
});

export const JourneyStartedPayloadSchema = z.object({
  journey_id: z.string(),
  user_id: z.string(),
  journey_type: z.enum(['record_song', 'expand_range', 'improve_control', 'build_confidence']),
  estimated_weeks: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  vocal_profile: VocalProfileSchema,
});

export const StageCompletedPayloadSchema = z.object({
  journey_id: z.string(),
  stage_id: z.string(),
  stage_name: z.string(),
  completion_time_sec: z.number(),
  next_stage_id: z.string().optional(),
});

export const JourneyPausedPayloadSchema = z.object({
  journey_id: z.string(),
  reason: z.enum(['user_request', 'ai_recommendation', 'technical_issue']).optional(),
});

export const JourneyResumedPayloadSchema = z.object({
  journey_id: z.string(),
  paused_duration_sec: z.number(),
});

export const JourneyCompletedPayloadSchema = z.object({
  journey_id: z.string(),
  total_duration_sec: z.number(),
  stages_completed: z.number(),
  final_recording_id: z.string().optional(),
});

export type VocalProfile = z.infer<typeof VocalProfileSchema>;
export type JourneyStartedPayload = z.infer<typeof JourneyStartedPayloadSchema>;
export type StageCompletedPayload = z.infer<typeof StageCompletedPayloadSchema>;
export type JourneyPausedPayload = z.infer<typeof JourneyPausedPayloadSchema>;
export type JourneyResumedPayload = z.infer<typeof JourneyResumedPayloadSchema>;
export type JourneyCompletedPayload = z.infer<typeof JourneyCompletedPayloadSchema>;

// ============================================================================
// Recording Events (recording.*)
// ============================================================================

export const RecordingStartedPayloadSchema = z.object({
  recording_id: z.string(),
  journey_id: z.string(),
  user_id: z.string(),
  track_id: z.string(),
  input_device: z.string(),
});

export const RecordingStoppedPayloadSchema = z.object({
  recording_id: z.string(),
  duration_sec: z.number(),
  file_size_bytes: z.number(),
  sample_rate: z.number(),
  format: z.enum(['wav', 'mp3', 'webm', 'opus']),
});

export const TakesUploadedPayloadSchema = z.object({
  recording_id: z.string(),
  take_ids: z.array(z.string()),
  take_count: z.number(),
  total_size_bytes: z.number(),
});

export const TakeSelectedPayloadSchema = z.object({
  recording_id: z.string(),
  selected_take_id: z.string(),
  selection_reason: z.enum(['ai_recommendation', 'user_choice']),
});

export type RecordingStartedPayload = z.infer<typeof RecordingStartedPayloadSchema>;
export type RecordingStoppedPayload = z.infer<typeof RecordingStoppedPayloadSchema>;
export type TakesUploadedPayload = z.infer<typeof TakesUploadedPayloadSchema>;
export type TakeSelectedPayload = z.infer<typeof TakeSelectedPayloadSchema>;

// ============================================================================
// AI Feedback Events (coach.*, comping.*, mix.*, master.*)
// ============================================================================

export const CoachFeedbackPayloadSchema = z.object({
  recording_id: z.string(),
  timestamp_sec: z.number(),
  detected_issue: z.enum([
    'pitch_flat',
    'pitch_sharp',
    'timing_early',
    'timing_late',
    'breath_support',
    'vowel_shape',
    'vibrato',
  ]),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  suggested_fix: z.string().optional(),
});

export const CompingSuggestionPayloadSchema = z.object({
  recording_id: z.string(),
  take_ids: z.array(z.string()),
  suggested_take_id: z.string(),
  confidence_score: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const MixSuggestionPayloadSchema = z.object({
  recording_id: z.string(),
  effect_chain: z.array(
    z.object({
      effect_type: z.enum(['eq', 'compression', 'reverb', 'delay', 'saturation', 'deesser']),
      parameters: z.record(z.string(), z.number()),
    })
  ),
  reasoning: z.string(),
});

export const MasterCompletedPayloadSchema = z.object({
  recording_id: z.string(),
  mastered_file_url: z.string(),
  lufs: z.number(),
  peak_db: z.number(),
  duration_sec: z.number(),
});

export type CoachFeedbackPayload = z.infer<typeof CoachFeedbackPayloadSchema>;
export type CompingSuggestionPayload = z.infer<typeof CompingSuggestionPayloadSchema>;
export type MixSuggestionPayload = z.infer<typeof MixSuggestionPayloadSchema>;
export type MasterCompletedPayload = z.infer<typeof MasterCompletedPayloadSchema>;

// ============================================================================
// Task Events (tasks.*)
// ============================================================================

export const TaskCreatedPayloadSchema = z.object({
  task_id: z.string(),
  title: z.string(),
  owner: z.string(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  estimate_days: z.number(),
  dependencies: z.array(z.string()).optional(),
});

export const TaskAssignedPayloadSchema = z.object({
  task_id: z.string(),
  assigned_to: z.string(),
  assigned_by: z.string(),
  deadline: z.string().datetime().optional(),
});

export const TaskCompletedPayloadSchema = z.object({
  task_ids: z.array(z.string()),
  completed_items: z.array(z.string()),
  completed_by: z.string(),
});

export const TaskUpdatedPayloadSchema = z.object({
  task_id: z.string(),
  action: z.enum(['backlog_refined', 'priority_changed', 'blocked', 'unblocked']),
  changes: z.record(z.string(), z.any()),
});

export type TaskCreatedPayload = z.infer<typeof TaskCreatedPayloadSchema>;
export type TaskAssignedPayload = z.infer<typeof TaskAssignedPayloadSchema>;
export type TaskCompletedPayload = z.infer<typeof TaskCompletedPayloadSchema>;
export type TaskUpdatedPayload = z.infer<typeof TaskUpdatedPayloadSchema>;

// ============================================================================
// Agent Coordination Events (agent.*)
// ============================================================================

export const AgentStatusUpdatePayloadSchema = z.object({
  agent_id: z.string(),
  agent_name: z.string(),
  status: z.enum(['active', 'idle', 'blocked', 'offline']),
  current_task: z.string().optional(),
  progress: z.number().min(0).max(100),
  health: z.enum(['healthy', 'degraded', 'critical']),
  needs_help: z.boolean(),
  available_to_help: z.boolean(),
  computational_resources: z.object({
    cpu_usage: z.number().min(0).max(100),
    memory_usage: z.number().min(0).max(100),
    available_capacity: z.number().min(0).max(100),
  }),
});

export const AgentHelpRequestedPayloadSchema = z.object({
  request_id: z.string(),
  requester: z.string(),
  requester_name: z.string(),
  issue: z.string(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  required_capabilities: z.array(z.string()).optional(),
  context: z.record(z.string(), z.any()).optional(),
});

export const AgentHelpClaimedPayloadSchema = z.object({
  request_id: z.string(),
  claimed_by: z.string(),
  claimed_by_name: z.string(),
});

export const AgentHelpResolvedPayloadSchema = z.object({
  request_id: z.string(),
  resolved_by: z.string(),
  resolved_by_name: z.string(),
  resolution_notes: z.string().optional(),
});

export const AgentBuddyPairedPayloadSchema = z.object({
  primary: z.string(),
  buddy: z.string(),
  focus: z.string(),
});

export const AgentHeartbeatPayloadSchema = z.object({
  agent_id: z.string(),
  agent_name: z.string(),
  status: z.enum(['active', 'idle', 'blocked', 'offline']),
  health: z.enum(['healthy', 'degraded', 'critical']),
});

export type AgentStatusUpdatePayload = z.infer<typeof AgentStatusUpdatePayloadSchema>;
export type AgentHelpRequestedPayload = z.infer<typeof AgentHelpRequestedPayloadSchema>;
export type AgentHelpClaimedPayload = z.infer<typeof AgentHelpClaimedPayloadSchema>;
export type AgentHelpResolvedPayload = z.infer<typeof AgentHelpResolvedPayloadSchema>;
export type AgentBuddyPairedPayload = z.infer<typeof AgentBuddyPairedPayloadSchema>;
export type AgentHeartbeatPayload = z.infer<typeof AgentHeartbeatPayloadSchema>;

// ============================================================================
// Metrics Events (metrics.*)
// ============================================================================

export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  tags: z.record(z.string(), z.string()).optional(),
});

export const MetricsTickPayloadSchema = z.object({
  metrics: z.array(MetricSchema),
  period_sec: z.number(),
  timestamp: z.string().datetime(),
});

export type Metric = z.infer<typeof MetricSchema>;
export type MetricsTickPayload = z.infer<typeof MetricsTickPayloadSchema>;

// ============================================================================
// Alerts Events (alerts.*)
// ============================================================================

export const AlertInfoPayloadSchema = z.object({
  msg: z.string(),
  agent: z.string().optional(),
  feature: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const AlertWarningPayloadSchema = z.object({
  msg: z.string(),
  agent: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  action_required: z.boolean(),
});

export const AlertErrorPayloadSchema = z.object({
  msg: z.string(),
  agent: z.string(),
  error_code: z.string(),
  stack_trace: z.string().optional(),
  recovery_attempted: z.boolean(),
});

export type AlertInfoPayload = z.infer<typeof AlertInfoPayloadSchema>;
export type AlertWarningPayload = z.infer<typeof AlertWarningPayloadSchema>;
export type AlertErrorPayload = z.infer<typeof AlertErrorPayloadSchema>;

// ============================================================================
// Conductor Events (conductor.*)
// ============================================================================

export const ConductorPlanUpdatedPayloadSchema = z.object({
  msg: z.string(),
  plan_version: z.string(),
  contracts: z.object({
    event_schemas: z.array(z.string()),
    openapi_specs: z.array(z.string()),
    grpc_protos: z.array(z.string()),
    e2e_tests: z.array(z.string()).optional(),
  }),
  capabilities: z.array(z.string()),
  links: z.record(z.string(), z.string()),
});

export type ConductorPlanUpdatedPayload = z.infer<typeof ConductorPlanUpdatedPayloadSchema>;

// ============================================================================
// Code Events (code.*)
// ============================================================================

export const CodeDiffProposedPayloadSchema = z.object({
  task_id: z.string(),
  branch: z.string(),
  diff: z.string(),
  tests: z.object({
    passed: z.number(),
    failed: z.number(),
  }),
  coverage: z.object({
    lines: z.number(),
  }),
  notes: z.string().optional(),
});

export const CodeReviewCompletedPayloadSchema = z.object({
  task_id: z.string(),
  review_type: z.string(),
  files_analyzed: z.number(),
  issues_found: z.record(z.string(), z.number()),
  report_location: z.string(),
  key_findings: z.array(z.string()),
  recommendations: z.record(z.string(), z.string()),
  estimated_effort: z.string(),
});

export type CodeDiffProposedPayload = z.infer<typeof CodeDiffProposedPayloadSchema>;
export type CodeReviewCompletedPayload = z.infer<typeof CodeReviewCompletedPayloadSchema>;

// ============================================================================
// UI Events (ui.*)
// ============================================================================

export const UIThemeChangedPayloadSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  previous_theme: z.enum(['light', 'dark', 'system']),
  user_id: z.string().optional(),
});

export const UIWidgetMountedPayloadSchema = z.object({
  widget_id: z.string(),
  widget_type: z.string(),
  parent_id: z.string().optional(),
  props: z.record(z.string(), z.any()).optional(),
});

export const UIWidgetUnmountedPayloadSchema = z.object({
  widget_id: z.string(),
  widget_type: z.string(),
  duration_ms: z.number(),
});

export const UILayoutResizedPayloadSchema = z.object({
  viewport_width: z.number(),
  viewport_height: z.number(),
  breakpoint: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  previous_breakpoint: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
});

export const UIRouteChangedPayloadSchema = z.object({
  from: z.string(),
  to: z.string(),
  query_params: z.record(z.string(), z.string()).optional(),
});

export const UIModalOpenedPayloadSchema = z.object({
  modal_id: z.string(),
  modal_type: z.string(),
  trigger: z.enum(['user', 'system', 'error']),
});

export const UIModalClosedPayloadSchema = z.object({
  modal_id: z.string(),
  modal_type: z.string(),
  action: z.enum(['confirm', 'cancel', 'close', 'backdrop']),
  duration_ms: z.number(),
});

export const UINotificationShownPayloadSchema = z.object({
  notification_id: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  message: z.string(),
  duration_ms: z.number().optional(),
});

export const UIErrorDisplayedPayloadSchema = z.object({
  error_id: z.string(),
  error_type: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  component: z.string().optional(),
});

export type UIThemeChangedPayload = z.infer<typeof UIThemeChangedPayloadSchema>;
export type UIWidgetMountedPayload = z.infer<typeof UIWidgetMountedPayloadSchema>;
export type UIWidgetUnmountedPayload = z.infer<typeof UIWidgetUnmountedPayloadSchema>;
export type UILayoutResizedPayload = z.infer<typeof UILayoutResizedPayloadSchema>;
export type UIRouteChangedPayload = z.infer<typeof UIRouteChangedPayloadSchema>;
export type UIModalOpenedPayload = z.infer<typeof UIModalOpenedPayloadSchema>;
export type UIModalClosedPayload = z.infer<typeof UIModalClosedPayloadSchema>;
export type UINotificationShownPayload = z.infer<typeof UINotificationShownPayloadSchema>;
export type UIErrorDisplayedPayload = z.infer<typeof UIErrorDisplayedPayloadSchema>;

// ============================================================================
// Event Topic Constants
// ============================================================================

export const EventTopics = {
  // Journey
  JOURNEY_STARTED: 'journey.started',
  STAGE_COMPLETED: 'stage.completed',
  JOURNEY_PAUSED: 'journey.paused',
  JOURNEY_RESUMED: 'journey.resumed',
  JOURNEY_COMPLETED: 'journey.completed',

  // Recording
  RECORDING_STARTED: 'recording.started',
  RECORDING_STOPPED: 'recording.stopped',
  TAKES_UPLOADED: 'recording.takes.uploaded',
  TAKE_SELECTED: 'recording.take.selected',

  // AI Feedback
  COACH_FEEDBACK: 'coach.feedback',
  COMPING_SUGGESTION: 'comping.suggestion',
  MIX_SUGGESTION: 'mix.suggestion',
  MASTER_COMPLETED: 'master.completed',

  // Tasks
  TASK_CREATED: 'tasks.created',
  TASK_ASSIGNED: 'tasks.assigned',
  TASK_COMPLETED: 'tasks.completed',
  TASK_UPDATED: 'tasks.updated',

  // Agent Coordination
  AGENT_STATUS_UPDATE: 'agent.status.update',
  AGENT_HELP_REQUESTED: 'agent.help.requested',
  AGENT_HELP_CLAIMED: 'agent.help.claimed',
  AGENT_HELP_RESOLVED: 'agent.help.resolved',
  AGENT_BUDDY_PAIRED: 'agent.buddy.paired',
  AGENT_HEARTBEAT: 'agent.heartbeat',

  // Metrics
  METRICS_TICK: 'metrics.tick',

  // Alerts
  ALERT_INFO: 'alerts.info',
  ALERT_WARNING: 'alerts.warning',
  ALERT_ERROR: 'alerts.error',

  // Conductor
  CONDUCTOR_PLAN_UPDATED: 'conductor.plan.updated',

  // Code
  CODE_DIFF_PROPOSED: 'code.diff.proposed',
  CODE_REVIEW_COMPLETED: 'code.review.completed',

  // UI Events
  UI_THEME_CHANGED: 'ui.theme.changed',
  UI_WIDGET_MOUNTED: 'ui.widget.mounted',
  UI_WIDGET_UNMOUNTED: 'ui.widget.unmounted',
  UI_LAYOUT_RESIZED: 'ui.layout.resized',
  UI_ROUTE_CHANGED: 'ui.route.changed',
  UI_MODAL_OPENED: 'ui.modal.opened',
  UI_MODAL_CLOSED: 'ui.modal.closed',
  UI_NOTIFICATION_SHOWN: 'ui.notification.shown',
  UI_ERROR_DISPLAYED: 'ui.error.displayed',
} as const;

export type EventTopic = (typeof EventTopics)[keyof typeof EventTopics];

// ============================================================================
// Event Payload Type Map
// ============================================================================

export type EventPayloadMap = {
  // Journey
  [EventTopics.JOURNEY_STARTED]: JourneyStartedPayload;
  [EventTopics.STAGE_COMPLETED]: StageCompletedPayload;
  [EventTopics.JOURNEY_PAUSED]: JourneyPausedPayload;
  [EventTopics.JOURNEY_RESUMED]: JourneyResumedPayload;
  [EventTopics.JOURNEY_COMPLETED]: JourneyCompletedPayload;

  // Recording
  [EventTopics.RECORDING_STARTED]: RecordingStartedPayload;
  [EventTopics.RECORDING_STOPPED]: RecordingStoppedPayload;
  [EventTopics.TAKES_UPLOADED]: TakesUploadedPayload;
  [EventTopics.TAKE_SELECTED]: TakeSelectedPayload;

  // AI Feedback
  [EventTopics.COACH_FEEDBACK]: CoachFeedbackPayload;
  [EventTopics.COMPING_SUGGESTION]: CompingSuggestionPayload;
  [EventTopics.MIX_SUGGESTION]: MixSuggestionPayload;
  [EventTopics.MASTER_COMPLETED]: MasterCompletedPayload;

  // Tasks
  [EventTopics.TASK_CREATED]: TaskCreatedPayload;
  [EventTopics.TASK_ASSIGNED]: TaskAssignedPayload;
  [EventTopics.TASK_COMPLETED]: TaskCompletedPayload;
  [EventTopics.TASK_UPDATED]: TaskUpdatedPayload;

  // Agent Coordination
  [EventTopics.AGENT_STATUS_UPDATE]: AgentStatusUpdatePayload;
  [EventTopics.AGENT_HELP_REQUESTED]: AgentHelpRequestedPayload;
  [EventTopics.AGENT_HELP_CLAIMED]: AgentHelpClaimedPayload;
  [EventTopics.AGENT_HELP_RESOLVED]: AgentHelpResolvedPayload;
  [EventTopics.AGENT_BUDDY_PAIRED]: AgentBuddyPairedPayload;
  [EventTopics.AGENT_HEARTBEAT]: AgentHeartbeatPayload;

  // Metrics
  [EventTopics.METRICS_TICK]: MetricsTickPayload;

  // Alerts
  [EventTopics.ALERT_INFO]: AlertInfoPayload;
  [EventTopics.ALERT_WARNING]: AlertWarningPayload;
  [EventTopics.ALERT_ERROR]: AlertErrorPayload;

  // Conductor
  [EventTopics.CONDUCTOR_PLAN_UPDATED]: ConductorPlanUpdatedPayload;

  // Code
  [EventTopics.CODE_DIFF_PROPOSED]: CodeDiffProposedPayload;
  [EventTopics.CODE_REVIEW_COMPLETED]: CodeReviewCompletedPayload;

  // UI Events
  [EventTopics.UI_THEME_CHANGED]: UIThemeChangedPayload;
  [EventTopics.UI_WIDGET_MOUNTED]: UIWidgetMountedPayload;
  [EventTopics.UI_WIDGET_UNMOUNTED]: UIWidgetUnmountedPayload;
  [EventTopics.UI_LAYOUT_RESIZED]: UILayoutResizedPayload;
  [EventTopics.UI_ROUTE_CHANGED]: UIRouteChangedPayload;
  [EventTopics.UI_MODAL_OPENED]: UIModalOpenedPayload;
  [EventTopics.UI_MODAL_CLOSED]: UIModalClosedPayload;
  [EventTopics.UI_NOTIFICATION_SHOWN]: UINotificationShownPayload;
  [EventTopics.UI_ERROR_DISPLAYED]: UIErrorDisplayedPayload;
};

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateEventPayload<T extends EventTopic>(
  topic: T,
  payload: unknown
): EventPayloadMap[T] {
  const schemaMap: Record<string, z.ZodSchema> = {
    [EventTopics.JOURNEY_STARTED]: JourneyStartedPayloadSchema,
    [EventTopics.STAGE_COMPLETED]: StageCompletedPayloadSchema,
    [EventTopics.JOURNEY_PAUSED]: JourneyPausedPayloadSchema,
    [EventTopics.JOURNEY_RESUMED]: JourneyResumedPayloadSchema,
    [EventTopics.JOURNEY_COMPLETED]: JourneyCompletedPayloadSchema,
    [EventTopics.RECORDING_STARTED]: RecordingStartedPayloadSchema,
    [EventTopics.RECORDING_STOPPED]: RecordingStoppedPayloadSchema,
    [EventTopics.TAKES_UPLOADED]: TakesUploadedPayloadSchema,
    [EventTopics.TAKE_SELECTED]: TakeSelectedPayloadSchema,
    [EventTopics.COACH_FEEDBACK]: CoachFeedbackPayloadSchema,
    [EventTopics.COMPING_SUGGESTION]: CompingSuggestionPayloadSchema,
    [EventTopics.MIX_SUGGESTION]: MixSuggestionPayloadSchema,
    [EventTopics.MASTER_COMPLETED]: MasterCompletedPayloadSchema,
    [EventTopics.TASK_CREATED]: TaskCreatedPayloadSchema,
    [EventTopics.TASK_ASSIGNED]: TaskAssignedPayloadSchema,
    [EventTopics.TASK_COMPLETED]: TaskCompletedPayloadSchema,
    [EventTopics.TASK_UPDATED]: TaskUpdatedPayloadSchema,
    [EventTopics.AGENT_STATUS_UPDATE]: AgentStatusUpdatePayloadSchema,
    [EventTopics.AGENT_HELP_REQUESTED]: AgentHelpRequestedPayloadSchema,
    [EventTopics.AGENT_HELP_CLAIMED]: AgentHelpClaimedPayloadSchema,
    [EventTopics.AGENT_HELP_RESOLVED]: AgentHelpResolvedPayloadSchema,
    [EventTopics.AGENT_BUDDY_PAIRED]: AgentBuddyPairedPayloadSchema,
    [EventTopics.AGENT_HEARTBEAT]: AgentHeartbeatPayloadSchema,
    [EventTopics.METRICS_TICK]: MetricsTickPayloadSchema,
    [EventTopics.ALERT_INFO]: AlertInfoPayloadSchema,
    [EventTopics.ALERT_WARNING]: AlertWarningPayloadSchema,
    [EventTopics.ALERT_ERROR]: AlertErrorPayloadSchema,
    [EventTopics.CONDUCTOR_PLAN_UPDATED]: ConductorPlanUpdatedPayloadSchema,
    [EventTopics.CODE_DIFF_PROPOSED]: CodeDiffProposedPayloadSchema,
    [EventTopics.CODE_REVIEW_COMPLETED]: CodeReviewCompletedPayloadSchema,
    [EventTopics.UI_THEME_CHANGED]: UIThemeChangedPayloadSchema,
    [EventTopics.UI_WIDGET_MOUNTED]: UIWidgetMountedPayloadSchema,
    [EventTopics.UI_WIDGET_UNMOUNTED]: UIWidgetUnmountedPayloadSchema,
    [EventTopics.UI_LAYOUT_RESIZED]: UILayoutResizedPayloadSchema,
    [EventTopics.UI_ROUTE_CHANGED]: UIRouteChangedPayloadSchema,
    [EventTopics.UI_MODAL_OPENED]: UIModalOpenedPayloadSchema,
    [EventTopics.UI_MODAL_CLOSED]: UIModalClosedPayloadSchema,
    [EventTopics.UI_NOTIFICATION_SHOWN]: UINotificationShownPayloadSchema,
    [EventTopics.UI_ERROR_DISPLAYED]: UIErrorDisplayedPayloadSchema,
  };

  const schema = schemaMap[topic];
  if (!schema) {
    throw new Error(`No schema found for topic: ${topic}`);
  }

  return schema.parse(payload) as EventPayloadMap[T];
}
