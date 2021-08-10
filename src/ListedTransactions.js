import React from "react";

class ListedTransactions extends React.Component {
  state = {};
  render() {
    return (
      <div
        style={
          this.props.openListedTransations
            ? {
                flexDirection: "column",
                display: "flex",
                position: "fixed",
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
        {this.props.transations && this.props.transations.length > 0 ? (
          this.props.transations.map(x => {
            return (
              <div>
                {x.amount.value}&nbsp;{x.amount.currency}
                <br />
                {x.metadata.note}
              </div>
            );
          })
        ) : (
          <div
            style={{
              display: "flex",
              position: "relative",
              justifyContent: "center",
              zIndex: "9999",
              marginTop: "20px",
              borderRadius: "6px",
              border: "1px solid",
              width: "120px",
              left: "50%",
              transform: "translateX(-50%)"
            }}
          >
            no transactions
          </div>
        )}
      </div>
    );
  }
}
export default ListedTransactions;
