import { describe, beforeAll, beforeEach, afterAll, it, expect } from "vitest";
import { execSync } from "child_process";
import { app } from "../src/app";
import request from "supertest";

describe("User test routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able create an user", async () => {
    const response = await request(app.server)
      .post("/users")
      .send({
        name: "Jhon Doe",
        email: "jhondoe@email.com",
      })
      .expect(201);

    const cookies = response.get("Set-Cookie");
    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining("sessionId")]),
    );
  });
});
