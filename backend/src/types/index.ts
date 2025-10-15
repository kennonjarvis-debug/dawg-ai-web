/**
 * Type Definitions
 * Module 10: Cloud Storage & Backend
 *
 * Shared types for backend API
 */

export type UUID = string;

/**
 * Project data structure (matches API_CONTRACTS.md)
 */
export interface ProjectData {
  tracks: TrackData[];
  tempo: number;
  timeSignature: [number, number];
  effects?: EffectConfig[];
  automation?: AutomationData[];
  clips?: Clip[];
}

/**
 * Track data (from Module 3)
 */
export interface TrackData {
  id: UUID;
  name: string;
  type: 'audio' | 'midi' | 'aux' | 'folder';
  color: string;
  icon?: string;
  order: number;
  height?: 'collapsed' | 'small' | 'medium' | 'large';
  parentId?: UUID;
  settings?: TrackSettings;
}

/**
 * Track settings
 */
export interface TrackSettings {
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  recordArm: boolean;
  monitor: boolean;
  frozen: boolean;
  input: string;
  output: string;
}

/**
 * Effect configuration
 */
export interface EffectConfig {
  id: UUID;
  name: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

/**
 * Automation data
 */
export interface AutomationData {
  id: UUID;
  trackId: UUID;
  parameter: string;
  points: AutomationPoint[];
}

/**
 * Automation point
 */
export interface AutomationPoint {
  time: number;
  value: number;
}

/**
 * Audio clip
 */
export interface Clip {
  id: UUID;
  trackId: UUID;
  startTime: number;
  duration: number;
  offset: number;
  gain: number;
  fadeIn: number;
  fadeOut: number;
  audioUrl?: string;
}

/**
 * Project database record
 */
export interface Project {
  id: UUID;
  user_id: UUID;
  name: string;
  data: ProjectData;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  share_token?: string;
}

/**
 * Project version
 */
export interface ProjectVersion {
  id: UUID;
  project_id: UUID;
  version_number: number;
  data: ProjectData;
  created_at: string;
}

/**
 * File record
 */
export interface FileRecord {
  id: UUID;
  user_id: UUID;
  project_id?: UUID;
  filename: string;
  storage_path: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
}

/**
 * Collaborator
 */
export interface Collaborator {
  id: UUID;
  project_id: UUID;
  user_id: UUID;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

/**
 * Project template
 */
export interface ProjectTemplate {
  id: UUID;
  name: string;
  description?: string;
  data: ProjectData;
  category: string;
  is_official: boolean;
  created_by?: UUID;
  created_at: string;
}

/**
 * API Request types
 */

export interface CreateProjectRequest {
  name: string;
  data?: ProjectData;
  templateId?: UUID;
}

export interface UpdateProjectRequest {
  name?: string;
  data?: ProjectData;
}

export interface UploadFileRequest {
  projectId?: UUID;
}

/**
 * API Response types
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Error types
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
