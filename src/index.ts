import { createServer } from "http";
import express from "express";
import "dotenv/config";

import { logger } from "./utils/logger";
import validateRequest from "./middleware/validate-request.middleware";
import {
  VGetDistance,
  VGetDistanceBatch,
} from "./validators/distance.validator";
import STATUS_CODE from "./utils/status-code.utils";
import { getBatchPostCodeData, getPostCodeData } from "./controller";

const app = express();
const server = createServer(app);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(STATUS_CODE.SUCCESS).json({
    message: "Serving running",
    date: new Date().toISOString(),
  });
});

app.get("/distance", validateRequest({ body: VGetDistance }), getPostCodeData);

app.get(
  "/distance/batch",
  validateRequest({ body: VGetDistanceBatch }),
  getBatchPostCodeData
);

app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Something went wrong", error);

    res.status(500).json({
      message: "Unable to process request.",
    });
  }
);

const PORT = parseInt(process.env.PORT ?? "") || 3000;
server.listen(PORT, "0.0.0.0", () => {
  logger.info("Server listening on port:", PORT);
});
