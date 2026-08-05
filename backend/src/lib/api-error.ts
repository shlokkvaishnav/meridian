import { NextResponse } from 'next/server';

/**
 * Logs the real error server-side (with full detail) and returns a generic,
 * safe message to the client — callers must never forward error.message to
 * the response, since it can leak internals (DB constraint text, file paths,
 * stack traces) to whoever's calling the API.
 */
export function apiError(error: unknown, fallbackMessage: string, status = 500) {
  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status });
}
