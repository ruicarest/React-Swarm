import React from "react";
import { render } from "react-dom";
import Swarm from "./Components/Swarm/";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import swarmReducer from "./Stores/swarmStore";

const store =
  process.env.NODE_ENV === "production"
    ? createStore(swarmReducer)
    : createStore(swarmReducer, composeWithDevTools());

render(
  <Provider store={store}>
    <Swarm />
  </Provider>,
  document.getElementById("root")
);
