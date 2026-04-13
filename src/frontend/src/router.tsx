import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { MenuPage } from "./pages/MenuPage";

const rootRoute = createRootRoute({
  component: Layout,
});

const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MenuPage,
});

import { GamePage } from "./pages/GamePage";
// Lazy-loaded pages — import directly for now (will be split into page tasks)
import { GaragePage } from "./pages/GaragePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/game",
  component: GamePage,
});

const garageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/garage",
  component: GaragePage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const routeTree = rootRoute.addChildren([
  menuRoute,
  gameRoute,
  garageRoute,
  leaderboardRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
