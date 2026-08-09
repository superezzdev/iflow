import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '@mindpost/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST', details?: unknown) {
    super(message, 400, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * Standard CORS headers for Next.js route handlers.
 */
export function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Handle OPTIONS preflight requests.
 */
export function handleOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders()
  });
}

/**
 * Centralized API error response handler.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('[API Error]', error);

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.errors[0]?.message || 'Invalid request data',
          details: formattedErrors
        }
      },
      {
        status: 400,
        headers: getCorsHeaders()
      }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      {
        status: error.statusCode,
        headers: getCorsHeaders()
      }
    );
  }

  const message = error instanceof Error ? error.message : 'An unexpected internal error occurred';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message
      }
    },
    {
      status: 500,
      headers: getCorsHeaders()
    }
  );
}

/**
 * Helper to return formatted success response.
 */
export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>
): NextResponse<{ success: true; data: T; meta?: Record<string, unknown> }> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {})
    },
    {
      status,
      headers: getCorsHeaders()
    }
  );
}
