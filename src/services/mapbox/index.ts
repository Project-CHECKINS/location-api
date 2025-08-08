import { IGetLongLat, IMapboxDistance, IGetDistance } from "./interface";
import mapbox_api from "./config";
import formatDuration from "../../utils/format-duration.utils";

const MAPBOX_ENDPOINTS = {
  LONGLAT: "/search/geocode/v6/forward",
  DISTANCE: "/directions/v5/mapbox/driving",
};

const getLongLat = async (post_code: string) => {
  const response = await mapbox_api.get<IGetLongLat>(MAPBOX_ENDPOINTS.LONGLAT, {
    params: {
      q: post_code,
    },
  });
  return response.data.features[0].geometry.coordinates;
};
const getDistance = async ({
  starting_coordinates,
  destination_coordinates,
}: IGetDistance) => {
  const results = await mapbox_api.get<IMapboxDistance>(
    `${MAPBOX_ENDPOINTS.DISTANCE}/${starting_coordinates[0]},${starting_coordinates[1]};${destination_coordinates[0]},${destination_coordinates[1]}`,
    {
      params: {
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

export { getLongLat, getDistance };
