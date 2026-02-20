import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import App from "./App";
import { ROUTE_PATHS } from "./utils/constants/routes";

// Lazy loading компонентів
const Home = lazy(() => import("./pages/Home/Home"));
const GameDetail = lazy(() => import("./pages/GameDetail/GameDetail"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

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
        Component: Contact,
      },
      {
        path: "*",
        Component: NotFound, 
      },
    ],
  },
]);