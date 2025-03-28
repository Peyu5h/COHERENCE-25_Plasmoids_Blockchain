import { Hono } from "hono";
import userRoute from "./user";
import certificatesRoute from "./certificates";

const app = new Hono();

// test route
app.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
app.route("/user", userRoute);
app.route("/certificates", certificatesRoute);

export default app;
