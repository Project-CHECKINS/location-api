import { createServer } from "http";
import express from "express";
import axios from "axios";
import "dotenv/config";

import { logger } from "./utils/logger";
import validateRequest from "./middleware/validate-request.middleware";
import {
  VGetDistance,
  VGetDistanceBatch,
} from "./validators/distance.validator";
import { ZodInput } from "./utils/zod-input.utils";
import { IGetLongLat, IMapboxDistance } from "./interfaces/mapbox.interface";
import STATUS_CODE from "./utils/status-code.utils";
import formatDuration from "./utils/format-duration.utils";

const PORT = parseInt(process.env.PORT ?? "") || 3000;
const MAP_BOX_URL = "https://api.mapbox.com";
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const mapbox_api = axios.create({
  baseURL: MAP_BOX_URL,
});

const app = express();
const server = createServer(app);

const MAPBOX_ENDPOINTS = {
  LONGLAT: "/search/geocode/v6/forward",
  DISTANCE: "/directions/v5/mapbox/driving",
};

const getLongLat = async (post_code: string) => {
  const response = await mapbox_api.get<IGetLongLat>(MAPBOX_ENDPOINTS.LONGLAT, {
    params: {
      q: post_code,
      access_token: MAPBOX_ACCESS_TOKEN,
    },
  });
  return response.data.features[0].geometry.coordinates;
};

interface IGetDistance {
  starting_coordinates: [number, number];
  destination_coordinates: [number, number];
}
const getDistance = async ({
  starting_coordinates,
  destination_coordinates,
}: IGetDistance) => {
  const results = await mapbox_api.get<IMapboxDistance>(
    `${MAPBOX_ENDPOINTS.DISTANCE}/${starting_coordinates[0]},${starting_coordinates[1]};${destination_coordinates[0]},${destination_coordinates[1]}`,
    {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        geometries: "geojson",
        language: "en",
        overview: "full",
        steps: "true",
      },
    }
  );
  const distanceM = results.data.routes[0].distance;
  const distanceKM = (distanceM / 1000).toFixed(2);

  return {
    duration: formatDuration(results.data.routes[0].duration),
    distance: distanceM > 999 ? `${distanceKM} km` : `${distanceM} m`,
  };
};

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(STATUS_CODE.SUCCESS).json({
    message: "Serving running",
    date: new Date().toISOString(),
  });
});

app.get(
  "/distance",
  validateRequest({ body: VGetDistance }),
  async (
    req: express.Request<object, object, ZodInput<typeof VGetDistance>>,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const starting_coordinates = await getLongLat(
        req.body.starting_post_code
      );
      const destination_coordinates = await getLongLat(
        req.body.destination_post_code
      );
      const results = await getDistance({
        starting_coordinates,
        destination_coordinates,
      });
      res.status(STATUS_CODE.SUCCESS).json(results);
      return;
    } catch (error) {
      next(error);
    }
  }
);

interface IMappedCoordinates {
  post_code: string;
  coordinates: [number, number];
}

interface IMappedCalculatedDistance {
  post_code: string;
  starting_coordinates: [number, number];
  destination_coordinates: [number, number];
  duration: string;
  distance: string;
}

app.get(
  "/distance/batch",
  validateRequest({ body: VGetDistanceBatch }),
  async (
    req: express.Request<object, object, ZodInput<typeof VGetDistanceBatch>>,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const destination_coordinates = await getLongLat(
        req.body.destination_post_code
      );

      const starting_coordinates_array: IMappedCoordinates[] =
        await Promise.all(
          req.body.starting_post_codes.map(async (post_code) => {
            const coordinates = await getLongLat(post_code);
            return { post_code, coordinates };
          })
        );

      const distance_array: IMappedCalculatedDistance[] = await Promise.all(
        starting_coordinates_array.map(async ({ coordinates, post_code }) => {
          const { distance, duration } = await getDistance({
            starting_coordinates: coordinates,
            destination_coordinates,
          });
          return {
            post_code,
            distance,
            duration,
            starting_coordinates: coordinates,
            destination_coordinates,
          };
        })
      );

      res.status(STATUS_CODE.SUCCESS).json(distance_array);
    } catch (error) {
      next(error);
    }
  }
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

server.listen(PORT, "0.0.0.0", () => {
  logger.info("Server listening on port: ", PORT);
});
