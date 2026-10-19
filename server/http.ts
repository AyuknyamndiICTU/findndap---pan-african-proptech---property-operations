import type { Request, Response } from 'express';

export type Lang = 'en' | 'fr';

/** Picks the response language from the client's Accept-Language header (English by default). */
export const langOf = (req: Request): Lang => (req.acceptsLanguages('en', 'fr') === 'fr' ? 'fr' : 'en');

/** Returns the message in the request's language. */
export const msg = (req: Request, en: string, fr: string) => (langOf(req) === 'fr' ? fr : en);

/** Sends a JSON error in the request's language. */
export const fail = (req: Request, res: Response, status: number, en: string, fr: string) =>
  res.status(status).json({ success: false, error: msg(req, en, fr) });
