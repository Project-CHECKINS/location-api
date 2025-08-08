import express from "express";

import {
  VGetDistance,
  VGetDistanceBatch,
} from "./validators/distance.validator";
import { ZodInput } from "./utils/zod-input.utils";
import { getLongLat, getDistance } from "./services/mapbox";
import STATUS_CODE from "./utils/status-code.utils";

export async function getPostCodeData(
  req: express.Request<object, object, ZodInput<typeof VGetDistance>>,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { destination_post_code, starting_post_code } = req.body;
    const [starting_coordinates, destination_coordinates] = await Promise.all([
      getLongLat(starting_post_code),
      getLongLat(destination_post_code),
    ]);
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

interface IMappedCalculatedDistance {
  post_code: string;
  starting_coordinates: [number, number];
  destination_coordinates: [number, number];
  duration: string;
  distance: string;
}

export async function getBatchPostCodeData(
  req: express.Request<object, object, ZodInput<typeof VGetDistanceBatch>>,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { destination_post_code, starting_post_codes } = req.body;
    // Get destination coordinates
    const destination_coordinates = await getLongLat(destination_post_code);

    // Map starting post codes to coordinates and distances in one pass
    const distance_array: IMappedCalculatedDistance[] = await Promise.all(
      starting_post_codes.map(async (post_code) => {
        const starting_coordinates = await getLongLat(post_code);
        const { distance, duration } = await getDistance({
          starting_coordinates,
          destination_coordinates,
        });

        return {
          post_code,
          distance,
          duration,
          starting_coordinates,
          destination_coordinates,
        };
      })
    );

    res.status(STATUS_CODE.SUCCESS).json(distance_array);
  } catch (error) {
    next(error);
  }
}
