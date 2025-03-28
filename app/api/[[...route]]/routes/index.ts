import { Hono } from "hono";
import userRoute from "./user";
import certificatesRoute from "./certificates";
import verifyRoute from "./verify";

const app = new Hono();

// test route
app.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
app.route("/user", userRoute);
app.route("/certificates", certificatesRoute);
app.route("/verify", verifyRoute);

export default app;
