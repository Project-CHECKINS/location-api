import axios from "axios";

const MAP_BOX_URL = "https://api.mapbox.com";
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

const mapbox_api = axios.create({
  baseURL: MAP_BOX_URL,
  params: {
    access_token: MAPBOX_ACCESS_TOKEN,
  },
});

export default mapbox_api;
