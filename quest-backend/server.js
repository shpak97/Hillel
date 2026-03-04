import http from "node:http";
import { router } from "./router.js";

const hostname = "localhost";
const port = 3000;


const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error(err);

    if (err instanceof HttpError) {
      return sendJson(res, err.statusCode, { error: err.message });
    }

    return sendJson(res, 500, { error: "Internal Server Error" });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});