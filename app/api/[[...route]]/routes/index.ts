import { Hono } from "hono";
import user from "./user";

const indexRoute = new Hono();

// test route
indexRoute.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
indexRoute.route("/user", user);

export default indexRoute;
