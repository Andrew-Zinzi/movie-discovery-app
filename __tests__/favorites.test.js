import app from "../app.js";
import request from "supertest";

test("GET /favorites returns 200 and an array", async () => {
  const response = await request(app).get("/favorites");
  expect(response.status).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});

test("POST /favorites returns 404 when passed a body with a tmdbId not in movieLookup", async () => {
  const response = await request(app).post("/favorites").send({ id: 4324});
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ error: "404 movie not found" });
});
