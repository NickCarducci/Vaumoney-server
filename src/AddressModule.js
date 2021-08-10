import React from "react";
import { stateCity } from "./funcData";
import firebase from "./init-firebase";

class AddressModule extends React.Component {
  constructor(props) {
    super(props);
    const { entity } = this.props;
    this.state = {
      predictions: [],
      address1: entity !== undefined && entity.address1 ? entity.address1 : "",
      address2: entity !== undefined && entity.address2 ? entity.address2 : "",
      city: entity !== undefined && entity.city ? entity.city : "",
      state: entity !== undefined && entity.state ? entity.state : "",
      ZIP: entity !== undefined && entity.ZIP ? entity.ZIP : ""
    };
  }

  render() {
    const { entity } = this.props;
    return (
      <div
        onMouseEnter={() => this.setState({ hovering: "address" })}
        onMouseLeave={() => this.setState({ hovering: "" })}
        style={{
          backgroundColor:
            this.state.hovering === "address" ? "rgba(20,20,20,.3)" : ""
        }}
      >
        {(this.state.editAddress || !entity.address1) &&
        ((entity.username &&
          entity.name &&
          entity.surname &&
          entity.email &&
          entity.SSN &&
          entity.DOB) ||
          this.props.isBusiness) ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch(
                //`https://atlas.microsoft.com/search/place_name/json?subscription-key={sxQptNsgPsKENxW6a4jyWDWpg6hOQGyP1hSOLig4MpQ}&api-version=1.0&query=${enteredValue}&typeahead={typeahead}&limit={5}&language=en-US`
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.state.addressQuery}.json?limit=2&access_token=pk.eyJ1Ijoibmlja2NhcmR1Y2NpIiwiYSI6ImNrMWhyZ3ZqajBhcm8zY3BoMnVnbW02dXQifQ.aw4gJV_fsZ1GKDjaWPxemQ`
              )
                .then(async (response) => await response.json())
                .then(
                  (body) => {
                    console.log(body.features);
                    this.setState({
                      predictions: body.features
                    });
                  },
                  (err) => console.log(err)
                )
                .catch((err) => {
                  console.log(err);
                  this.setState({ place_name: "", center: [] });
                  alert("please use a neighbor's place_name, none found");
                });
            }}
          >
            <label>address1</label>
            <input
              required
              type="text"
              id="address1"
              placeholder="Address"
              value={this.state.addressQuery}
              onChange={(e) => this.setState({ addressQuery: e.target.value })}
            />
            <div>
              {this.state.predictions.length > 0 &&
                this.state.predictions.map((x) => {
                  return (
                    <div
                      style={{
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "200px",
                        height: "min-content",
                        margin: "10px 0px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }}
                      onClick={() => {
                        const address1 = x.place_name.split(", ")[0];
                        const city = x.place_name.split(", ")[1].split(", ")[0];
                        const statefull = x.place_name.split(", ")[2];
                        const ZIP = statefull.substr(
                          statefull.lastIndexOf(/[\d]+/) - 4,
                          statefull.length
                        );
                        var state = stateCity.find((x) =>
                          statefull.includes(x.name)
                        );
                        !this.state.isBusiness
                          ? this.props.updateBusinessAddress({
                              address1,
                              address2: this.state.address2,
                              city,
                              state: state.abbreviation,
                              ZIP
                            })
                          : firebase
                              .firestore()
                              .collection("userDatas")
                              .doc(this.props.auth.uid)
                              .update({
                                address1,
                                address2: this.state.address2,
                                city,
                                state: state.abbreviation,
                                ZIP
                              });
                      }}
                    >
                      {x.place_name}
                    </div>
                  );
                })}
            </div>
            <div
              style={
                this.state.address1
                  ? {
                      border: "1px solid",
                      borderRadius: "3px",
                      width: "120px",
                      height: "min-content",
                      margin: "10px 0px",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      left: "50%",
                      position: "relative",
                      transform: "translateX(-50%)"
                    }
                  : {
                      borderRadius: "3px",
                      width: "120px",
                      height: "min-content",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      left: "50%",
                      position: "relative",
                      transform: "translateX(-50%)"
                    }
              }
            >
              {entity.address1}
              <br />
              {entity.address2}
              <br />
              {entity.city}
              {entity.address1 && ", "}
              {entity.state}
            </div>
            <button
              type="submit"
              style={{
                left: "50%",
                top: "-30px",
                position: "relative",
                transform: "translateX(-50%)",
                display: "flex",
                width: "min-content"
              }}
            >
              Search
            </button>
          </form>
        ) : !this.state.editAddress && entity.address1 ? (
          <div
            style={{
              flexDirection: "column",
              border: "1px solid",
              borderRadius: "3px",
              width: "120px",
              height: "min-content",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              left: "50%",
              position: "relative",
              transform: "translateX(-50%)"
            }}
          >
            {entity.address1}
            <br />
            <input
              placeholder="optional address line"
              style={{ width: "100%" }}
              value={this.state.address2}
              onChange={(e) => this.setState({ address2: e.target.value })}
            />
            {entity.city}
            {entity.address1 && ", "}
            {entity.state}
          </div>
        ) : null}
        {entity.address1 && (
          <div
            onClick={() => {
              this.setState({
                address1: "",
                address2: "",
                city: "",
                state: ""
              });
              !this.props.isBusiness &&
                firebase
                  .firestore()
                  .collection("userDatas")
                  .doc(this.props.auth.uid)
                  .update({
                    address1: "",
                    address2: "",
                    city: "",
                    state: ""
                  });
            }}
            style={{
              display: "flex",
              position: "relative",
              left: "-9px",
              top: "-40px",
              fontSize: "12px",
              height: "56px",
              width: "56px",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            reset
          </div>
        )}
      </div>
    );
  }
}
export default AddressModule;
