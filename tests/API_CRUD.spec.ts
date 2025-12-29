import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

test.skip(
  !EMAIL || !PASSWORD,
  "EMAIL and PASSWORD must be set to run auth token tests"
);

let authToken: string;
let planetId: number;
let planetName: string;

test("Get token for authorization", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/auth/token`, {
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      email: EMAIL,
      password: PASSWORD
    }
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body).toBeDefined();
  authToken = (body.token) as string;
  expect(authToken).toBeTruthy();
});

test("Create a new Planet", async ({ request }) => {
  expect(authToken).toBeTruthy();

  const response = await request.post(`${BASE_URL}/planets`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    data: {
      name: "Pluto"
    }
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body).toBeDefined();
  planetId = (body.id) as number;
  planetName = (body.name) as string;
  expect(planetId).toBeTruthy();
  expect(planetName).toBeTruthy();
});

test("Get Planet by ID", async ({ request }) => {
  expect(planetId).toBeTruthy();

  const response = await request.get(`${BASE_URL}/planets/${planetId}`)

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toBeDefined();
  const name = (body.name) as string;
  expect(name).toBe(planetName)
})

test('Delete Planet by ID', async ({ request }) => {
  expect(authToken).toBeTruthy();
  expect(planetId).toBeTruthy();

  const response = await request.delete(`${BASE_URL}/planets/${planetId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    },
  })

  expect(response.status()).toBe(204);
})

test('Check Deleted Planet by ID', async ({ request }) => {
  //due to specific of the fumadocs.dev this test will fail
  const responseAfterDelete = await request.get(`${BASE_URL}/planets/${planetId}`)
  expect(responseAfterDelete.status()).toBe(404)
})
