import Group from "@/models/group.model";
import Message from "@/models/message.model";
import MessageLike from "@/models/messageLike.model";
import User from "@/models/user.model";

interface MessgeCreationAttributes {
  text: string;
  groupId: number;
}

class MessageRepository {
  async createMessage(
    data: MessgeCreationAttributes,
    senderId: number
  ): Promise<Message | undefined> {
    let message = await Message.create({
      text: data.text,
      groupId: data.groupId,
      senderId,
    });
    return message;
  }

  async listAllMessages(groupId: number): Promise<Message[]> {
    let messages = Message.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "role"],
        },
        {
          model: Group,
          as: "group",
          where: { isActive: true },
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return messages;
  }

  async deleteMessage(id: number, senderId: number): Promise<number> {
    let messageCount = await Message.update(
      { isDeleted: true },
      { where: { id, senderId } }
    );
    return messageCount[0];
  }

  async likeMessage(messageId: number, userId: number): Promise<MessageLike> {
    let [messageLike, created] = await MessageLike.findOrCreate({
      where: { messageId, userId },
      defaults: { messageId, userId },
    });
    return messageLike;
  }

  async removeLikeMessage(
    messageId: number,
    userId: number
  ): Promise<number> {
    let messageLikeCount = await MessageLike.destroy({
      where: { messageId, userId },
    });
    return messageLikeCount;
  }

  async getLikesInfoForMessage(messageId: number): Promise<MessageLike[]> {
    let messageLikes = MessageLike.findAll({
      where: { messageId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return messageLikes;
  }
}

export default MessageRepository;
