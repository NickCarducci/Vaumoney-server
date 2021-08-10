import React from "react";
import { BaseControl } from "react-map-gl";
import "./Marker.css";

class Marker extends BaseControl {
  state = { showInfos: false, inside: false, eventsWithSameAddress: [] };
  percentToColor(weight) {
    var color1 = [250, 250, 250];
    var color2 = [0, 136, 143];
    var w1 = weight;
    var w2 = 1.4 - w1;
    var timecolor = [
      Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return `rgb(${timecolor})`;
  }
  _render() {
    const { event, longitude, latitude } = this.props;
    const [x, y] = this._context.viewport.project([longitude, latitude]);

    var today = new Date().getTime() / 1000;
    var eventDate = this.props.event.date
      ? new Date(this.props.event.date).getTime() / 1000
      : new Date();
    var chopped = (eventDate - today) / 86400;
    const markerStyle = {
      position: "absolute",
      boxShadow: "#fff",
      left: x,
      top: y,
      userSelect: "none"
    };
    var ch = chopped.toString();
    return (
      <div
        style={markerStyle}
        onMouseEnter={() => this.setState({ showInfos: true })}
        onMouseLeave={() => this.setState({ showInfos: false })}
      >
        {!isNaN(ch) && (
          <div
            style={{
              display: "flex",
              backgroundColor: "white",
              borderRadius: "50px",
              transform: "translate(170%,100%)",
              fontSize: "14px",
              position: "absolute"
            }}
          >
            {ch.includes(".") ? ch.split(".")[0] : ch}d
          </div>
        )}
        {this.state.showInfos &&
          (String(event.id).length > 10 ? (
            <div className="infowindow">
              <div>{event.message}</div>
            </div>
          ) : (
            <div className="infowindowEdm">&nbsp;</div>
          ))}
      </div>
    );
  }
}

export default Marker;
