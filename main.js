import "ol/ol.css";
import "./style.css";

import { Map, View, Overlay } from "ol";
import {
  Tile as TileLayer,
  Vector as VectorLayer,
  Image as ImageLayer,
} from "ol/layer";
import {
  OSM as OSMSource,
  Vector as VectorSource,
  TileWMS as TileWMSSource,
} from "ol/source";
import { Style, Fill, Stroke } from "ol/style";
import { asArray } from "ol/color";
import { fromLonLat } from "ol/proj";
import { GeoJSON, WMSCapabilities } from "ol/format";
import { defaults as interactionDefaults } from "ol/interaction/defaults";
import Zoom from 'ol/control/Zoom';
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

const addParksMarkers = async (sourceCSV) => {
  const parksList = await csvFetch(sourceCSV);

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

const parser = new WMSCapabilities();

const addWMSLayer = async (sourceUrl) => {
  const response = await fetch(
    sourceUrl + "?request=GetCapabilities&service=WMS"
  );
  const responseText = await response.text();
  const capabilities = parser.read(responseText);
  const layersString = capabilities.Capability.Layer.Layer.reduce(
    (prev, curr) => {
      return prev + "," + curr.Name;
    },
    ""
  );
  const wmsTileLayer = new TileLayer({
    source: new TileWMSSource({
      url: sourceUrl,
      params: { LAYERS: layersString.substring(1) },
    }),
    properties: {
      layerID: sourceUrl,
    },
  });
  olMap.addLayer(wmsTileLayer);
};

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.target.dataset.markers) {
        addParksMarkers(entry.target.dataset.markers);
      }
      if (entry.target.dataset.geojson) {
        addGeoJsonLayer(entry.target.dataset.geojson);
      }
      if (entry.target.dataset.addwmslayer) {
        addWMSLayer(entry.target.dataset.addwmslayer);
      }
      if (entry.target.dataset.chapterlocation) {
        console.log(fromLonLat(JSON.parse(entry.target.dataset.chapterlocation)))
        olMap.getView().animate({
          center: fromLonLat(JSON.parse(entry.target.dataset.chapterlocation)),
          zoom: entry.target.dataset.zoom,
          duration: 750
        });
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

// this allows interacting with the map in the browser console for easy debugging and experimenting
window.olmap = olMap;
