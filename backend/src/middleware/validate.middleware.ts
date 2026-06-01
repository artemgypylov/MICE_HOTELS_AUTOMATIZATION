import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

/**
 * Generic Zod validation middleware.
 *
 * Validates `req.body` (default), `req.query` or `req.params` against the
 * supplied schema. On success the parsed/coerced value replaces the original
 * source so downstream handlers receive typed, sanitised data. On failure a
 * structured error response is returned:
 *
 *   { error: string, fields?: Record<string, string> }
 */
export type ValidationSource = 'body' | 'query' | 'params';

export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const error = result.error as ZodError;
      const fields: Record<string, string> = {};

      for (const issue of error.issues) {
        const path = issue.path.join('.') || '_';
        // Keep the first message per field for a clean response.
        if (!fields[path]) {
          fields[path] = issue.message;
        }
      }

      res.status(400).json({
        error: 'Validation failed',
        fields,
      });
      return;
    }

    // Replace the source with the parsed (and coerced) value.
    // `req.query` / `req.params` are read-only getters in some Express
    // versions, so assign defensively.
    try {
      (req as unknown as Record<string, unknown>)[source] = result.data;
    } catch {
      // Fall back to leaving the original value in place.
    }

    next();
  };
};

export default validate;
