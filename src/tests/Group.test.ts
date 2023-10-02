import request from "supertest";
import app from "@/server";
import { UserType } from "@/types/enums/token";
import sequelize from "@/config/Sequalize";
import { createUserTest, authenticate } from "@/tests/authTest.helper";
import UserGroup from "@/models/userGroup.model";
import Group from "@/models/group.model";

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Create Group tests", () => {
  it("Create group successfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const response = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 1",
      });

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.name).not.toBeNull();
    expect(response.body.isActive).toBe(true);

    let userGroup = await UserGroup.findOne({
      where: { groupId: response.body.id, userId: user.id },
    });
    expect(userGroup?.id).not.toBeNull();
  });

  it("Create group fail for invalid input", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const response = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        namee: "Group 1",
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe('"body.name" is required');
  });

  it("Create group fail for unauthenticated user", async () => {
    const response = await request(app).post("/group").send({
      name: "Group 1",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("Get Group tests", () => {
  it("Fetch Group sucessfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 1",
      });
    const response = await request(app)
      .get(`/group/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.name).not.toBeNull();
    expect(response.body.isActive).toBe(true);

    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].userId).toBe(user.id);
    expect(response.body.users[0].username).toBe(user.username);
    expect(response.body.users[0].email).toBe(user.email);
    expect(response.body.users[0].role).toBe(user.role);
  });

  it("Fetch Group failed for invalid groupId", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);

    const response = await request(app)
      .get(`/group/10`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe("The groupId provided is invalid.");
  });

  it("Fetch Group failed for unauthorized user", async () => {
    const response = await request(app).get(`/group/10`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("Delete Group tests", () => {
  it("Delete Group sucessfully", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 1",
      });

    const response = await request(app)
      .delete(`/group/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();

    const fetchResponse = await request(app)
      .get(`/group/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(fetchResponse.status).toBe(400);
    expect(fetchResponse.body.code).toBe(400);
    expect(fetchResponse.body.message).toBe("The groupId provided is invalid.");
  });

  it("Delete Group failed for invalid groupId", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);

    const response = await request(app)
      .delete(`/group/10`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe(
      "No active group exists with the given id"
    );
  });

  it("Delete Group failed for unauthorized user", async () => {
    const response = await request(app).delete(`/group/10`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("List Group tests", () => {
  it("Fetch List Group sucessfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const tokens1 = await authenticate(user1);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        name: "Group 1",
      });

    const user2 = await createUserTest({ role: UserType.STANDARD });
    const tokens2 = await authenticate(user2);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        name: "Group 2",
      });

    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 3",
      });

    const response1 = await request(app)
      .get(`/group/`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response1.status).toBe(200);
    expect(response1.body).toHaveLength(3);
    expect(response1.body[0].id).not.toBeNull();
    expect(response1.body[0].name).not.toBeNull();
    expect(response1.body[0].isActive).toBe(true);

    await Group.update(
      { isActive: false },
      { where: { id: response1.body[0].id } }
    );

    const response2 = await request(app)
      .get(`/group/`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response2.status).toBe(200);
  });

  it("Fetch Group List failed for unauthorized user", async () => {
    const response = await request(app).get(`/group/`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });

  it("Fetch List for logged in user Group sucessfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const tokens1 = await authenticate(user1);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        name: "Group 1",
      });

    const user2 = await createUserTest({ role: UserType.STANDARD });
    const tokens2 = await authenticate(user2);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        name: "Group 2",
      });

    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group/")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 3",
      });

    const response1 = await request(app)
      .get(`/group/me`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response1.status).toBe(200);
    expect(response1.body).toHaveLength(1);
    expect(response1.body[0].id).not.toBeNull();
    expect(response1.body[0].name).not.toBeNull();
    expect(response1.body[0].isActive).toBe(true);
  });

  it("Fetch Group Listfor logged in user failed for unauthorized user", async () => {
    const response = await request(app).get(`/group/me`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("User to Group tests", () => {
  it("Add user to group successfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const tokens1 = await authenticate(user1);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        name: "Group 1",
      });

    const user2 = await createUserTest({ role: UserType.STANDARD });
    const tokens2 = await authenticate(user2);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        name: "Group 2",
      });

    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group/")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 3",
      });
    const response1 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(response1.status).toBe(200);
    expect(response1.body.id).not.toBeNull();
    expect(response1.body.groupId).toBe(groupResponse.body.id);
    expect(response1.body.userId).toBe(user1.id);

    const response2 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    expect(response2.status).toBe(200);
    expect(response2.body.id).not.toBeNull();
    expect(response2.body.groupId).toBe(groupResponse.body.id);
    expect(response2.body.userId).toBe(user2.id);

    const response = await request(app)
      .get(`/group/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.name).not.toBeNull();
    expect(response.body.isActive).toBe(true);
    expect(response.body.users).toHaveLength(3);
  });

  it("Add user failed for duplicate request", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group/")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 3",
      });
    const response1 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(response1.status).toBe(200);
    expect(response1.body.id).not.toBeNull();
    expect(response1.body.groupId).toBe(groupResponse.body.id);
    expect(response1.body.userId).toBe(user1.id);

    const response2 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(response2.status).toBe(400);
    expect(response2.body.code).toBe(400);
    expect(response2.body.message).toBe(
      "Validation error: groupId and userId combination must be unique."
    );
    expect(response2.body.errors[0].type).toBe("userId");
    expect(response2.body.errors[0].message).toBe(
      "groupId and userId combination must be unique."
    );
  });

  it("Add user tp group failed for unauthenticated user", async () => {
    const removeResponse = await request(app)
      .post(`/group/1/add-user/`)
      .set("Authorization", `Bearer asfdsfsgs`)
      .send({
        userId: 1,
      });

    expect(removeResponse.status).toBe(401);
    expect(removeResponse.body.message).toBe("Please authenticate");
  });

  it("Remove user from group successfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const tokens1 = await authenticate(user1);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        name: "Group 1",
      });

    const user2 = await createUserTest({ role: UserType.STANDARD });
    const tokens2 = await authenticate(user2);
    await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        name: "Group 2",
      });

    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group/")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 3",
      });
    const response1 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(response1.status).toBe(200);
    expect(response1.body.id).not.toBeNull();
    expect(response1.body.groupId).toBe(groupResponse.body.id);
    expect(response1.body.userId).toBe(user1.id);

    const response2 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    expect(response2.status).toBe(200);
    expect(response2.body.id).not.toBeNull();
    expect(response2.body.groupId).toBe(groupResponse.body.id);
    expect(response2.body.userId).toBe(user2.id);

    const response = await request(app)
      .get(`/group/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBeNull();
    expect(response.body.name).not.toBeNull();
    expect(response.body.isActive).toBe(true);

    expect(response.body.users).toHaveLength(3);

    const removeResponse = await request(app)
      .post(`/group/${groupResponse.body.id}/remove-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.success).toBeTruthy();

    const afterRemoveResponse = await request(app)
      .get(`/group/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(afterRemoveResponse.status).toBe(200);
    expect(afterRemoveResponse.body.id).not.toBeNull();
    expect(afterRemoveResponse.body.name).not.toBeNull();
    expect(afterRemoveResponse.body.isActive).toBe(true);
    expect(afterRemoveResponse.body.users).toHaveLength(2);
  });

  it("Remove user from group failed for invalid request", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });

    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const groupResponse = await request(app)
      .post("/group/")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 3",
      });
    const response1 = await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(response1.status).toBe(200);
    expect(response1.body.id).not.toBeNull();
    expect(response1.body.groupId).toBe(groupResponse.body.id);
    expect(response1.body.userId).toBe(user1.id);

    const removeResponse = await request(app)
      .post(`/group/${groupResponse.body.id}/remove-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.success).toBeTruthy();

    const removeResponse2 = await request(app)
      .post(`/group/${groupResponse.body.id}/remove-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    expect(removeResponse2.status).toBe(400);
    expect(removeResponse2.body.code).toBe(400);
    expect(removeResponse2.body.message).toBe(
      "No active group exists with the given groupId and userId"
    );
  });

  it("Remove user from group failed for unauthenticated user", async () => {
    const removeResponse = await request(app)
      .post(`/group/1/remove-user/`)
      .set("Authorization", `Bearer asfdsfsgs`)
      .send({
        userId: 1,
      });

    expect(removeResponse.status).toBe(401);
    expect(removeResponse.body.message).toBe("Please authenticate");
  });
});
