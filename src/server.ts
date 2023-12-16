import { app } from "./app";
import { env } from "./env";

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`🚀 HTTP Server is running on port: ${env.PORT} 🚀`);
  });
