import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/screens/Home";
import { Flow } from "./components/screens/Flow";
import { Insights } from "./components/screens/Insights";
import { Profile } from "./components/screens/Profile";
import { LoginScreen } from "./components/screens/LoginScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { AdminShell } from "../admin";
import { Onboarding } from "./components/screens/Onboarding";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute />,
    children: [{ index: true, Component: AdminShell }],
  },
  {
    path: "/",
    Component: Root,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: Home },
          { path: "onboarding", Component: Onboarding },
          { path: "flow", Component: Flow },
          { path: "insights", Component: Insights },
          { path: "profile", Component: Profile },
          { path: "*", Component: Home },
        ],
      },
    ],
  },
]);
