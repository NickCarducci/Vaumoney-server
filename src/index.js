import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import App from "./App";

class PathRouter extends React.Component {
  state = {};
  render() {
    return (
      <TransitionGroup key="1">
        <CSSTransition key="11" timeout={300} classNames={"fade"}>
          <Route
            render={({ location, history }) => (
              <App
                history={history}
                pathname={location.pathname}
                statePathname={this.state.statePathname}
                location={location}
              />
            )}
          />
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
const rootElem = document.getElementById("root");
ReactDOM[rootElem && rootElem.innerHTML !== "" ? "hydrate" : "render"](
  <BrowserRouter>
    <PathRouter />
  </BrowserRouter>,
  rootElem
);
