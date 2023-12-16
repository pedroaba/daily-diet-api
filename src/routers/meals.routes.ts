import { randomUUID } from "node:crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExistsOnCookies } from "../middlewares/check-session-id-on-cookies";

const createMealsSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  isInTheDiet: z.boolean(),
});

const updateBodyMealsSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  isInTheDiet: z.boolean(),
});

const updateParamsMealsSchema = z.object({
  mealId: z.string().uuid(),
});

const getParamsMealsSchema = z.object({
  mealId: z.string().uuid(),
});

export async function mealsRouters(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [checkSessionIdExistsOnCookies] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { name, date, description, isInTheDiet } = createMealsSchema.parse(
        request.body,
      );

      const userId = request.user?.id;
      await knex("meals").insert({
        id: randomUUID(),
        name,
        description,
        is_in_the_diet: isInTheDiet,
        date_time: date.getTime(),
        user_id: userId,
      });

      return reply.status(201).send();
    },
  );

  app.put(
    "/:mealId",
    { preHandler: [checkSessionIdExistsOnCookies] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { mealId } = updateParamsMealsSchema.parse(request.params);
      const { date, description, isInTheDiet, name } =
        updateBodyMealsSchema.parse(request.body);

      const userId = request.user?.id;
      const mealOnDatabase = await knex("meals")
        .where({ id: mealId, user_id: userId })
        .first();
      if (!mealOnDatabase) {
        return reply.status(404).send({ error: "Meal not found" });
      }

      await knex("meals").where({ id: mealId }).update({
        name,
        description,
        is_in_the_diet: isInTheDiet,
        date_time: date.getTime(),
      });

      return reply.status(200).send();
    },
  );

  app.delete(
    "/:mealId",
    { preHandler: [checkSessionIdExistsOnCookies] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { mealId } = updateParamsMealsSchema.parse(request.params);

      const userId = request.user?.id;
      const mealOnDatabase = await knex("meals")
        .where({ id: mealId, user_id: userId })
        .first();
      if (!mealOnDatabase) {
        return reply.status(404).send({ error: "Meal not found" });
      }

      await knex("meals").where({ id: mealId }).delete();
      return reply.status(200).send();
    },
  );

  app.get(
    "/",
    { preHandler: [checkSessionIdExistsOnCookies] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user?.id;
      const mealsOnDatabase = await knex("meals")
        .where({ user_id: userId })
        .orderBy("date_time", "desc");

      return reply.status(200).send({
        meals: mealsOnDatabase,
      });
    },
  );

  app.get(
    "/:mealId",
    { preHandler: [checkSessionIdExistsOnCookies] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { mealId } = getParamsMealsSchema.parse(request.params);

      const userId = request.user?.id;
      const mealOnDatabase = await knex("meals")
        .where({ user_id: userId, id: mealId })
        .first();

      return reply.status(200).send({
        meal: mealOnDatabase,
      });
    },
  );

  app.get(
    "/metrics",
    { preHandler: [checkSessionIdExistsOnCookies] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user?.id;
      const mealsOnDatabase = await knex("meals")
        .where({ user_id: userId })
        .orderBy("date_time", "desc");

      const totalOfMeals = mealsOnDatabase.length;
      const totalOfMealsInDiet = mealsOnDatabase.filter(
        (meal) => meal.is_in_the_diet,
      ).length;
      const totalOfMealsOutDiet = totalOfMeals - totalOfMealsInDiet;

      const { bestSequencyOfMealsInDiet } = mealsOnDatabase.reduce(
        (metrics, meal) => {
          if (meal.is_in_the_diet) {
            metrics.currentSequency += 1;
          } else {
            metrics.currentSequency = 0;
          }

          if (metrics.currentSequency > metrics.bestSequencyOfMealsInDiet) {
            metrics.bestSequencyOfMealsInDiet = metrics.currentSequency;
          }

          return metrics;
        },
        { bestSequencyOfMealsInDiet: 0, currentSequency: 0 },
      );

      return reply.status(200).send({
        totalOfMeals,
        totalOfMealsInDiet,
        totalOfMealsOutDiet,
        bestSequencyOfMealsInDiet,
      });
    },
  );
}
