import React from "react";
import "./styles.css";
import Cash from "./Cash";
import TDB, { suggestions } from "./funcData";
import firebase from "./init-firebase";
import Mapbox from "./Mapbox";
import Nav from "./Nav";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    var mountSuggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)];
    const city = mountSuggestion.place_name;
    let tdb = new TDB();
    this.state = {
      distance: 15,
      y: 15,
      zoomChosen: 8,
      radioChosen: 8,
      scrollChosen: 8,
      city,
      mountSuggestion,
      deviceLocation: false,
      tdb,
      users: [],
      user: undefined,
      auth: undefined,
      fundingSources: [],
      businesses: [],
      transactions: []
    };
  }

  checkPathname = async (pathname) => {
    const drop = (forumDoc, id) => {
      console.log(forumDoc + " " + id);
      this.setState(
        {
          dropToCheck: id
        },
        () =>
          this.props.setIndex({
            isPost: id
          })
      );
    };
    const drops = [
      "forum",
      "oldElection",
      "election",
      "case",
      "oldCase",
      "budget",
      "oldBudget",
      "ordinance"
    ];
    if (this.state.pathAliasDiffCity && !this.justthisonce) {
      this.justthisonce = true;
    } else {
      this.setState(
        { pathAliasDiffCity: null, newCityToQuery: null },
        async () => {
          this.justthisonce = false;
          var isHome = pathname === "/";
          if (!isHome) {
          }
        }
      );
    }
  };
  componentDidMount = async () => {
    const result = await this.state.tdb.readKey();
    result &&
      Object.keys(result).length !== 0 &&
      result.constructor === Object &&
      console.log(`token ${Object.keys(result)} found`);
    result &&
      Object.keys(result).length !== 0 &&
      result.constructor === Object &&
      this.setState({ access_token: Object.keys(result) });

    firebase
      .firestore()
      .collection("users")
      .onSnapshot((querySnapshot) => {
        let users = [];
        querySnapshot.docs.forEach((doc) => {
          if (doc.exists) {
            let data = doc.data();
            users.push(data);
            if (querySnapshot.docs.length === users.length) {
              this.getUserInfo();
              this.setState({ users });
            }
          }
          return console.log(`${users.length} users signed up`);
        });
      });
  };
  getUserInfo = () => {
    this.setState({ stop: true }, () => {
      firebase.auth().onAuthStateChanged(async (meAuth) => {
        if (meAuth) {
          const compile = (querySnapshot, meAuth, b) => {
            if (querySnapshot.exists) {
              var foo = querySnapshot.data();
              foo.id = querySnapshot.id;
              var user = { ...foo, ...b };
              this.setState(
                {
                  user,
                  auth: meAuth,
                  loggedOut: false
                },
                () => {
                  if (
                    user.username &&
                    user.name &&
                    user.surname &&
                    user.email &&
                    user.address1 &&
                    user.city &&
                    user.state &&
                    user.ZIP &&
                    user.DOB &&
                    user.SSN &&
                    meAuth.uid
                  ) {
                    if (!user.mastercardId) {
                      console.log(
                        "user not a bankee, no mastercardId customer ID"
                      );
                    } else if (!this.state.loaded && user) {
                      this.setState({ loaded: true }, () =>
                        this.getTheGoods(user)
                      );
                    }
                  }
                }
              );
            } else {
              this.setState(
                {
                  user: b,
                  auth: meAuth,
                  loggedOut: false
                },
                () => console.log("not a bankee")
              );
            }
          };
          const privateStuff = (querySnapshot, meAuth) => {
            if (querySnapshot.exists) {
              let b = querySnapshot.data();
              b.id = querySnapshot.id;
              firebase
                .firestore()
                .collection("userDatas")
                .doc(meAuth.uid)
                .onSnapshot(
                  async (querySnapshot) => {
                    compile(querySnapshot, meAuth, b);
                  },
                  (e) => console.log(e.message)
                );
            }
          };
          meAuth.getIdToken(/* forceRefresh */ true).then(async (idToken) =>
            firebase
              .firestore()
              .collection("users")
              .doc(meAuth.uid)
              .onSnapshot((querySnapshot) => {
                privateStuff(querySnapshot, meAuth);
              })
          );
        }
      });
    });
  };
  chooseCitypoint = async (
    center,
    distance,
    city,
    cityapi,
    stateapi,
    tile,
    noLoad
  ) => {
    if (city.replace(/[ ]+/g, "_") !== this.props.pathname) {
      this.props.sustainPath(city);
    }
    console.log(city + " fetching");
    /**
          var Lat = center[0];
          var Length = distance * 1.60934;
          var Ratio = 100;
          var WidthPixel = window.innerWidth;
          this.calculateZoom(WidthPixel, Ratio, Lat, Length, city);
         */

    this.setState(
      {
        previousCityQuery: [
          center,
          distance,
          city,
          cityapi,
          stateapi,
          tile,
          noLoad
        ],
        center
      },
      () => {}
    );
  };
  sustainPath = (city, once) => {
    clearTimeout(this.susPath);
    this.susPath = setTimeout(() => {
      this.setState(
        {
          pathAliasDiffCity: once ? city : this.state.pathAliasDiffCity
        },
        () => this.props.history.push(city.replace(/[ ]+/g, "_"))
      );
    }, 200);
  };
  render() {
    return (
      <div
        style={{
          textAlign: "center",
          minHeight: "100vh",
          width: "100%"
        }}
      >
        <Nav
          center={this.state.center}
          city={this.state.city}
          setApp={(x) => this.setState(x)}
          open={() => this.setState({ vaumoneyOpen: true })}
          deviceLocation={this.state.deviceLocation}
          chooseCitypoint={this.chooseCitypoint}
        />

        <Mapbox
          center={this.state.center}
          city={this.state.city}
          mountSuggestion={this.state.mountSuggestion}
          chooseCitypoint={this.chooseCitypoint}
          deviceLocation={this.state.deviceLocation}
          sustainPath={this.sustainPath}
        />
        <Cash
          getTheGoods={this.getTheGoods}
          prepared={
            this.state.user &&
            this.state.user.username &&
            this.state.user.name &&
            this.state.user.surname &&
            this.state.user.email &&
            this.state.user.address1 &&
            this.state.user.city &&
            this.state.user.state &&
            this.state.user.ZIP &&
            this.state.user.DOB &&
            this.state.user.SSN &&
            this.state.auth.uid
          }
          transactions={this.state.transactions}
          businesses={this.state.businesses}
          fundingSources={this.state.fundingSources}
          users={this.state.users}
          user={this.state.user}
          auth={this.state.auth}
          access_token={this.state.access_token}
          deletePouchToken={() => this.state.tdb.deleteKeys()}
          setPouchToken={async (access_token) => {
            this.setState({ access_token });
            this.setPouchToken(access_token, "setKey");
          }}
          vaumoneyOpen={this.state.vaumoneyOpen}
          closeVaumoney={() => this.setState({ vaumoneyOpen: false })}
          defaultSendingFund={this.state.defaultSendingFund}
        />
      </div>
    );
  }
}
