import "./style.css";
import "ol/ol.css";

import { Map, View, Overlay } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style, Fill, Stroke } from "ol/style";
import { asArray } from "ol/color";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
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

  parksList.map((item) => {
    const overlayElement = document.createElement("img");
    overlayElement.setAttribute("src", item.iconUrl);
    overlayElement.setAttribute(
      "class",
      "rounded-full transition-all border-4 border-emerald-500 hover:border-8 hover:border-emerald-100"
    );
    const olOverlay = new Overlay({
      stopEvent: false,
      positioning: "center-center",
      element: overlayElement,
    });
    olOverlay.setPosition(fromLonLat([item.lon, item.lat]));
    map.addOverlay(olOverlay);
  });
};

addParksMarkers();

const addGeoJsonLayer = async () => {
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: "./data/parks.geojson",
      format: new GeoJSON(),
    }),
    style: function (feature) {
      const style = new Style({
        fill: new Fill({
          color: "#eeeeee",
        }),
        stroke: new Stroke({
          color: "#999999",
          width: "1",
        }),
      });
      const fillColor = feature.get("fill") || "#eeeeee";
      const fillOpacity = feature.get("fill-opacity") || 1;
      style
        .getFill()
        .setColor([...[...asArray(fillColor)].splice(0, 3), fillOpacity]);
      const strokeColor = feature.get("stroke") || "#999999";
      const strokeWidth = feature.get("stroke-width") || 1;
      const strokeOpacity = feature.get("stroke-opacity") || 1;
      style
        .getStroke()
        .setColor([...[...asArray(strokeColor)].splice(0, 3), strokeOpacity]);
      style.getStroke().setWidth(strokeWidth);
      return style;
    },
  });
  map.addLayer(vectorLayer);
};

addGeoJsonLayer();
