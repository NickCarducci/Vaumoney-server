import React from "react";

class Operating extends React.Component {
  render() {
    return (
      <div
        style={{
          display: "flex",
          position: "relative",
          top: "0",
          height: "min-content",
          transform: `translateY(${
            this.props.revenueShow || this.props.expenseShow ? "-280px" : "0%"
          })`,
          width: "100%",
          transition: "transform .3s ease-out",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            display: this.props.scrolled > 280 ? "none" : "flex",
            position: "relative",
            backgroundColor: "rgb(25,35,25)",
            borderBottom: "1px white solid",
            height: "56px",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}
        >
          <h2>
            this year
            {(this.props.revenueShow || this.props.expenseShow) &&
              `'s ${this.props.expenseShow ? "expenses" : ""}${
                this.props.revenueShow ? "revenue" : ""
              }`}
          </h2>
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: "20px",
              width: "36px",
              height: "36px",
              backgroundColor: "rgb(25,35,25)",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            \/
          </div>
        </div>
        <div
          style={{
            display:
              this.props.revenueShow || this.props.expenseShow
                ? "none"
                : "flex",
            position: "relative",
            borderTop: "2px rgb(25,35,25) solid",
            height: "168px",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}
        >
          <div
            onClick={this.props.openRev}
            style={{
              display: "flex",
              position: "relative",
              backgroundColor: "white",
              height: "168px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px rgb(25,35,25) solid",
              color: "rgb(25,35,25)"
            }}
          >
            <h3>revenue</h3>
          </div>
          <div
            onClick={this.props.openExp}
            style={{
              display: "flex",
              position: "relative",
              backgroundColor: "white",
              height: "168px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px left solid",
              color: "rgb(25,35,25)"
            }}
          >
            <h3>expenses</h3>
          </div>
        </div>
        <div
          style={{
            display:
              this.props.revenueShow || this.props.expenseShow
                ? "none"
                : "flex",
            position: "relative",
            backgroundColor: "white",
            borderTop: "2px rgb(25,35,25) solid",
            height: "168px",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(25,35,25)"
          }}
        >
          <h3>transactions only include ACH within vau.money</h3>
        </div>
      </div>
    );
  }
}
export default Operating;
