import React from "react";

class CashHeader extends React.Component {
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
            display: "flex",
            position: "relative",
            backgroundColor: "white",
            borderBottom: "1px white solid",
            height: "56px",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(25,35,25)"
          }}
        >
          <div
            onClick={this.props.openListedTransations}
            style={{
              display: "flex",
              position: "absolute",
              left: "20px",
              width: "36px",
              height: "36px",
              backgroundColor: "rgb(25,35,25)",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "5px",
              color: "white",
              fontSize: "30px"
            }}
          >
            ~
          </div>
          <h2 onClick={this.props.openboth}>${this.props.balance}</h2>
          <div
            onClick={this.props.load}
            style={{
              display: "flex",
              position: "absolute",
              right: "20px",
              width: "36px",
              height: "36px",
              backgroundColor: "rgb(25,35,25)",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "5px",
              color: "white",
              fontSize: "30px"
            }}
          >
            +
          </div>
        </div>
        <div
          style={{
            display: "flex",
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
          <h3>
            {this.props.transations && this.props.transations.length > 0
              ? this.props.transactions.map(
                  (x, i) =>
                    [0, 1, 2, 3].includes(i) && (
                      <div>
                        {x.amount.value}&nbsp;{x.amount.currency}
                      </div>
                    )
                )
              : "no transactions yet"}
          </h3>
        </div>
      </div>
    );
  }
}

export default CashHeader;
