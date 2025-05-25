import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/css/css.css";
import "../src/App.css"
import { Provider } from "react-redux";
import store from "./store";
import "react-datepicker/dist/react-datepicker.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>
);
