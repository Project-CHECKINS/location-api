import { ZodTypeAny, z } from "zod";

/**
 * Infers the raw input type from a Zod schema.
 *
 * Useful for typing `req.body`| `req.query` | `req.params` in Express controllers,
 * especially when validation is already handled via middleware.
 *
 * @example
 * import { ZodInput } from './zod-helpers';
 * import { RegisterUserDTO } from './dtos/RegisterUserDTO';
 *
 * type RegisterBody = ZodInput<typeof RegisterUserDTO>;
 *
 * function register(
 *   req: Request<{}, {}, RegisterBody>,
 *   res: Response,
 *   next: NextFunction
 * ) {
 *   // req.body is fully typed and already validated
 * }
 */
export type ZodInput<T extends ZodTypeAny> = z.infer<T>;
