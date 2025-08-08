import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import kafkaConfig from "../config/kafka.config";


const app = new Hono()


app.post('/create-post' , zValidator("json", z.object({
    title: z.string().min(2).max(100),
    content: z.string().min(10).max(1000),
  })
) , async (c) => {
  const {title , content} = c.req.valid("json");

  try {
    await kafkaConfig.sendToTopic("post", JSON.stringify({ title, content }));
    return c.json({ message: 'Post created successfully' }, 201);
  } catch (error) {
    console.error("Error sending message to Kafka:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
})

export default app;
