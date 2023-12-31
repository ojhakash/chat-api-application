import request from "supertest";
import app from "@/server";
import { UserType } from "@/types/enums/token";
import User from "@/models/user.model";
import sequelize from "@/config/Sequalize";
import { generateAuthTokens } from "@/utils";
import { faker } from "@faker-js/faker";
import {
  createUserParams,
  createUserTest,
  authenticate,
} from "@/tests/authTest.helper";

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("login tests", () => {
  it("login should fail for invalid user", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "akashojha1@gmail.com",
      password: "secret@12345",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("login should fail for wrong password", async () => {
    await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      username: "akashojha",
    });
    const response = await request(app).post("/auth/login").send({
      email: "akashojha@gmail.com",
      password: "secret@12345",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.id).not.toBeNull();
    expect(response.body.user.username).toBe("akashojha");
    expect(response.body.user.email).toBe("akashojha@gmail.com");
    expect(response.body.user.password).not.toBeDefined();
    expect(response.body.user.role).toBe(UserType.ADMIN);
    expect(response.body.tokens.access.token).not.toBeNull();
    expect(response.body.tokens.refresh.token).not.toBeNull();
  });

  it("admin user should be login successfully", async () => {
    await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      username: "akashojha",
    });
    const response = await request(app).post("/auth/login").send({
      email: "akashojha@gmail.com",
      password: "secret@12345",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.id).not.toBeNull();
    expect(response.body.user.username).toBe("akashojha");
    expect(response.body.user.email).toBe("akashojha@gmail.com");
    expect(response.body.user.password).not.toBeDefined();
    expect(response.body.user.role).toBe(UserType.ADMIN);
    expect(response.body.tokens.access.token).not.toBeNull();
    expect(response.body.tokens.refresh.token).not.toBeNull();
  });

  it("standard user should be login successfully", async () => {
    await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const response = await request(app).post("/auth/login").send({
      email: "akashojha@gmail.com",
      password: "secret@12345",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.id).not.toBeNull();
    expect(response.body.user.username).not.toBeNull();
    expect(response.body.user.username).toBe("akashojha@gmail.com");
    expect(response.body.user.email).toBe("akashojha@gmail.com");
    expect(response.body.user.password).not.toBeDefined();
    expect(response.body.user.role).toBe(UserType.STANDARD);
    expect(response.body.tokens.access.token).not.toBeNull();
    expect(response.body.tokens.refresh.token).not.toBeNull();
  });
});

describe("signup tests", () => {
  it("admin user signup successfully", async () => {
    let userParams = createUserParams();
    const response = await request(app).post("/auth/signup").send(userParams);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.username).toBe(userParams.username);
    expect(response.body.email).toBe(userParams.email);
    expect(response.body.password).not.toBeDefined();
    expect(response.body.role).toBe(UserType.ADMIN);
  });

  it("admin user signup fail for wrong password", async () => {
    let userParams = createUserParams({
      email: "akash@gmail.com",
      password: "secret12345678",
    });
    const response = await request(app).post("/auth/signup").send(userParams);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      '"body.password" with value "secret12345678" fails to match the required pattern'
    );
  });

  it("admin user signup fail for duplicate email", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.ADMIN,
    });

    let userParams = createUserParams({
      email: "akashojha@gmail.com",
      password: "secret@12345",
    });
    const response = await request(app).post("/auth/signup").send(userParams);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toBe("email must be unique");
    expect(response.body.errors[0].type).toBe("email");
  });
});

