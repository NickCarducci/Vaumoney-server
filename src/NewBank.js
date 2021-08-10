import React from "react";
import Login from "./Login";
import firebase from "./init-firebase";
import FundingSource from "./FundingSource";
import AddressModule from "./AddressModule";
import OwnerModule from "./OwnerModule";

class NewBank extends React.Component {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const userIsLoaded = user !== undefined;
    this.state = {
      preferMicro: false,
      biztype: "Sole Proprietorship",
      businesses: [],
      ein: "",
      bizname: "",
      newSurname: userIsLoaded ? user.surname : "",
      newName: userIsLoaded ? user.name : "",
      newUsername: userIsLoaded ? user.username : "",
      newEmail: userIsLoaded && user.email ? user.email : "",
      newBirthday: userIsLoaded && user.DOB ? user.DOB : "",
      last4: userIsLoaded && user.SSN ? user.SSN : ""
    };
  }
  handleSubmit = async () => {
    const { user } = this.props;
    const add = (mastercardId) =>
      firebase.firestore().collection("users").doc(this.props.auth.uid).update({
        mastercardId
      });
    if (!user.mastercardId) {
      await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/verifiedCustomerVaumoney",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            correlationId: this.props.auth.uid,
            firstName: user.name,
            lastName: user.surname,
            email: user.confirmedEmail,
            DOB: user.DOB,
            SSN: user.SSN,
            address1: user.address1,
            address2: user.address2,
            city: user.city,
            state: user.state,
            ZIP: user.ZIP
          })
        }
      )
        .then(async (res) => await res.json())
        .then(async (result) => {
          if (result._embedded.errors[0].code === "Duplicate") {
            console.log("email already exists with dwolla");
            var confirmedEmail = encodeURIComponent(user.confirmedEmail);
            await fetch(
              "https://us-central1-vaumoney.cloudfunctions.net/searchCustomerVaumoney",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  Accept: "application/json"
                },
                body: JSON.stringify({
                  confirmedEmail
                })
              }
            )
              .then(async (res) => await res.json())
              .then((result) => {
                /*var mastercardId = result.split(
                "https://api-sandbox.dwolla.com/customers/"
              )[1];*/
                console.log(result);
                var mastercardId = result._embedded["customers"][0].id;
                console.log(mastercardId);
                add(mastercardId);
                console.log("!");
                this.deployNewFundingSource(mastercardId);
              })
              .catch((err) => console.log(err.message));
          } else {
            /*var mastercardId = result.split(
          "https://api-sandbox.dwolla.com/customers/"
        )[1];*/
            var mastercardId = result._embedded["customers"][0].id;
            console.log(mastercardId);
            add(mastercardId);
            console.log("!");
            this.deployNewFundingSource(mastercardId);
          }
        })
        .catch(async (err) => {
          console.log(err.message);
        });
    } else {
      console.log(
        `Dwolla user - ${user.mastercardId} deploying instant access verification for Vaumoney`
      );
      this.deployNewFundingSource(user.mastercardId);
    }
  };
  deployNewFundingSource = async (x) => {
    console.log(x);
    if (!this.state.preferMicro) {
      await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/initiateIAVVaumoney",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            mastercardId: x
          })
        }
      )
        .then(async (res) => await res.json())
        .then((result) => {
          console.log("!");
          console.log(result);
          /*{
            "_links":
            {
              "self":
              {
                "href": "https://api-sandbox.dwolla.com/customers/7d5d65b8-0b66-48c9-b018-cc691c4bd010/iav-token",
                  "type": "application/vnd.dwolla.v1.hal+json",
                    "resource-type": "iav-token"
              }
            },
            "token": "RLXvNpcR7QEX1frib9ZhbDMfaTAV7NPZPNl2ufnMPhvsLQYnWb"
          }*/
          if (result) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.src = "https://cdn.dwolla.com/1/dwolla.js";
            script.onload = () => {
              console.log("ok");
              const dwolla = window.dwolla;
              // create a token
              dwolla.configure("sandbox");
              dwolla.iav.start(
                result,
                {
                  backButton: true,
                  container: "iavContainer",
                  stylesheets: [
                    "https://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext"
                  ],
                  //microDeposits: "true",
                  fallbackToMicroDeposits: true
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                    window.alert(err);
                  }
                  if (res._links) {
                    console.log(res);
                    window.alert(
                      `congrats! new funding source initiated with id: ${res._links.href}`
                    );
                    window.location.reload();
                    this.setState({
                      newBankplease: false
                    });
                  }
                }
              );
            };
            document.body.appendChild(script);
          } else
            return window.alert(
              "no instant verification token returned in successful response"
            );
        })
        .catch((err) => {
          console.log("!");
          console.log(err.message);
        });
    } else {
      console.log("!");
      await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/verifiedFundingVaumoney",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            //Allow: "*",
            Accept: "application/json"
          },
          body: JSON.stringify({
            mastercardId: x,
            routingNumber: this.state.routingNumber,
            accountNumber: this.state.accountNumber,
            name: this.state.uniqueName
          })
        }
      )
        .then(async (res) => await res.json())
        .then(async (result) => {
          console.log(result);
          /*var fundingSource = result.split(
          "https://api-sandbox.dwolla.com/funding-sources/"
        )[1];*/
          var fundingSource = result.id;
          await fetch(
            "https://us-central1-vaumoney.cloudfunctions.net/initiateMicroVaumoney",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                Allow: "*",
                Accept: "application/json"
              },
              body: JSON.stringify({
                fundingSource
              })
            }
          )
            .then(async (res) => await res.json())
            .then((result) => {
              console.log(result);
              if (result.code === 201)
                window.alert(
                  "congrats! now verify your account with two microdeposits " +
                    "to send money from this accounting and routing number!" +
                    " It usually takes 1-2 days to settle in your account."
                );
            })
            .catch((err) => {
              console.log(err.message);
            });
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };
  render() {
    const { user } = this.props;
    const userIsLoaded = user !== undefined;
    function intToString(v) {
      var abbs = ["", "k", "m", "b", "t"];
      var abbIndex = Math.floor(("" + v).length / 3);
      var num = parseFloat(
        (abbIndex !== 0 ? v / Math.pow(1000, abbIndex) : v).toPrecision(2)
      );
      if (num % 1 !== 0) {
        num = num.toFixed(1);
      }
      return num + abbs[abbIndex];
    }
    return (
      <div
        style={
          this.props.openNewBank
            ? {
                flexDirection: "column",
                display: "flex",
                position: "fixed",
                alignItems: "center",
                width: "50%",
                maxWidth: "100vw",
                minWidth: "200px",
                height: "100%",
                transform: "translateX(0%)",
                transition: ".3s ease-out",
                backgroundColor: "white",
                opacity: "1",
                zIndex: "9999",
                overflowX: "hidden",
                overflowY: "auto"
              }
            : {
                flexDirection: "column",
                display: "flex",
                position: "fixed",
                width: "50%",
                height: "100%",
                transform: "translateX(100%)",
                transition: ".3s ease-out",
                backgroundColor: "white",
                opacity: "0"
              }
        }
      >
        <div
          style={{
            zIndex: "9999",
            justifyContent: "center",
            display: "flex",
            position: "relative",
            width: "min-content"
          }}
        >
          {!this.state.newBusinessplease &&
            !this.state.newBankplease &&
            !this.props.openBusinesses &&
            this.props.fundingSources.length > 0 && (
              <div
                onMouseEnter={() => this.setState({ banksbtn: true })}
                onMouseLeave={() => this.setState({ banksbtn: false })}
                style={
                  this.state.banksbtn || this.props.openBanks
                    ? {
                        display: "flex",
                        position: "relative",
                        justifyContent: "center",
                        zIndex: "9999",
                        marginTop: "20px",
                        borderRadius: "6px",
                        border: "1px solid",
                        width: "60px",
                        backgroundColor: "teal",
                        color: "white"
                      }
                    : {
                        display: "flex",
                        position: "relative",
                        justifyContent: "center",
                        zIndex: "9999",
                        marginTop: "20px",
                        borderRadius: "6px",
                        border: "1px solid",
                        backgroundColor: "white",
                        width: "60px"
                      }
                }
                onClick={this.props.toggleBanks}
              >
                Banks
              </div>
            )}
          {/*!this.state.newBusinessplease &&
            !this.state.newBankplease &&
            !this.props.openBanks &&
            this.props.fundingSources.length > 0 && (
              <div
                onMouseEnter={() => this.setState({ bizbtn: true })}
                onMouseLeave={() => this.setState({ bizbtn: false })}
                style={
                  this.state.bizbtn || this.props.openBusinesses
                    ? {
                        display: "flex",
                        position: "relative",
                        justifyContent: "center",
                        zIndex: "9999",
                        marginTop: "20px",
                        borderRadius: "6px",
                        border: "1px solid",
                        width: "90px",
                        backgroundColor: "teal",
                        color: "white"
                      }
                    : {
                        display: "flex",
                        position: "relative",
                        justifyContent: "center",
                        zIndex: "9999",
                        marginTop: "20px",
                        borderRadius: "6px",
                        border: "1px solid",
                        backgroundColor: "white",
                        width: "90px"
                      }
                }
                onClick={this.props.toggleBusinesses}
              >
                Businesses
              </div>
            )*/}
        </div>
        <br />
        <br />
        {this.props.openBanks &&
          this.props.fundingSources.map((x) => {
            return x._embedded["funding-sources"].map((x) => {
              if (!x.removed) {
                console.log(x);
                return (
                  <FundingSource
                    user={user}
                    transactions={this.props.transactions}
                    tryDelete={this.props.tryDelete}
                    x={x}
                    getTheGoods={this.props.getTheGoods}
                  />
                );
              } else return null;
            });
          })}
        {(this.props.openBanks || this.state.newBankplease) && (
          <div
            style={{
              bottom: "10px",
              zIndex: "9999",
              display: "flex",
              position: "fixed",
              fontSize: "10px",
              backgroundColor: "white",
              color: "rgb(140,160,140)"
            }}
          >
            We claim no responsibility for mistakes made by dwolla or your bank,
            only our own.&nbsp;
            {this.state.mistakes
              ? `${intToString(this.state.mistakes.length)}/`
              : `${0}/`}
            {this.state.appTransactions
              ? `${intToString(this.state.appTransactions.length)} transactions`
              : `0 transactions`}
          </div>
        )}
        <div
          style={{
            left: "0px",
            flexDirection: "column",
            display: "flex",
            position: "absolute",
            height: "min-content",
            width: "100%"
          }}
        >
          {this.props.openBanks ? (
            <div
              style={{
                left: "0px",
                zIndex: "9998",
                color: "white",
                backgroundColor: "teal",
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={this.props.closebanks}
            >
              {"<"}
            </div>
          ) : this.state.newBankplease ? (
            <div
              style={{
                zIndex: "9998",
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={() => this.setState({ newBankplease: false })}
            >
              {"<"}
            </div>
          ) : this.props.openBusinesses ? (
            <div
              style={{
                zIndex: "9998",
                color: "white",
                backgroundColor: "teal",
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={this.props.closebusinesses}
            >
              {"<"}
            </div>
          ) : this.state.newBusinessplease ? (
            <div
              style={{
                zIndex: "9998",
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={() => this.setState({ newBusinessplease: false })}
            >
              {"<"}
            </div>
          ) : (
            <div
              style={{
                zIndex: "9998",
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={this.props.close}
            >
              &times;
            </div>
          )}
          {!this.state.newBankplease &&
            !this.props.openBanks &&
            !this.state.newBusinessplease &&
            !this.props.openBusinesses && (
              <div>
                <form
                  onMouseEnter={() => this.setState({ hovering: "username" })}
                  onMouseLeave={() => this.setState({ hovering: "" })}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      !this.state.usernameTaken &&
                      (user.username !== this.state.newUsername ||
                        user.name !== this.state.newName ||
                        user.surname !== this.state.newSurname)
                    ) {
                      firebase
                        .firestore()
                        .collection("users")
                        .doc(this.props.auth.uid)
                        .update({
                          surname: this.state.newSurname,
                          name: this.state.newName,
                          username: this.state.newUsername
                        });
                    } else
                      return console.log(
                        this.state.usernameTaken,
                        user.username,
                        this.state.newUsername,
                        user.name,
                        this.state.newName,
                        user.surname,
                        this.state.newSurname
                      );
                  }}
                  style={
                    this.state.hovering === "username"
                      ? { backgroundColor: "rgba(20,20,20,.3)" }
                      : {}
                  }
                >
                  <div>
                    <label>
                      {this.state.usernameTaken && "please use another"}Username
                    </label>
                    <input
                      autoComplete="off"
                      minLength="2"
                      type="text"
                      id="username"
                      placeholder="Name"
                      value={this.state.newUsername}
                      onChange={(e) => {
                        var query = e.target.value;
                        if (query) {
                          var therealready = this.props.users.find(
                            (x) =>
                              x.username === query &&
                              user.username !== x.username
                          );
                          if (therealready) {
                            this.setState({ usernameTaken: true });
                          } else if (this.state.usernameTaken) {
                            this.setState({ usernameTaken: false });
                          }
                        }

                        this.setState({ newUsername: query });
                      }}
                    />
                  </div>
                  <div>
                    <label>firstName</label>
                    <input
                      autoComplete="off"
                      minLength="2"
                      type="text"
                      id="firstName"
                      placeholder="Name"
                      value={this.state.newName}
                      onChange={(e) =>
                        this.setState({ newName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>lastName</label>
                    <input
                      autoComplete="off"
                      minLength="2"
                      type="text"
                      id="lastName"
                      placeholder="Surname"
                      value={this.state.newSurname}
                      onChange={(e) =>
                        this.setState({ newSurname: e.target.value })
                      }
                    />
                  </div>
                  {!this.state.usernameTaken &&
                    ((userIsLoaded &&
                      (user.username !== this.state.newUsername ||
                        "" === this.state.newUsername)) ||
                      (userIsLoaded &&
                        (user.name !== this.state.newName ||
                          "" === this.state.newName)) ||
                      (userIsLoaded &&
                        (user.surname !== this.state.newSurname ||
                          "" === this.state.newSurname))) && (
                      <button type="submit">Save</button>
                    )}
                </form>
                {user === undefined && (
                  <Login
                    pleaseClose={this.props.pleaseClose}
                    users={this.props.users}
                    user={user}
                    auth={this.props.auth}
                  />
                )}
                <br />
                {userIsLoaded &&
                  user.username &&
                  user.name &&
                  user.surname &&
                  user.username === this.state.newUsername &&
                  user.name === this.state.newName &&
                  user.surname === this.state.newSurname && (
                    <div>
                      {this.state.changePrivate ||
                      user.email === "" ||
                      user.SSN === "" ||
                      user.DOB === "" ? (
                        <form
                          onMouseEnter={() =>
                            this.setState({ hovering: "private" })
                          }
                          onMouseLeave={() => this.setState({ hovering: "" })}
                          onSubmit={(e) => {
                            e.preventDefault();
                            var start = { ...this.state };
                            if (
                              start.newEmail &&
                              start.newBirthday &&
                              start.last4
                            ) {
                              const goset = firebase
                                .firestore()
                                .collection("userDatas")
                                .doc(this.props.auth.uid)
                                .set({
                                  email: start.newEmail,
                                  DOB: start.newBirthday,
                                  SSN: start.last4
                                });
                              const goupdate = firebase
                                .firestore()
                                .collection("userDatas")
                                .doc(this.props.auth.uid)
                                .update({
                                  email: start.newEmail,
                                  DOB: start.newBirthday,
                                  SSN: start.last4
                                });
                              if (
                                user.email ||
                                user.SSN ||
                                user.DOB ||
                                user.ZIP ||
                                user.address1 ||
                                user.address2 ||
                                user.city ||
                                user.state
                              ) {
                                if (!user.confirmedEmail) {
                                  firebase
                                    .auth()
                                    .sendSignInLinkToEmail(start.newEmail, {
                                      url: window.location.href,
                                      handleCodeInApp: true
                                    })
                                    .then(() => {
                                      goupdate();
                                    })
                                    .catch((err) => {
                                      console.log(err.message);
                                    });
                                } else {
                                  goupdate();
                                }
                              } else {
                                firebase
                                  .auth()
                                  .sendSignInLinkToEmail(start.newEmail, {
                                    url: window.location.href,
                                    handleCodeInApp: true
                                  })
                                  .then(() => {
                                    goset();
                                  })
                                  .catch((err) => {
                                    console.log(err.message);
                                  });
                              }
                              this.state.changePrivate &&
                                this.setState({ changePrivate: false });
                            } else
                              return window.alert(
                                "please enter email, date of birth & the last 4 digits of social security number to bank with us"
                              );
                          }}
                          style={
                            this.state.hovering === "private"
                              ? {
                                  backgroundColor: "rgba(20,20,20,.3)",
                                  paddingBottom: "10px"
                                }
                              : { paddingBottom: "10px" }
                          }
                        >
                          Private / To add bank
                          <br />
                          <div>
                            <label>email</label>
                            <input
                              autoComplete="off"
                              type="email"
                              id="email"
                              placeholder="Email"
                              value={this.state.newEmail}
                              onChange={(e) =>
                                this.setState({ newEmail: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label>dateOfBirth</label>
                            <input
                              type="date"
                              id="dateOfBirth"
                              placeholder="Birthday"
                              value={this.state.newBirthday}
                              onChange={(e) =>
                                this.setState({ newBirthday: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label>last 4 of ssn</label>
                            <input
                              autoComplete="off"
                              type="number"
                              id="ssn"
                              placeholder="Social security number"
                              value={this.state.last4}
                              onChange={(e) =>
                                this.setState({ last4: e.target.value })
                              }
                            />
                          </div>
                          <button
                            type="submit"
                            style={{
                              left: "50%",
                              top: "5px",
                              position: "relative",
                              transform: "translateX(-50%)",
                              display: "flex",
                              width: "min-content"
                            }}
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <div
                          onClick={() => {
                            var answer = window.confirm(
                              "edit your private email, ssn or dob?"
                            );

                            if (answer) {
                              this.setState({ changePrivate: true });
                            }
                          }}
                        >
                          Locked
                          <br />
                          <div style={{ fontSize: "12px" }}>
                            ["email", "ssn", "dob"]
                          </div>
                        </div>
                      )}
                      <br />
                      <AddressModule entity={user} auth={this.props.auth} />
                    </div>
                  )}
              </div>
            )}
          {userIsLoaded &&
            !this.props.openBanks &&
            !this.props.openBusinesses &&
            !this.state.newBusinessplease &&
            user.username &&
            user.name &&
            user.surname &&
            user.username === this.state.newUsername &&
            user.name === this.state.newName &&
            user.surname === this.state.newSurname &&
            user.address1 && (
              <div
                onMouseEnter={() => this.setState({ hoverbankbutton: true })}
                onMouseLeave={() => this.setState({ hoverbankbutton: false })}
                style={
                  this.state.hoverbankbutton || this.state.newBankplease
                    ? {
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "120px",
                        height: "33px",
                        top: "-40px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }
                    : {
                        color: "white",
                        backgroundColor: "teal",
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "120px",
                        height: "33px",
                        top: "-40px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }
                }
                onClick={
                  this.state.newBankplease
                    ? () => this.setState({ newBankplease: false })
                    : user.confirmedEmail
                    ? () => this.setState({ newBankplease: true })
                    : () => {
                        firebase
                          .auth()
                          .signInWithEmailLink(user.email, window.location.href)
                          .then((result) => {
                            console.log(result);
                            firebase
                              .firestore()
                              .collection("userDatas")
                              .doc(this.props.auth.uid)
                              .update({
                                confirmedEmail: user.email
                              });
                            console.log(
                              "nice! email confirmed.. now you can add banks"
                            );
                          })
                          .catch((err) => {
                            console.log(err.message);
                          });
                      }
                }
              >
                {this.state.newBankplease ? "Back" : "Add bank"}
              </div>
            )}
          {/*userIsLoaded &&
            !this.props.openBusinesses &&
            !this.props.openBanks &&
            !this.state.newBankplease &&
            user.username &&
            user.name &&
            user.surname &&
            user.username === this.state.newUsername &&
            user.name === this.state.newName &&
            user.surname === this.state.newSurname &&
            user.address1 &&
            user.confirmedEmail && (
              <div
                onMouseEnter={() =>
                  this.setState({ hoverbusinessbutton: true })
                }
                onMouseLeave={() =>
                  this.setState({ hoverbusinessbutton: false })
                }
                style={
                  this.state.hoverbusinessbutton || this.state.newBusinessplease
                    ? {
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "120px",
                        height: "33px",
                        top: "-40px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }
                    : {
                        color: "white",
                        backgroundColor: "teal",
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "120px",
                        height: "33px",
                        top: "-40px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }
                }
                onClick={
                  this.state.newBusinessplease
                    ? () => this.setState({ newBusinessplease: false })
                    : () => {
                        this.props.getBizCodes();
                        this.setState({ newBusinessplease: true });
                      }
                }
              >
                {this.state.newBusinessplease ? "Back" : "Add Business"}
              </div>
            )*/}
          {userIsLoaded &&
            user.name &&
            user.surname &&
            user.name === this.state.newName &&
            user.surname === this.state.newSurname &&
            this.state.newBankplease && (
              <form
                style={{
                  flexDirection: "column",
                  top: "-40px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  left: "50%",
                  position: "relative",
                  transform: "translateX(-50%)"
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  this.handleSubmit();
                  /*if (
                    this.state.routingNumber &&
                    this.state.accountNumber &&
                    this.state.uniqueName
                  ) {
                    this.handleSubmit();
                  } else
                    return window.alert(
                      "please complete the form to add the account"
                    );*/
                }}
              >
                {/*<br /> Add bank
                <br />
                <div>
                  <input
                    type="text"
                    id="name"
                    placeholder="Unique name"
                    value={this.state.uniqueName}
                    onChange={e =>
                      this.setState({ uniqueName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Routing number</label>
                  <input
                    type="text"
                    id="routingNumber"
                    placeholder="273222226"
                    value={this.state.routingNumber}
                    onChange={e =>
                      this.setState({ routingNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Account number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    placeholder="Account number"
                    value={this.state.accountNumber}
                    onChange={e =>
                      this.setState({ accountNumber: e.target.value })
                    }
                  />
                </div>*/}
                <br />
                <br />
                <div>
                  <label>method</label>
                  <select
                    required
                    name="preferMicro"
                    id="preferMicro"
                    value={this.state.preferMicro}
                    onChange={(e) =>
                      this.setState({ preferMicro: e.target.id })
                    }
                  >
                    <option value={false}>instant:receive</option>
                    <option value={true}>1-3 days:send+balance</option>
                  </select>
                </div>
                <div>
                  <input
                    type="submit"
                    value={
                      !this.state.preferMicro
                        ? "Load instant form"
                        : "use 1-3 day microDeposits"
                    }
                  />
                </div>
              </form>
            )}
          {!this.props.openBanks &&
            !this.props.openBusinesses &&
            this.state.newBankplease && <div id="iavContainer" />}
          <br />
          {userIsLoaded &&
            user.name &&
            user.surname &&
            user.name === this.state.newName &&
            user.surname === this.state.newSurname &&
            this.state.newBusinessplease && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (this.state.biztype !== "Sole Proprietorship") {
                    if (this.state.ein === "") {
                      alert(
                        "for Corporations, LLC & Partnerships, or Sole Proprietorshiops with employees, you need an ein. " +
                          " please visit irs.gov to quickly get one"
                      );
                    } else {
                      await fetch(
                        `https://us-central1-vaumoney.cloudfunctions.net/verifiedBusinessVaumoney`,
                        {
                          method: "POST",
                          headers: {
                            "content-type": "application/json",
                            Accept: "application/json"
                          },
                          body: JSON.stringify({
                            correlationId: this.props.auth.uid,
                            firstName: user.name,
                            lastName: user.surname,
                            email: user.confirmedEmail,
                            DOB: user.DOB,
                            SSN: user.SSN,
                            address1: user.address1,
                            address2: user.address2,
                            city: user.city,
                            state: user.state,
                            ZIP: user.ZIP,
                            businessAddress1: this.state.businessAddress1,
                            businessAddress2: this.state.businessAddress2,
                            businessCity: this.state.businessCity,
                            businessState: this.state.businessState,
                            businessZIP: this.state.businessZIP,
                            businessRole: this.state.businessRole
                          })
                        }
                      )
                        .then(async (response) => await response.json())
                        .then((body) => {
                          console.log("beneficial owner resource");
                          console.log(body.verificationStatus);
                          this.setState({
                            verificationStatus: body.verificationStatus
                          });
                        })
                        .catch((err) => {
                          console.log("auth");
                          console.log(err.message);
                        });
                    }
                  } else {
                    await fetch(
                      `https://us-central1-vaumoney.cloudfunctions.net/verifiedBusinessVaumoney`,
                      {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                          Accept: "application/json"
                        },
                        body: JSON.stringify({
                          correlationId: this.props.auth.uid,
                          firstName: user.name,
                          lastName: user.surname,
                          email: user.confirmedEmail,
                          DOB: user.DOB,
                          SSN: user.SSN,
                          address1: user.address1,
                          address2: user.address2,
                          city: user.city,
                          state: user.state,
                          ZIP: user.ZIP
                        })
                      }
                    )
                      .then(async (response) => await response.json())
                      .then((body) => {
                        console.log("beneficial owner resource");
                        console.log(body.verificationStatus);
                        this.setState({
                          verificationStatus: body.verificationStatus
                        });
                      })
                      .catch((err) => {
                        console.log("auth");
                        console.log(err.message);
                      });
                  }
                }}
              >
                <br />
                <div>
                  <label>bizname</label>
                  <input
                    required
                    id="bizname"
                    placeholder="Business name"
                    value={this.state.bizname}
                    onChange={(e) => this.setState({ biztype: e.target.value })}
                  />
                </div>
                <div>
                  <label>biztype</label>
                  <select
                    required
                    name="biztype"
                    id="biztype"
                    value={this.state.biztype}
                    onChange={(e) => this.setState({ biztype: e.target.id })}
                  >
                    {[
                      "Sole Proprietorship",
                      "Corporation",
                      "LLC",
                      "Partnership"
                    ].map((x) => {
                      return <option value={x}>{x}</option>;
                    })}
                  </select>
                </div>
                {this.props.businessCodes && (
                  <div>
                    <select
                      required
                      name="bizclass"
                      id="bizclass"
                      value={this.state.chosenBusinessCode}
                      onChange={(e) =>
                        this.setState({ chosenBusinessCode: e.target.id })
                      }
                    >
                      {this.props.businessCodes.map((x) => {
                        return <option value={x.id}>{x.name}</option>;
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label>ein </label>
                  <label style={{ color: "grey" }}>
                    {this.state.biztype === "Sole Proprietorship" && "optional"}
                  </label>
                  <input
                    type="number"
                    id="ein"
                    placeholder="Employer identification #"
                    value={this.state.ein}
                    onChange={(e) => this.setState({ ein: e.target.value })}
                  />
                </div>
                <br />
                <AddressModule
                  updateBusinessAddress={(x) => {
                    this.setState({
                      businessAddress1: x.businessAddress1,
                      businessAddress2: x.businessAddress2,
                      businessCity: x.businessCity,
                      businessState: x.businessState,
                      businessZIP: x.businessZIP
                    });
                  }}
                  isBusiness={true}
                  entity={{
                    address1: this.state.businessAddress1,
                    address2: this.state.businessAddress2,
                    city: this.state.businessCity,
                    state: this.state.businessState,
                    ZIP: this.state.businessZIP
                  }}
                  auth={this.props.auth}
                />
                <div>
                  <label>ein </label>
                  <label style={{ color: "grey" }}>role</label>
                  <input
                    id="businessRole"
                    placeholder="owner"
                    value={this.state.ein}
                    onChange={(e) => this.setState({ ein: e.target.value })}
                  />
                </div>
                {this.state.biztype !== "Sole Proprietorship" &&
                  this.state.owners.map((x) => {
                    return <OwnerModule auth={this.props.auth} />;
                  })}
                <button type="submit">Submit</button>
              </form>
            )}
        </div>
      </div>
    );
  }
}
export default NewBank;
