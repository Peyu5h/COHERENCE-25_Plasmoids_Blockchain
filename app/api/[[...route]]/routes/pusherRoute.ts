import { Hono } from "hono";
import { err } from "../utils/response";
import { pusherServer } from "~/lib/pusher";

const pusherRoutes = new Hono();

pusherRoutes.post("/auth", async (c) => {
  try {
    const formData = await c.req.formData();
    const socketId = formData.get("socket_id") as string;
    const channel = formData.get("channel_name") as string;

    if (!socketId || !channel) {
      return c.json(err("Missing socketId or channel"), 400);
    }
    const user = (c as any).get("user");

    // For presence channels
    if (channel.startsWith("presence-")) {
      const userData = {
        user_id: user.id,
        user_info: {
          name: user.name || "Anonymous",
          email: user.email,
        },
      };

      const authResponse = pusherServer.authorizeChannel(
        socketId,
        channel,
        userData,
      );

      return c.json(authResponse);
    }
    // For private channels
    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    return c.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return c.json(err("Authentication failed"), 500);
  }
});

export default pusherRoutes;
