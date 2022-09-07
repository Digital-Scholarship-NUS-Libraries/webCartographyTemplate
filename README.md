<p align="center">
  <a href="https://nus.edu.sg/nuslibraries">
    <img alt="NUS Libraries" src="public/images/NUSL_logo.png" width="200" />
  </a>
</p>

# A Short Introduction to Cartography on the Web

<a href="https://stackblitz.com/github/Digital-Scholarship-NUS-Libraries/webCartographyTemplate?file=index.html" aria-label="Open in StackBlitz">
  <img src="assets/openInStackblitz.png" style="height: 32px;"/>
</a>
<a href="https://codesandbox.io/s/github/Digital-Scholarship-NUS-Libraries/webCartographyTemplate" aria-label="Open in CodeSandbox">
  <img src="assets/openInCodesandbox.png" style="height: 32px;"/>
</a>

## How to use it

### Editing the story

Edit `index.html` to add chapters to the story.

<img src="assets/indexHtml.png"/>

An html element with the `mapChapter` class will be able to trigger events on the map.

The different events are defined through the different `data` attributes on this element.

`data-chapterlocation` takes geographical coordinates in the shape `[lon,lat]` for instance `[103.816,1.3143]`. When an element with this attribute enters the screen, the map will pan to the given location.

`data-zoom` will set the zoom level of the map. `12` is a good value to show the whole of Singapore. A larger number means a greater magnification.

`data-markers` will add markers on the map. The value should be a path to a csv file in the shape of the example `parks.csv`, for instance `./data/parks.csv`. Start the path from what is found in `public`, replacing `public` by a dot `.` to make sure your website works in most contexts.

Markers can be removed from the map when a chapter leaves the screen by adding `data-removeoverlays="1"`.

`data-geojson` will add shapes defined in a geojson file on the map. Similarly to the csv file, this should be placed in `public/data/` and the value should be a path like `./data/mygeojsonfile.geojson`.

To add a layer from [libmaps](https://libmaps.nus.edu.sg) use `data-addwmslayer` and enter the webservice url (such as https://libmaps.nus.edu.sg/gis/services/Sing_Hist_Maps/1860/MapServer/WMSServer). This url can be found on the libmaps website, under the hamburger menu for each map. But simply changing the year in the given url will work in most cases!

While the marker are overlays, both the geojson data and the wms layer are layers. To remove them when the element leaves the screen, use `data-removeonleave` and indicate as the value what was input in either `data-geojson` or `data-addwmslayer`.

### Managing the source data

Edit `parks.csv`, or create a new csv file with a similar shape, to input data for your markers. Don't forget to add the images in the `public/images/` folder!

<img src="assets/parksCSV.png"/>

Create a geojson file on [geojson.io](https://geojson.io) and upload it to `public/data/`
