import request from "supertest";
import app from "@/server";
import { UserType } from "@/types/enums/token";
import sequelize from "@/config/Sequalize";
import { createUserTest, authenticate } from "@/tests/authTest.helper";

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Send Message tests", () => {
  it("Send Message to group successfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user2 = await createUserTest({ role: UserType.STANDARD });
    const user3 = await createUserTest({ role: UserType.STANDARD });

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

    expect(groupResponse.status).toBe(200);

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    const tokens1 = await authenticate(user1);
    const messageResponse1 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 1",
      });
    expect(messageResponse1.status).toBe(200);
    expect(messageResponse1.body.id).not.toBeNull();
    expect(messageResponse1.body.text).toBe("message from user 1");
    expect(messageResponse1.body.isDeleted).toBe(false);
    expect(messageResponse1.body.groupId).toBe(groupResponse.body.id);
    expect(messageResponse1.body.senderId).toBe(user1.id);
  });

  it("Fail to send Message to a group which user is not part of", async () => {
    const user2 = await createUserTest({ role: UserType.STANDARD });

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

    expect(groupResponse.status).toBe(200);
    const secondGroupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 2",
      });

    await request(app)
      .post(`/group/${secondGroupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    const tokens3 = await authenticate(user2);
    const invalidGroupessageResponse = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens3.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 3",
      });

    expect(invalidGroupessageResponse.status).toBe(400);
    expect(invalidGroupessageResponse.body.code).toBe(400);
    expect(invalidGroupessageResponse.body.message).toBe(
      "This user is not part of the group"
    );
  });

  it("Send Message fail for invalid input", async () => {
    const user = await createUserTest({
      email: "akashojha@gmail.com",
      password: "secret@12345",
      role: UserType.STANDARD,
    });
    const tokens = await authenticate(user);
    const response = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        groupId: 2,
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe('"body.text" is required');
  });

  it("Send Message fail for unauthenticated user", async () => {
    const response = await request(app).post("/message").send({
      groupId: 2,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("Fetch Message tests", () => {
  it("Fetch all message in a group sucessfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user2 = await createUserTest({ role: UserType.STANDARD });
    const user3 = await createUserTest({ role: UserType.STANDARD });

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

    const secondGroupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 1",
      });

    expect(groupResponse.status).toBe(200);

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    const tokens1 = await authenticate(user1);
    const messageResponse1 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    const tokens2 = await authenticate(user2);
    const messageResponse2 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 2",
      });

    await request(app)
      .post(`/group/${secondGroupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user3.id,
      });
    const tokens3 = await authenticate(user3);
    const secondGroupMessageResponse = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens3.access.token}`)
      .send({
        groupId: secondGroupResponse.body.id,
        text: "message from user 3",
      });

    const firstGroupMessages = await request(app)
      .get(`/message/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(firstGroupMessages.status).toBe(200);
    expect(firstGroupMessages.body).toHaveLength(2);

    const firstGroupMessagesByUser1 = await request(app)
      .get(`/message/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens1.access.token}`);

    expect(firstGroupMessagesByUser1.status).toBe(200);
    expect(firstGroupMessagesByUser1.body).toHaveLength(2);
  });

  it("Fetch list Message fail for unauthenticated user", async () => {
    const response = await request(app)
      .get(`/message/2}`)
      .set("Authorization", `Bearer sfa4RT54TGRG`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("Delete Message tests", () => {
  it("Delete a message successfully", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user2 = await createUserTest({ role: UserType.STANDARD });
    const user3 = await createUserTest({ role: UserType.STANDARD });

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

    const secondGroupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    const tokens1 = await authenticate(user1);
    const messageResponse1 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    const tokens2 = await authenticate(user2);
    const messageResponse2 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 2",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user3.id,
      });
    const tokens3 = await authenticate(user3);
    const messageResponse3 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens3.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 3",
      });

    const deleteMessage = await request(app)
      .delete("/message/" + messageResponse2.body.id)
      .set("Authorization", `Bearer ${tokens2.access.token}`);

    expect(deleteMessage.status).toBe(200);
    expect(deleteMessage.body.success).toBeTruthy();

    const firstGroupMessages = await request(app)
      .get(`/message/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(firstGroupMessages.status).toBe(200);
    expect(firstGroupMessages.body).toHaveLength(2);
  });

  it("Delete message fail if attempted by non-sender user", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user2 = await createUserTest({ role: UserType.STANDARD });
    const user3 = await createUserTest({ role: UserType.STANDARD });

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

    const secondGroupResponse = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        name: "Group 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    const tokens1 = await authenticate(user1);
    const messageResponse1 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    const tokens2 = await authenticate(user2);
    const messageResponse2 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens2.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 2",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user3.id,
      });
    const tokens3 = await authenticate(user3);
    const messageResponse3 = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens3.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 3",
      });

    const deleteMessage = await request(app)
      .delete("/message/" + messageResponse2.body.id)
      .set("Authorization", `Bearer ${tokens3.access.token}`);

    expect(deleteMessage.status).toBe(400);
    expect(deleteMessage.body.code).toBe(400);
    expect(deleteMessage.body.message).toBe(
      "The message id provided is invalid."
    );

    const firstGroupMessages = await request(app)
      .get(`/message/${groupResponse.body.id}`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(firstGroupMessages.status).toBe(200);
    expect(firstGroupMessages.body).toHaveLength(3);
  });

  it("Fail to delete message for unauthenticated user", async () => {
    const response = await request(app)
      .delete(`/message/2}`)
      .set("Authorization", `Bearer sfa4RT54TGRG`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});

describe("Like Message tests", () => {
  it("Like message tests success", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user2 = await createUserTest({ role: UserType.STANDARD });
    const user3 = await createUserTest({ role: UserType.STANDARD });

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

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    const tokens1 = await authenticate(user1);
    const messageResponse = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    const tokens2 = await authenticate(user2);
    const likeResponse1 = await request(app)
      .post(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens2.access.token}`);
    expect(likeResponse1.status).toBe(200);
    expect(likeResponse1.body.success).toBeTruthy();

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user3.id,
      });
    const tokens3 = await authenticate(user3);
    const likeResponse2 = await request(app)
      .post(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens3.access.token}`);
    expect(likeResponse2.status).toBe(200);
    expect(likeResponse2.body.success).toBeTruthy();

    const likeResponse3 = await request(app)
      .post(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(likeResponse3.status).toBe(200);
    expect(likeResponse3.body.success).toBeTruthy();

    const listLikeResponse = await request(app)
      .get(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(listLikeResponse.status).toBe(200);
    expect(listLikeResponse.body).toHaveLength(3);

    expect(listLikeResponse.body[0].id).not.toBeNull();
    expect(listLikeResponse.body[0].messageId).not.toBeNull();
    expect(listLikeResponse.body[0].userId).not.toBeNull();
    expect(listLikeResponse.body[0].user.id).not.toBeNull();
    expect(listLikeResponse.body[0].user.email).not.toBeNull();
    expect(listLikeResponse.body[0].user.username).not.toBeNull();
  });

  it("Delete Like message tests", async () => {
    const user1 = await createUserTest({ role: UserType.STANDARD });
    const user2 = await createUserTest({ role: UserType.STANDARD });
    const user3 = await createUserTest({ role: UserType.STANDARD });

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

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user1.id,
      });
    const tokens1 = await authenticate(user1);
    const messageResponse = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${tokens1.access.token}`)
      .send({
        groupId: groupResponse.body.id,
        text: "message from user 1",
      });

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user2.id,
      });
    const tokens2 = await authenticate(user2);
    const likeResponse1 = await request(app)
      .post(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens2.access.token}`);
    expect(likeResponse1.status).toBe(200);
    expect(likeResponse1.body.success).toBeTruthy();

    await request(app)
      .post(`/group/${groupResponse.body.id}/add-user/`)
      .set("Authorization", `Bearer ${tokens.access.token}`)
      .send({
        userId: user3.id,
      });
    const tokens3 = await authenticate(user3);
    const likeResponse2 = await request(app)
      .post(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens3.access.token}`);
    expect(likeResponse2.status).toBe(200);
    expect(likeResponse2.body.success).toBeTruthy();

    const likeResponse3 = await request(app)
      .post(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(likeResponse3.status).toBe(200);
    expect(likeResponse3.body.success).toBeTruthy();

    const listLikeResponse = await request(app)
      .get(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(listLikeResponse.status).toBe(200);
    expect(listLikeResponse.body).toHaveLength(3);

    const deleteLikeResponse = await request(app)
      .delete(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens.access.token}`);
    expect(deleteLikeResponse.status).toBe(200);
    expect(deleteLikeResponse.body.success).toBeTruthy();

    const listLikeResponseAfterRemoveLike = await request(app)
      .get(`/message/${messageResponse.body.id}/like-message`)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    expect(listLikeResponseAfterRemoveLike.status).toBe(200);
    expect(listLikeResponseAfterRemoveLike.body).toHaveLength(2);
  });

  it("Fail to like message for unauthenticated user", async () => {
    const response1 = await request(app)
      .post(`/message/2/like-message`)
      .set("Authorization", `Bearer sfa4RT54TGRG`);

    expect(response1.status).toBe(401);
    expect(response1.body.message).toBe("Please authenticate");

    const response = await request(app)
      .delete(`/message/2/like-message`)
      .set("Authorization", `Bearer sfa4RT54TGRG`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please authenticate");
  });
});
