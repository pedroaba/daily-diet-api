import fastify from "fastify";
import cookie from "@fastify/cookie";
import { usersRouters } from "./routers/users.routes";
import { mealsRouters } from "./routers/meals.routes";

export const app = fastify();

// setup of fastify application
app.register(cookie);

app.register(usersRouters, { prefix: "users" });
app.register(mealsRouters, { prefix: "meals" });
