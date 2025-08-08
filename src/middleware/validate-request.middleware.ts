import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import STATUS_CODE from "../utils/status-code.utils";

interface RequestValidator {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

function validateRequest(validators: RequestValidator) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (validators.body) {
        Object.assign(
          request.body,
          await validators.body.parseAsync(request.body)
        );
      }

      if (validators.params) {
        Object.assign(
          request.params,
          await validators.params.parseAsync(request.params)
        );
      }

      if (validators.query) {
        Object.assign(
          request.query,
          await validators.query.parseAsync(request.query)
        );
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        response.status(STATUS_CODE.UNPROCESSABLE_ENTITY).json(err.issues);
        return;
      }
      next(err);
    }
  };
}

export default validateRequest;
