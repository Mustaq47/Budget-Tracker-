import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/screens/Home";
import { Flow } from "./components/screens/Flow";
import { Insights } from "./components/screens/Insights";
import { Profile } from "./components/screens/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "flow", Component: Flow },
      { path: "insights", Component: Insights },
      { path: "profile", Component: Profile },
      { path: "*", Component: Home },
    ],
  },
]);
