import "./style.css";
import "ol/ol.css";

import { Map, View, Overlay } from "ol";
import {
  Tile as TileLayer,
  Vector as VectorLayer,
  Image as ImageLayer,
} from "ol/layer";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke } from "ol/style";
import { asArray } from "ol/color";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { defaults as interactionDefaults } from "ol/interaction/defaults";
import { csv as csvFetch } from "d3-fetch";

const olMap = new Map({
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
  interactions: interactionDefaults({ mouseWheelZoom: false }),
});

const flyTo = (location, done, view) => {
  const duration = 1000;
  const zoom = view.getZoom();
  let parts = 2;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback
  );
  view.animate(
    {
      zoom: zoom - 0.2,
      duration: duration / 2,
    },
    {
      zoom: zoom,
      duration: duration / 2,
    },
    callback
  );
};

const addParksMarkers = async (sourceCSV) => {
  const parksList = await csvFetch(sourceCSV);

  const imageLayer = new ImageLayer();

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
    olMap.addOverlay(olOverlay);
  });
};

const removeOverlays = () => {
  olMap.getOverlays().clear();
};

const addGeoJsonLayer = (sourceGeoJSON) => {
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: sourceGeoJSON,
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
    properties: {
      layerID: sourceGeoJSON,
    },
  });
  olMap.addLayer(vectorLayer);
};

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      flyTo(
        fromLonLat(JSON.parse(entry.target.dataset.chapterlocation)),
        function () {},
        olMap.getView()
      );
      if (entry.target.dataset.markers) {
        addParksMarkers(entry.target.dataset.markers);
      } else if (entry.target.dataset.geojson) {
        addGeoJsonLayer(entry.target.dataset.geojson);
      }
    } else {
      if (entry.target.dataset.removeonleave) {
        const layers = olMap.getLayers().getArray();
        const layersToRemove = layers.filter((item) => {
          return item.get("layerID") == entry.target.dataset.removeonleave;
        });
        layersToRemove.map((layer) => {
          olMap.removeLayer(layer);
        });
      }
      if (entry.target.dataset.removeoverlays) {
        removeOverlays();
      }
    }
  });
});

document.querySelectorAll(".mapChapter").forEach((element) => {
  intersectionObserver.observe(element);
});