describe("create user tests", () => {
  it("admin user create a standard user successfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.ADMIN,
    });

    const tokens = await authenticate(user);

    let userParams = createUserParams();
    const response = await request(app)
      .post("/auth/user")
      .send(userParams)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.username).toBe(userParams.username);
    expect(response.body.email).toBe(userParams.email);
    expect(response.body.password).not.toBeDefined();
    expect(response.body.role).toBe(UserType.STANDARD);
  });

  it("standard user should fail to create user", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const tokens = await authenticate(user);

    let userParams = createUserParams();
    const response = await request(app)
      .post("/auth/user")
      .send(userParams)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Only admin can perform this operation."
    );
  });

  it("create user fail for unauthorized user", async () => {
    let userParams = createUserParams();
    const response = await request(app).post("/auth/user").send(userParams);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });

  it("standard user creation failed for invalid email format", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.ADMIN,
    });
    const tokens = await authenticate(user);

    let userParams = createUserParams({ email: "akash" });
    const response = await request(app)
      .post("/auth/user")
      .send(userParams)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('"body.email" must be a valid email');
  });

  it("standard user creation failed for invalid password format", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.ADMIN,
    });
    const tokens = await authenticate(user);

    let userParams = createUserParams({ password: "aadsfg4365" });
    const response = await request(app)
      .post("/auth/user")
      .send(userParams)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      '"body.password" with value "aadsfg4365" fails to match the required pattern'
    );
  });
});

describe("update user tests", () => {
  it("admin user update a standard user successfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.ADMIN,
    });

    const standard_user = await createUserTest({
      email: faker.internet.email(),
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const tokens = await authenticate(user);
    let userParams = createUserParams();
    const response = await request(app)
      .put(`/auth/user/${standard_user.id}`)
      .send(userParams)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.success).toBeTruthy();
  });

  it("standard user should fail to update user", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const standard_user = await createUserTest({
      email: faker.internet.email(),
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const tokens = await authenticate(user);
    let userParams = createUserParams();
    const response = await request(app)
      .put(`/auth/user/${standard_user.id}`)
      .send(userParams)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Only admin can perform this operation."
    );
  });

  it("update user fail for unauthorized user", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const standard_user = await createUserTest({
      email: faker.internet.email(),
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    let userParams = createUserParams();
    const response = await request(app)
      .put(`/auth/user/${standard_user.id}`)
      .send(userParams)
      .set("Authorization", `Bearer invalid_token`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("fetch profile tests", () => {
  it("admin user fetch profile successfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
    });

    const tokens = await authenticate(user);
    const response = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.username).toBe("akashojha@gmail.com");
    expect(response.body.email).toBe("akashojha@gmail.com");
    expect(response.body.password).not.toBeDefined();
    expect(response.body.role).toBe(UserType.ADMIN);
  });

  it("standard user fetch profile successfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const response = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.username).toBe("akashojha@gmail.com");
    expect(response.body.email).toBe("akashojha@gmail.com");
    expect(response.body.password).not.toBeDefined();
    expect(response.body.role).toBe(UserType.STANDARD);
  });
});

describe("fetch users list tests", () => {
  it("admin user fetch profile successfully", async () => {
    const user1 = await createUserTest({
      email: "akashojha1@gmail.com",
      password: "secret@12345",
    });

    const user2 = await createUserTest({
      email: "akashojha2@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const user3 = await createUserTest({
      email: "akashojha3@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const user4 = await createUserTest({
      email: "akashojha4@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });

    const user5 = await createUserTest({
      email: "akashojha5@gmail.com",
      password: "secret@12345",
    });

    const tokens = await authenticate(user1);
    const response = await request(app)
      .get("/auth/user")
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);

    expect(response.body).not.toBeNull();
    expect(response.body).toHaveLength(5);
    expect(response.body[2].username).toBe("akashojha3@gmail.com");
    expect(response.body[2].email).toBe("akashojha3@gmail.com");
    expect(response.body[2].password).not.toBeDefined();
    expect(response.body[2].role).toBe(UserType.STANDARD);

    const searchResponse = await request(app)
      .get("/auth/user?searchText=akashojha4")
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(searchResponse.body).not.toBeNull();
    expect(searchResponse.body).toHaveLength(1);
    expect(searchResponse.body[0].username).toBe("akashojha4@gmail.com");
    expect(searchResponse.body[0].email).toBe("akashojha4@gmail.com");
    expect(searchResponse.body[0].password).not.toBeDefined();
    expect(searchResponse.body[0].role).toBe(UserType.STANDARD);
  });

  it("fetch user list failed for unauthenticated user", async () => {
    const response = await request(app)
      .get("/auth/user")
      .set("Authorization", `Bearer 132fff`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});
