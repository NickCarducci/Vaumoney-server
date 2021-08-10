import React from "react";
import Marker from "./Marker";
import MappCluster from "./MappCluster";
import PropTypes from "prop-types";
import MapGL, { FlyToInterpolator } from "react-map-gl";
import { Link } from "react-router-dom";
import MappGroup from "./MappGroup";
import { suggestions } from "../funcData";

const metersToPixelsAtMaxZoom = (meters, latitude) =>
  meters / 0.075 / Math.cos((latitude * Math.PI) / 180);
const getDuration = (startViewState, endViewState) => {
  const degPerSecond = 100;
  const deltaLat = Math.abs(startViewState.latitude - endViewState.latitude);
  let deltaLng = Math.abs(startViewState.longitude - endViewState.longitude);
  // Transition to the destination longitude along the smaller half of the circle
  if (deltaLng > 180) deltaLng = 360 - deltaLng;
  return (Math.max(deltaLng, deltaLat) / degPerSecond) * 1000;
};
class Mapbox extends React.Component {
  constructor(props) {
    super(props);
    var dayLiked =
      new Date().getHours() > 4 && new Date().getHours() < 12
        ? true
        : new Date().getHours() > 12 && new Date().getHours() < 20
        ? 1
        : false;

    this.state = {
      preferenceListener: {},
      now: new Date().getTime(),
      periods: [],
      chosenVector: "earthquake",
      dayLiked,
      lastDayLiked: dayLiked,
      showInfoWindow: false,
      viewport: {
        width: "100%",
        height: "100%",
        pitch: 60, // pitch in degrees
        bearing: -60,
        latitude: props.mountSuggestion.center[0],
        longitude: props.mountSuggestion.center[1],
        zoom: 8
      }
    };
    this._cluster = React.createRef();
    this.mapRef = React.createRef();
    this.communityLogo = React.createRef();
  }
  componentWillUnmount = () => {
    window.removeEventListener("resize", this.resizee);
    clearTimeout(this.resizer);
    Object.keys(this.state.preferenceListener).length !== 0 &&
      this.state.preferenceListener.removeListener();
    Object.keys(this.state.preferenceListener1).length !== 0 &&
      this.state.preferenceListener1.removeListener();
  };

