/**
 * Track Management API Routes
 * RESTful endpoints for track CRUD operations
 */

import { Router, Request, Response } from 'express';
import { trackManager } from '../services/track-manager.js';
import {
  CreateTrackRequest,
  UpdateTrackRequest,
  ReorderTracksRequest,
} from '../types/track.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTrackSchema = z.object({
  type: z.enum(['audio', 'midi']),
  name: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const updateTrackSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  volume: z.number().min(-60).max(12).optional(),
  pan: z.number().min(-1).max(1).optional(),
  mute: z.boolean().optional(),
  solo: z.boolean().optional(),
  armed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

const reorderTracksSchema = z.object({
  trackIds: z.array(z.string()).min(1),
});

const updateMeterSchema = z.object({
  level: z.number().min(0).max(1),
});

/**
 * GET /api/tracks
 * Get all tracks
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const tracks = trackManager.getAllTracks();
    res.json({
      success: true,
      data: tracks,
      count: tracks.length,
    });
  } catch (error) {
    console.error('Error getting tracks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tracks',
    });
  }
});

/**
 * GET /api/tracks/state
 * Get complete project state
 */
router.get('/state', (req: Request, res: Response) => {
  try {
    const state = trackManager.getProjectState();

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('Error getting project state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve project state',
    });
  }
});

/**
 * GET /api/tracks/:id
 * Get track by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const track = trackManager.getTrack(id);

    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found',
      });
    }

    res.json({
      success: true,
      data: track,
    });
  } catch (error) {
    console.error('Error getting track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve track',
    });
  }
});

/**
 * POST /api/tracks
 * Create a new track
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const validation = createTrackSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors,
      });
    }

    const track = trackManager.createTrack(validation.data as CreateTrackRequest);

    res.status(201).json({
      success: true,
      data: track,
    });
  } catch (error) {
    console.error('Error creating track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create track',
    });
  }
});

/**
 * PUT /api/tracks/:id
 * Update track properties
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateTrackSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors,
      });
    }

    const track = trackManager.updateTrack(id, validation.data as UpdateTrackRequest);

    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found',
      });
    }

    res.json({
      success: true,
      data: track,
    });
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update track',
    });
  }
});

/**
 * DELETE /api/tracks/:id
 * Delete a track
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = trackManager.deleteTrack(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Track not found',
      });
    }

    res.json({
      success: true,
      message: 'Track deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete track',
    });
  }
});

/**
 * POST /api/tracks/:id/duplicate
 * Duplicate a track
 */
router.post('/:id/duplicate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const newTrack = trackManager.duplicateTrack(id);

    if (!newTrack) {
      return res.status(404).json({
        success: false,
        error: 'Track not found',
      });
    }

    res.status(201).json({
      success: true,
      data: {
        originalId: id,
        newId: newTrack.id,
        track: newTrack,
      },
    });
  } catch (error) {
    console.error('Error duplicating track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate track',
    });
  }
});

/**
 * POST /api/tracks/reorder
 * Reorder all tracks
 */
router.post('/reorder', (req: Request, res: Response) => {
  try {
    const validation = reorderTracksSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors,
      });
    }

    const success = trackManager.reorderTracks(validation.data.trackIds);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid track order - check all track IDs',
      });
    }

    res.json({
      success: true,
      data: trackManager.getAllTracks(),
    });
  } catch (error) {
    console.error('Error reordering tracks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder tracks',
    });
  }
});

/**
 * PUT /api/tracks/:id/meter
 * Update track meter level (for real-time metering)
 */
router.put('/:id/meter', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateMeterSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors,
      });
    }

    trackManager.updateMeter(id, validation.data.level);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error updating meter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meter',
    });
  }
});

export default router;
