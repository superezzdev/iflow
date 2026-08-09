import { NextResponse } from 'next/server';
import { APP_NAME } from '@mindpost/shared';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      service: `${APP_NAME} API`,
      timestamp: new Date().toISOString(),
      version: '0.1.0'
    }
  });
}
