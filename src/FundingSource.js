import React from "react";
import dayjs from "dayjs";
import firebase from "./init-firebase";

class FundingSource extends React.Component {
  state = {
    newName: this.props.x.name,
    currency1: "USD",
    currency2: "USD"
  };
  render() {
    function renderDate(date) {
      let d = dayjs(date);
      return d.format("MMMM D YYYY");
    }
    return (
      <form
        key={this.props.x.id}
        style={{ zIndex: "9999" }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (this.props.x.name !== this.state.newName) {
            await fetch(
              "https://us-central1-vaumoney.cloudfunctions.net/editFundingVaumoney",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  Accept: "application/json"
                },
                body: JSON.stringify({
                  name: this.state.newName
                })
              }
            )
              .then(async (res) => await res.json())
              .then((result) => {
                console.log(result);
              })
              .catch((err) => console.log(err.message));
          }
          this.setState({ closeEdit: false });
        }}
      >
        {this.state.closeEdit && (
          <button
            style={{ display: "flex" }}
            onClick={() =>
              this.setState({ closeEdit: true, newName: this.props.x.name })
            }
          >
            Cancel
          </button>
        )}
        {this.state.closeEdit ? (
          <div style={{ display: "flex" }}>
            <input
              className="input"
              required
              placeholder="name"
              value={this.state.newName}
              onChange={(e) => this.setState({ newName: e.target.value })}
            />
            {this.props.x.name !== this.state.newName && (
              <button type="submit">Save</button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              position: "relative",
              justifyContent: "flex-start",
              alignItems: "flex-end"
            }}
          >
            <div
              onClick={async () => {
                console.log(this.props.x.id);
                var answer = window.confirm("check balance?");
                if (answer) {
                  await fetch(
                    "https://us-central1-vaumoney.cloudfunctions.net/getBalanceVaumoney",
                    {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "content-type": "application/json"
                      },
                      body: JSON.stringify({
                        fundingSource: this.props.x.id
                      })
                    }
                  )
                    .then(async (res) => await res.json())
                    .then(async (result) => {
                      console.log(result);
                      console.log(this.props.x.id);
                      if (
                        result.code &&
                        ["Forbidden", "Unsupported"].includes(result.code)
                      ) {
                        var answer = window.confirm(
                          "unsupported request: initiate micro-deposit to unlock this feature?"
                        );
                        if (answer) {
                          await fetch(
                            "https://us-central1-vaumoney.cloudfunctions.net/initiateMicroVaumoney",
                            {
                              method: "POST",
                              headers: {
                                Accept: "application/json",
                                "content-type": "application/json"
                              },
                              body: JSON.stringify({
                                fundingSource: this.props.x.id
                              })
                            }
                          )
                            .then(async (res) => await res.json())
                            .then(async (result) => {
                              console.log(result);
                              if (result.code === "MaxNumberOfResources") {
                                await fetch(
                                  "https://us-central1-vaumoney.cloudfunctions.net/statusMicroVaumoney",
                                  {
                                    method: "POST",
                                    headers: {
                                      Accept: "application/json",
                                      "content-type": "application/json"
                                    },
                                    body: JSON.stringify({
                                      fundingSource: this.props.x.id
                                    })
                                  }
                                )
                                  .then(async (res) => await res.text())
                                  .then((result) => {
                                    console.log(result);
                                    if (result === "pending") {
                                      window.alert(
                                        "Micro-deposits are on their way! They should arrive within two days of being sent."
                                      );
                                    } else if (result === "processed") {
                                      window.alert(
                                        `Micro-deposits have reached your bank account ${this.props.x.name}! Please report to us the amounts to use the balance query feature.`
                                      );
                                      this.setState({
                                        showMicroVerification: true
                                      });
                                    } else if (result === "failed") {
                                      window.alert(
                                        `Micro-deposits have been rejected by your bank account ${
                                          this.props.x.name
                                        }! ${
                                          result.description
                                            ? result.description
                                            : ""
                                        }.`
                                      );
                                    }
                                  })
                                  .catch((err) => console.log(err.message));
                              } else {
                                window.alert(String(result));
                                //window.location.reload();
                              }
                            })
                            .catch((err) => console.log(err.message));
                        }
                      } else {
                        this.setState({ [this.props.x.id]: result });
                      }
                    })
                    .catch((err) => console.log(err.message));
                }
              }}
              onMouseEnter={() => this.setState({ arrow: this.props.x.id })}
              onMouseLeave={() => this.setState({ arrow: false })}
              style={
                this.state.arrow === this.props.x.id
                  ? {
                      display: "flex",
                      position: "relative",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: "9999",
                      height: "22px",
                      borderRadius: "6px",
                      border: "1px solid",
                      width: "40px",
                      fontSize: "12px",
                      transform: "rotate(180deg)"
                    }
                  : {
                      display: "flex",
                      position: "relative",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: "9999",
                      height: "22px",
                      borderRadius: "6px",
                      border: "1px solid",
                      width: "40px",
                      backgroundColor: "teal",
                      color: "white",
                      fontSize: "12px",
                      transform: "rotate(180deg)"
                    }
              }
            >
              ^
            </div>
            &nbsp;{this.props.x.name}&nbsp;
            <div
              onClick={() => this.setState({ closeEdit: true })}
              style={{
                display: "flex",
                position: "relative",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "9999",
                height: "22px",
                borderRadius: "6px",
                border: "1px solid",
                width: "40px",
                backgroundColor: "teal",
                color: "white",
                fontSize: "12px"
              }}
            >
              EDIT
            </div>
          </div>
        )}
        <div
          style={{
            flexDirection: "column",
            display: "flex",
            position: "relative",
            width: "min-content",
            marginLeft: "4px"
          }}
        >
          <div
            style={{
              height: "min-content",
              display: "flex",
              position: "relative",
              alignItems: "center"
            }}
          >
            <div
              onMouseEnter={() => this.setState({ info: "status" })}
              onMouseLeave={() => this.setState({ info: false })}
              style={
                this.state.info === "status"
                  ? {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
                  : {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      color: "rgb(140,160,140)",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
              }
            >
              .{this.props.x.status}/{this.props.x.name}
              {this.props.x.channels.length > 0 && "/"}
              {this.props.x.channels.map((x, i) => (i === 0 ? x : `&${x}`))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              position: "relative",
              alignItems: "center"
            }}
          >
            <div
              onMouseEnter={() => this.setState({ info: "type" })}
              onMouseLeave={() => this.setState({ info: false })}
              style={
                this.state.info === "type"
                  ? {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
                  : {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      color: "rgb(140,160,140)",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
              }
            >
              .{this.props.x.type === "balance" ? "dwolla" : this.props.x.type}/
              {this.props.x.bankName}
            </div>
          </div>
        </div>
        <div
          style={{
            marginLeft: "4px",
            display: "flex",
            position: "relative",
            alignItems: "center"
          }}
        >
          <div
            onMouseEnter={() => this.setState({ info: "linked" })}
            onMouseLeave={() => this.setState({ info: false })}
            style={
              this.state.info === "linked"
                ? {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
                : {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    color: "rgb(140,160,140)",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
            }
          >
            .linked/
            {renderDate(this.props.x.created)}
          </div>
        </div>
        <div
          style={{
            marginLeft: "4px",
            display: "flex",
            position: "relative",
            alignItems: "center"
          }}
        >
          <div
            onMouseEnter={() => this.setState({ info: "linked" })}
            onMouseLeave={() => this.setState({ info: false })}
            style={
              this.state.info === "linked"
                ? {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
                : {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    color: "rgb(140,160,140)",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
            }
          >
            .balance/
            {this.state[this.props.x.id]}
          </div>
          {this.state.showMicroVerification && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("d");
                await fetch(
                  "https://us-central1-vaumoney.cloudfunctions.net/verifyMicroVaumoney",
                  {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "content-type": "application/json"
                    },
                    body: JSON.stringify({
                      fundingSource: this.props.x.id,
                      amount1: this.state.amount1,
                      currency1: this.state.currency1,
                      amount2: this.state.amount2,
                      currency2: this.state.currency2
                    })
                  }
                )
                  .then(async (res) => await res.json())
                  .then((result) => {
                    if (result.status === 200) {
                      this.props.getTheGoods();
                    } else {
                      window.alert(result.description);
                    }
                  })
                  .catch((err) => console.log(err.message));
              }}
            >
              <div>
                <select
                  required
                  defaultChecked={this.state.currency1}
                  value={this.state.currency1}
                  onChange={(e) => this.setState({ currency1: e.target.value })}
                >
                  <option id="USD">USD</option>
                </select>
                <input
                  required
                  value={this.state.amount1}
                  type="number"
                  step="0.01"
                  onChange={(e) =>
                    this.setState({
                      amount1: e.target.value
                    })
                  }
                />
              </div>
              <div>
                <select
                  required
                  defaultChecked={this.state.currency2}
                  value={this.state.currency2}
                  onChange={(e) => this.setState({ currency2: e.target.value })}
                >
                  <option id="USD">USD</option>
                </select>
                <input
                  required
                  value={this.state.amount2}
                  type="number"
                  step="0.01"
                  onChange={(e) =>
                    this.setState({
                      amount2: e.target.value
                    })
                  }
                />
              </div>
              <div style={{ display: "flex" }}>
                <button type="submit">Verify</button>
                <div
                  onClick={() =>
                    this.setState({ showMicroVerification: false })
                  }
                >
                  &nbsp;&times;
                </div>
              </div>
            </form>
          )}
        </div>
        <br />
        {this.state.closeEdit && (
          <div
            style={{ fontSize: "20px", border: "1px solid black" }}
            onClick={async () => {
              if (this.props.x.type === "balance") {
                var thereisone1 = this.props.transactions.find(
                  (x) => x.status === "pending"
                );
                if (thereisone1) {
                  window.alert(
                    "transactions are still being processed. please wait a few more moments" +
                      " to try deleting this bank account's connection again"
                  );
                } else {
                  if (
                    this.props.x.balance !== 0 &&
                    this.props.x.balance !== undefined
                  ) {
                    window.alert(
                      `please withdraw your $${this.props.x.balance} before deleting your balance. add another bank if you have to`
                    );
                  } else {
                    var answer1 = window.confirm(
                      "are you sure you'd like to delete your account?"
                    );
                    if (answer1) {
                      await fetch(
                        "https://us-central1-vaumoney.cloudfunctions.net/deleteCustomerVaumoney",
                        {
                          method: "POST",
                          headers: {
                            "content-type": "application/json",
                            Accept: "application/json"
                          },
                          body: JSON.stringify({
                            mastercardId: this.props.user.mastercardId
                          })
                        }
                      )
                        .then(async (res) => await res.json())
                        .then((result) => {
                          console.log(result);
                          firebase
                            .firestore()
                            .collection("userDatas")
                            .doc(this.props.auth.uid)
                            .update({ mastercardId: false });
                          window.location.reload();
                        })
                        .catch((err) => console.log(err.message));
                    }
                  }
                }
              } else {
                var answer = window.confirm(
                  "are you sure you'd like to delete this funding source?"
                );
                if (answer)
                  var thereisone = this.props.transactions.find(
                    (x) => x.status === "pending"
                  );
                if (!thereisone) {
                  await fetch(
                    "https://us-central1-vaumoney.cloudfunctions.net/deleteFundingVaumoney",
                    {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                        Accept: "application/json"
                      },
                      body: JSON.stringify({
                        fundingSource: this.props.x.id
                      })
                    }
                  )
                    .then(async (res) => await res.json())
                    .then((result) => {
                      console.log(result);
                      window.location.reload();
                    })
                    .catch((err) => console.log(err.message));
                } else {
                  window.alert(
                    "transactions are still being processed. please wait a few more moments" +
                      " to try deleting this bank account's connection again"
                  );
                }
              }
            }}
          >
            delete
          </div>
        )}
      </form>
    );
  }
}
export default FundingSource;
