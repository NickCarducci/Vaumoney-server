import React from "react";
import AddressModule from "./AddressModule";

class OwnerModule extends React.Component {
  render() {
    return (
      <div>
        <div>
          <label>dateOfBirth</label>
          <input
            type="date"
            id="dateOfBirth"
            placeholder="Birthday"
            value={this.state.newBirthday}
            onChange={e => this.setState({ newBirthday: e.target.value })}
          />
        </div>
        <div>
          <label>full ssn</label>
          <input
            autoComplete="off"
            type="number"
            id="ssn"
            placeholder="Social security number"
            value={this.state.fullSSN}
            onChange={e => this.setState({ fullSSN: e.target.value })}
          />
        </div>
        <AddressModule
          updateBusinessAddress={x => {
            this.setState({
              ownerAddress1: x.businessAddress1,
              ownerAddress2: x.businessAddress2,
              ownerCity: x.businessCity,
              ownerState: x.businessState,
              ownerZIP: x.businessZIP
            });
          }}
          isBusiness={true}
          entity={{
            address1: this.state.ownerAddress1,
            address2: this.state.ownerAddress2,
            city: this.state.ownerCity,
            state: this.state.ownerState,
            ZIP: this.state.ownerZIP
          }}
          auth={this.props.auth}
        />
      </div>
    );
  }
}
export default OwnerModule;