  mapboxCity = async (newCityToQuery) => {
    //if (newCityToQuery !== this.props.city)
    await fetch(
      //`https://atlas.microsoft.com/search/address/json?subscription-key={sxQptNsgPsKENxW6a4jyWDWpg6hOQGyP1hSOLig4MpQ}&api-version=1.0&query=${enteredValue}&typeahead={typeahead}&limit={5}&language=en-US`
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${newCityToQuery}.json?limit=2&types=place&access_token=pk.eyJ1Ijoibmlja2NhcmR1Y2NpIiwiYSI6ImNrMWhyZ3ZqajBhcm8zY3BoMnVnbW02dXQifQ.aw4gJV_fsZ1GKDjaWPxemQ`
    )
      .then(async (response) => await response.json())
      .then((body) => {
        var city = body.features[0].place_name;
        if (city) {
          console.log("found " + city);
          this.props.setForumDocs({ forumOpen: true });

          const cityapi = city.split(",")[0].replace(/[, ]+/g, "_");
          //const stateapi = "California";
          const state = newCityToQuery.split(", ")[1];
          const stateapi = state.replace(/ /g, "_");
          this.chooseCitypoint(
            body.features[0].center,
            this.state.distance,
            city,
            cityapi,
            stateapi,
            null
          );
        }
      })
      .catch((err) => {
        console.log(err);
        alert("please try another city name");
      });
  };
  /*mountSugg = (mountSuggestion) => {
    const city = mountSuggestion.place_name;
    const cityapi = city.split(",")[0].replace(/ /g, "_");
    //const stateapi = "California";
    const state = mountSuggestion.place_name.split(", ")[1].split(",")[0];
    const stateapi = state.replace(/ /g, "_");
    this.chooseCitypoint(
      [mountSuggestion.center[1], mountSuggestion.center[0]],
      this.state.distance,
      city,
      cityapi,
      stateapi,
      null,
      true
    );
  };
  handleNewCity = (newCityToQuery) => {
    if (
      this.state.previousCityQuery &&
      newCityToQuery === this.state.previousCityQuery[2]
    ) {
      this.props.sustainPath(newCityToQuery);
      console.log("no need to reload, city re-introduced: " + newCityToQuery);
      this.props.setIndex({ isProfile: null });
      this.props.unloadGreenBlue();
      //this.chooseCitypoint(...this.state.previousCityQuery);
    } else {
      const found = suggestions.find((x) =>
        newCityToQuery.includes(x.place_name)
      );
      if (found) {
        console.log("hard-coded city found: " + newCityToQuery);
        this.props.setForumDocs({ forumOpen: true });

        const cityapi = found.place_name.split(",")[0].replace(/[, ]+/g, "_");
        //const stateapi = "California";
        const state = newCityToQuery.split(", ")[1];
        const stateapi = state.replace(/ /g, "_");
        this.chooseCitypoint(
          found.center,
          this.state.distance,
          found.place_name,
          cityapi,
          stateapi,
          null
        );
      } else if (newCityToQuery) {
        console.log("mapbox/openstreet for: " + newCityToQuery);
        this.mapboxCity(newCityToQuery);
      }
    }
  };
  componentDidUpdate = async (prevProps) => {
    const { pathname, mountSuggestion } = this.props;
    const { newCityToQuery } = this.state;

    if (newCityToQuery && newCityToQuery !== prevProps.newCityToQuery) {
      console.log(
        newCityToQuery.toUpperCase() + " previousQuery, hard-coded or mapbox"
      );
      this.handleNewCity(newCityToQuery);
    }
    if (
      mountSuggestion &&
      pathname === "/" &&
      pathname !== prevProps.pathname
    ) {
      this.props.sustainPath(mountSuggestion.place_name, true);
      console.log("suggesting: " + mountSuggestion.place_name);
      this.mountSugg(mountSuggestion);
    }
  };
  componentDidMount = () => {
    this.props.mountSuggestion &&
      window.location.pathname === "/" &&
      this.mountSugg(this.props.mountSuggestion);

    window.addEventListener("resize", this.resizee);
    var colorPreferenceDark = window.matchMedia(`(prefers-color-scheme: dark)`);
    var colorPreferenceLight = window.matchMedia(
      `(prefers-color-scheme: light)`
    );
    this.setState({
      readyForMap: true,
      preferenceListener: colorPreferenceLight,
      preferenceListener1: colorPreferenceDark,
      colorPreferenceLight: Object.keys(colorPreferenceLight).length !== 0,
      colorPreferenceDark: Object.keys(colorPreferenceDark).length !== 0
    });
  };*/
  onClick = (cluster) =>
    this.resizee(
      false,
      cluster.geometry.coordinates,
      this.state.viewport.zoom < 6
        ? 6
        : this.state.viewport.zoom < 9
        ? 9
        : this.state.viewport.zoom < 13
        ? 13
        : this.state.viewport.zoom < 16
        ? 16
        : this.state.viewport.zoom + 2
    );

  resizee = (commChange, coords, zoom) => {
    if (this.state.map) {
      var viewport = { ...this.state.viewport };
      var { lng, lat } = this.state.map.getCenter();
      viewport.latitude = coords ? coords[1] : lat;
      viewport.longitude = coords ? coords[0] : lng;
      viewport.zoom = zoom ? zoom : this.props.zoomChosen;
      //
      viewport.width = "100%";
      viewport.height = "100%";
      viewport.transitionDuration = "auto";
      viewport.transitionInterpolator = new FlyToInterpolator();
      const timeout = getDuration(this.state.viewport, viewport);
      //
      const handleResize = () => {
        clearTimeout(this.start);
        clearTimeout(this.end);
        this.start = setTimeout(() => {
          this.end = setTimeout(() => {
            console.log("resize map");
            if (commChange) {
              console.log("comm change");
            }
          }, timeout);
        }, 200);
      };
      viewport.onTransitionStart = handleResize;
      this.setState({
        viewport
      });
    }
  };
  componentDidUpdate = (prevProps) => {
    if (this.state.dayLiked !== this.state.lastDayLiked) {
      this.setState({
        lastDayLiked: this.state.dayLiked,
        preferTimeBasedMap: this.state.dayLiked
      });
    }
    if (this.state.map) {
      /*if (
        prevProps.forumOpen !== this.props.forumOpen ||
        prevProps.zoomChosen !== this.props.zoomChosen
      ) {
        this.resizee();
      } else */ if (
        this.props.city !== prevProps.city
      ) {
        this.resizee(true);
      } else if (this.props.center !== prevProps.center) {
        console.log("location change " + this.props.center);
        this.resizee(false, this.props.center);
      }
    }
  };
  updateZoomChosenRadius = () => {
    var distanceSouce = this.state.map.getSource("distance");
    if (distanceSouce) {
      distanceSouce.setPaintProperty("circle-radius", "stops", [
        [12, 0], //[zoom,width]
        [
          22,
          metersToPixelsAtMaxZoom(this.props.distance, this.props.center[0]) //(radiusInMeters, latitude)
        ]
      ]);
      distanceSouce.setData({
        type: "Feature",
        properties: {
          distance: this.props.distance
        },
        geometry: {
          type: "Point",
          coordinates: this.props.center
        }
      });
    }
    //map.panTo(coordinates[i]);
  };

  openCluster = (x) =>
    this.setState(
      {
        openalladdresses: true,
        tellMeAll: x.place_name
      },
      () => this.props.openSurrounds()
    );

  render() {
    var mapThis = this.state.atmLocations ? this.state.atmLocations : [];
    let addresses = [];
    if (mapThis)
      mapThis.map((x) => {
        return addresses.push(x.place_name);
      });
    var object = {};
    var repeats = [];
    addresses.forEach((mountSuggestion) => {
      if (!object[mountSuggestion]) object[mountSuggestion] = 0;
      object[mountSuggestion] += 1;
    });

    for (var prop in object) {
      if (object[prop] >= 2) {
        repeats.push(prop);
      }
    }
    var inLot = mapThis.filter(
      (x) => x && x.place_name === this.state.tellMeAll
    );

    return (
      <div
        style={{
          position: "fixed",
          transition: ".3s ease-in",
          width: "100%",
          height: "100%"
        }}
      >
        {
          //mounted &&
          this.state.readyForMap &&
          !isNaN(this.state.viewport.longitude) &&
          !isNaN(this.state.viewport.latitude) ? (
            /*<canvas style={{ display: "none" }} ref={this.communityLogo} />*/
            <MapGL
              pitchEnabled
              touchRotate
              dragRotate
              ref={this.mapRef}
              minZoom={7}
              onLoad={() => {
                var map = this.mapRef.current && this.mapRef.current.getMap();
                var distance = this.props.distance;
                var data = {
                  type: "Feature",
                  properties: {
                    distance
                  },
                  geometry: {
                    type: "Point",
                    coordinates: this.props.center
                  }
                };
                map &&
                  map.on("load", () => {
                    map.addSource("distance", {
                      type: "geojson",
                      data
                    });
                    map.addLayer({
                      id: "distance",
                      type: "circle",
                      source: "distance",
                      paint: {
                        // make circles larger as the user zooms from z12 to z22
                        "circle-radius": {
                          stops: [
                            [12, 0], //[zoom,width]
                            [
                              22,
                              metersToPixelsAtMaxZoom(
                                this.props.distance,
                                this.props.center[0]
                              ) //(radiusInMeters, latitude)
                            ]
                          ],
                          base: 2
                        },
                        "circle-stroke-color": "rgb(200,200,230)",
                        "circle-stroke-width": 2,
                        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
                        "circle-color": [
                          "match",
                          ["get", "distance"],
                          8,
                          "rgb(255,240,180)",
                          9,
                          "rgb(255,240,160)",
                          10,
                          "rgb(255,220,160)",
                          11,
                          "rgb(255,200,160)",
                          12,
                          "rgb(255,180,160)",
                          13,
                          "rgb(235,200,160)",
                          14,
                          "rgb(215,215,160)",
                          15,
                          "rgb(200,235,160)",
                          16,
                          "rgb(180,255,160)",
                          17,
                          "rgb(160,235,200)",
                          18,
                          "rgb(160,215,215)",
                          19,
                          "rgb(160,200,235)",
                          20,
                          "rgb(160,180,255)",
                          "rgb(160,180,255)"
                        ]
                      }
                    });
                  });
                this.setState({ map });
                // map.getSource('my-data') && map.isSourceLoaded('my-data')

                /* const gl = this.communityLogo.current.getContext("webgl");
                  if (gl === null) {
                    window.alert(
                      "If you are using chrome, to see map:" +
                        "Go to chrome://settings" +
                        "Click the Show advanced settings link" +
                        "Scroll down to the System section and ensure" +
                        "the Use hardware acceleration when available checkbox is checked" +
                        "Go to chrome://flags" +
                        "Ensure that Disable WebGL is disabled (the link should read 'Enable')." +
                        "Relaunch Chrome for any changes to take effect"
                    );
                    return;
                  }*/
              }}
              onError={(err) => window.alert(Object.values(err))}
              onViewportChange={(viewport) =>
                this.setState({
                  viewport
                })
              }
              mapStyle={"mapbox://styles/vaults/cko99xt2i1gp318s5qnjgffyv"}
              mapboxApiAccessToken="pk.eyJ1IjoidmF1bHRzIiwiYSI6ImNrbzk4N2pxODAxMjkycG83Yzd0OW9pMHoifQ.UJ8mJdjk-lJpxBMfgAEoyw"
              {...this.state.viewport}
            >
              {this.state.map && (
                <MappCluster
                  ref={this._cluster}
                  map={this.state.map}
                  element={(cluster) => (
                    <MappGroup
                      openCluster={this.openCluster}
                      mapThis={mapThis}
                      onClick={this.onClick}
                      {...cluster}
                    />
                  )}
                >
                  {mapThis.map((x) => (
                    <Marker
                      cityapi={this.props.cityapi}
                      community={this.props.community}
                      commtype={this.props.commtype}
                      tileChosen={this.props.tileChosen}
                      //
                      id={x.id}
                      key={x.id}
                      latitude={Number(x.center[0])}
                      longitude={Number(x.center[1])}
                      event={x}
                      coordinates={x.center}
                    />
                  ))}
                </MappCluster>
              )}
            </MapGL>
          ) : (
            <div
              style={{
                backgroundColor: "rgb(20,120,60)",
                display: "flex",
                height: "100%",
                width: "100%",
                overflow: "hidden"
              }}
            >
              <img
                style={{
                  display: "flex",
                  height: "100%",
                  width: "auto"
                }}
                alt="error"
                src="https://www.dl.dropboxusercontent.com/s/bt07kz13tvjgz8x/Screen%20Shot%202020-07-18%20at%208.52.33%20AM.png?dl=0"
              />
            </div>
          )
        }
        <div
          //group-cluster; opened
          style={{
            zIndex: "6",
            display: this.state.openalladdresses ? "flex" : "none",
            position: "fixed",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            bottom: "0px",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          <div
            onClick={() => {
              this.props.closeSurrounds();
              this.setState({ openalladdresses: false });
            }}
            style={{
              display: "flex",
              position: "fixed",
              right: "10px",
              bottom: "10px",
              fontSize: "40px"
            }}
          >
            &times;
          </div>
          {inLot.map((x) => (
            <Link
              key={x.id}
              to={"/"}
              style={{
                maxWidth: "calc(100% - 60px)",
                width: "max-content",
                right: "0px",
                display: "flex",
                border: "1px solid black",
                color: "black",
                fontSize: "20px",
                textDecoration: "none"
              }}
            >
              <span
                style={{
                  wordBreak: "break-all"
                }}
              >
                {x.message}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}
Mapbox.propTypes = {
  date: PropTypes.instanceOf(Date),
  onDateChanged: PropTypes.func
};
export default Mapbox;
/*<div
            onClick={this.props.openStart}
            style={{
              display: "flex",
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
              border: `1px solid ${this.state.dayLiked ? "black" : "white"}`,
              backgroundColor: "rgba(200,100,200,.7)",
              height: "45px",
              width: "30px"
            }}
          />
          
          changeIt = async () => {
    var geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [this.props.center[1], this.props.center[0]]
          }
        }
      ]
    };
    console.log("sd");
    this.state.map.setPaintProperty(
      "point",
      "circle-radius",
      this.props.zoomChosen
    );
    await fetch(
      //`https://atlas.microsoft.com/search/place_name/json?subscription-key={sxQptNsgPsKENxW6a4jyWDWpg6hOQGyP1hSOLig4MpQ}&api-version=1.0&query=${enteredValue}&typeahead={typeahead}&limit={5}&language=en-US`
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${
        Math.round(100 * this.state.viewport.longitude) / 100
      },${
        Math.round(100 * this.state.viewport.latitude) / 100
      }.json?limit=1&types=place&access_token=pk.eyJ1Ijoibmlja2NhcmR1Y2NpIiwiYSI6ImNrMWhyZ3ZqajBhcm8zY3BoMnVnbW02dXQifQ.aw4gJV_fsZ1GKDjaWPxemQ`
    )
      .then(async (response) => await response.json())
      .then(
        (body) => {
          var prediction = body.features[0];
          //this.props.startQueryCity();
          this.setState({ queryingWait: true });
          const q = prediction.place_name;
          //const q = prediction.full ? prediction.full : prediction.description; //.replace(", USA", ""); // + " and" + sdiv.subsdiv(lIndex + 1); //console.log(city);
          this.setState({ city: q });
          const cityapi = q.split(", ")[0].replace(/, /g, "%20");
          const location = [prediction.center[1], prediction.center[0]];
          geojson.features[0].geometry.coordinates = [location[1], location[0]];
          //animate();
          this.state.map.getSource("point").setData(geojson);
          const state = prediction.place_name.split(", ")[1].split(", ")[0];
          const stateapi = state.replace(/ /g, "%20");
          //this.props.switchCMapCloser();
          console.log({
            location,
            x: this.props.zoomChosen,
            q,
            cityapi,
            stateapi
          });
          this.props.chooseCitypoint(
            location,
            this.props.zoomChosen,
            q,
            cityapi,
            stateapi
          );
        },
        (err) => console.log(err.message)
      )
      .catch((err) => {
        console.log(err.message);
        alert("please use a neighbor's place_name, none found");
      });
  };*/
/*var canvas = this.mapRef.getMap().getCanvasContainer();
                    // When the cursor enters a feature in the point layer, prepare for dragging.
                    this.mapRef.getMap().on("mouseenter", //"point", 
                     ()=> {
                      /*this.mapRef
                        .getMap()
                        .setPaintProperty("point", "circle-color", "#3bb2d0");
                      this.mapRef.getMap().style.cursor = "move";*
                    });
                    this.mapRef.getMap().on("mouseleave", //"point",  
                    () =>{
                      /*this.mapRef
                        .getMap()
                        .setPaintProperty("point", "circle-color", "#3887be");
                      this.mapRef.getMap().style.cursor = "";*
                    });
                    this.mapRef.getMap().on("mousedown",// "point",  
                    (e) =>{
                      // Prevent the default map drag behavior.
                      e.preventDefault();
                      
                      this.setState({ birdsEyeZoom: true });
                      this.mapRef.getMap().style.cursor = "grab";
                      this.mapRef.getMap().on("mousemove", onMove);
                      this.mapRef.getMap().once("mouseup", onUp);
                    });
                    this.mapRef.getMap().on("touchstart", "point", (e) => {
                      if (e.points.length !== 1) return;
                      // Prevent the default map drag behavior.
                      //e.preventDefault();
                      this.mapRef.getMap().on("touchmove", onMove);
                      this.mapRef.getMap().once("touchend", onUp);
                    });*/
/**
                    this.mapRef.getMap().on(
                      "mousedown", // "point",
                      (e) => {
                        // Prevent the default map drag behavior.
                        //e.preventDefault();
                        if (!this.state.birdsEyeZoom) {
                          this.setState({ birdsEyeZoom: true });
                          this.props.birdsEyeZoomOn();
                        }
                      }
                    );
                    this.mapRef.getMap().on(
                      "mouseup", // "point",
                      (e) => {
                        // Prevent the default map drag behavior.
                        //e.preventDefault();
                        if (!this.state.birdsEyeZoom) {
                          this.setState({ birdsEyeZoom: false });
                          this.props.birdsEyeZoomOff();
                        }
                      }
                    );
                    this.mapRef.getMap().on(
                      "move", // "point",
                      (e) => {
                        // Prevent the default map drag behavior.
                        //e.preventDefault();
                        if (!this.state.birdsEyeZoom) {this.setState({ birdsEyeZoom: true });
                          this.props.birdsEyeZoomOn();
                          clearTimeout(this.bird)
                          this.bird = setTimeout(()=>{
                            this.setState({ birdsEyeZoom: false });
                            this.props.birdsEyeZoomOff();
                          },300)
                        }
                      }
                    ); */
