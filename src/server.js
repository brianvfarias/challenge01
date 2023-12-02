import http from "node:http";
import { routes } from "./routes.js";
import { handleBody } from "../middlewares/handleBody.js";
http
  .createServer(async (req, res) => {
    const { url, method } = req;

    const currenRoute = routes.find((route) => {
      return route.path.test(url) && route.method === method;
    });
    console.log("Rota atual " + currenRoute);

    // if (currenRoute.handleBody) {
    await handleBody(req, res);
    // }

    if (currenRoute) {
      const routeParams = req.url.match(currenRoute.path);
      const { query, ...params } = routeParams.groups;
      req.params = params;
      req.query = query ? extractQueryParams(query) : {};
      return currenRoute.action(req, res);
    }
    res.writeHead(404);
    res.end(http.STATUS_CODES[404]);
  })
  .listen(1337);
