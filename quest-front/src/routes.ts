import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import App from "./App";
import { ROUTE_PATHS } from "./constants/routes";

// Lazy loading компонентів
const Home = lazy(() => import("./pages/Home"));
const GameDetail = lazy(() => import("./pages/GameDetail"));
const Contacts = lazy(() => import("./pages/Contacts"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: `${ROUTE_PATHS.games}/${ROUTE_PATHS.gameDetail}`,
        Component: GameDetail,
      },
      {
        path: ROUTE_PATHS.contacts,
        Component: Contacts,
      },
      {
        path: "*",
        Component: NotFound, 
      },
    ],
  },
]);