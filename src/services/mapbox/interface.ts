export interface IFeatureObject {
  geometry: {
    coordinates: [number, number];
  };
}

export interface IGetLongLat {
  type: string;
  features: IFeatureObject[];
}

export interface IRoute {
  duration: number;
  distance: number;
}
export interface IMapboxDistance {
  routes: IRoute[];
}

export interface IGetDistance {
  starting_coordinates: [number, number];
  destination_coordinates: [number, number];
}
