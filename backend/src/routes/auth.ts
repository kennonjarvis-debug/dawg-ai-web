/**
 * Authentication Routes
 * Module 10: Cloud Storage & Backend
 *
 * Handles user authentication via Supabase Auth
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      res.status(400).json({
        error: 'Signup failed',
        message: error.message
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create account'
    });
  }
});

/**
 * POST /api/auth/signin
 * Sign in with email and password
 */
router.post('/signin', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
      return;
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Signin error:', error);
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to sign in'
    });
  }
});

/**
 * POST /api/auth/signout
 * Sign out the current user
 */
router.post('/signout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.supabase) {
      res.status(500).json({ error: 'Supabase client not initialized' });
      return;
    }

    const { error } = await req.supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error);
      res.status(500).json({
        error: 'Signout failed',
        message: error.message
      });
      return;
    }

    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to sign out'
    });
  }
});

/**
 * GET /api/auth/session
 * Get current session info
 */
router.get('/session', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.supabase) {
      res.status(500).json({ error: 'Supabase client not initialized' });
      return;
    }

    const { data: { session }, error } = await req.supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      res.status(500).json({
        error: 'Failed to get session',
        message: error.message
      });
      return;
    }

    res.json({
      success: true,
      data: {
        session,
        user: req.user
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get session'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh the session token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Refresh token is required'
      });
      return;
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      console.error('Refresh error:', error);
      res.status(401).json({
        error: 'Refresh failed',
        message: error.message
      });
      return;
    }

    res.json({
      success: true,
      data: {
        session: data.session
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to refresh session'
    });
  }
});

/**
 * GET /api/auth/user
 * Get current user profile
 */
router.get('/user', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.supabase) {
      res.status(500).json({ error: 'Supabase client not initialized' });
      return;
    }

    const { data: { user }, error } = await req.supabase.auth.getUser();

    if (error || !user) {
      res.status(404).json({
        error: 'User not found',
        message: 'Could not fetch user profile'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user'
    });
  }
});

/**
 * PUT /api/auth/user
 * Update user profile
 */
router.put('/user', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.supabase) {
      res.status(500).json({ error: 'Supabase client not initialized' });
      return;
    }

    const { name, avatar_url } = req.body;

    const updates: any = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
    }

    const { data, error } = await req.supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: 'Update failed',
        message: error.message
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: data.user
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Request password reset email
 */
router.post('/reset-password', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email is required'
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Reset failed',
        message: error.message
      });
      return;
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send reset email'
    });
  }
});

/**
 * POST /api/auth/update-password
 * Update password (requires current session)
 */
router.post('/update-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.supabase) {
      res.status(500).json({ error: 'Supabase client not initialized' });
      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'New password is required'
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    const { data, error } = await req.supabase.auth.updateUser({
      password
    });

    if (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        error: 'Update failed',
        message: error.message
      });
      return;
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        user: data.user
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update password'
    });
  }
});

export default router;
