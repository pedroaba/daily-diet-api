import { randomUUID } from "node:crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../database";

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export async function usersRouters(app: FastifyInstance) {
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, name } = createUserSchema.parse(request.body);
    let userSessionId = request.cookies.sessionId;

    if (!userSessionId) {
      userSessionId = randomUUID();
      reply.setCookie("sessionId", userSessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 8, // 8 hours
      });
    }

    const userOnDatabase = await knex("users").where({ email }).first();

    if (userOnDatabase) {
      return reply.status(400).send({ message: "User already exists" });
    }

    await knex("users").insert({
      name,
      email,
      session_id: userSessionId,
    });

    return reply.status(201).send();
  });
}
