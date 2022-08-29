import "./style.css";
import "ol/ol.css";

import { Map, View, Overlay } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import { fromLonLat } from "ol/proj";
import { csv as csvFetch } from "d3-fetch";

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSMSource(),
    }),
  ],
  view: new View({
    center: fromLonLat([103.8, 1.35]),
    zoom: 12,
  }),
});

const addParksMarkers = async () => {
  const parksList = await csvFetch("./data/parks.csv");

  parksList.map((item)=>{
    const overlayElement = document.createElement("img");
    overlayElement.setAttribute("src", item.iconUrl);
    overlayElement.setAttribute("class", "rounded-full transition-all border-4 border-emerald-500 hover:border-8 hover:border-emerald-100");
    const olOverlay = new Overlay({
      stopEvent: false,
      positioning: "center-center",
      element: overlayElement,
    });
    olOverlay.setPosition(fromLonLat([item.lon,item.lat]));
    map.addOverlay(olOverlay);
  })

};

addParksMarkers();
