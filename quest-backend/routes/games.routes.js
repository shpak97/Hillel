import {
    listGames,
    getGameById,
    createGame,
    replaceGame,
    updateGame,
    deleteGame,
  } from "../controllers/games.controller.js";
  
  export const gamesRoutes = [
    { method: "GET", path: "/games", handler: listGames },
    { method: "GET", path: "/games/:id", handler: getGameById },
  
    { method: "POST", path: "/games", handler: createGame },
  
    // PUT = повна заміна
    { method: "PUT", path: "/games/:id", handler: replaceGame },
  
    // PATCH = часткове оновлення
    { method: "PATCH", path: "/games/:id", handler: updateGame },
  
    { method: "DELETE", path: "/games/:id", handler: deleteGame },
  ];