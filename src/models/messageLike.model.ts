import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/Sequalize";
import User from "./user.model";
import Message from "./message.model";

interface MessageLikeAttributes {
  id?: number;
  messageId: number;
  userId: number;
}

class MessageLike
  extends Model<MessageLikeAttributes>
  implements MessageLikeAttributes
{
  public id?: number;
  public messageId!: number;
  public userId!: number;
}

MessageLike.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: "MessageLike",
    tableName: "message_likes",
    sequelize,
  }
);

MessageLike.belongsTo(User, { foreignKey: "userId", as: "user" });
MessageLike.belongsTo(Message, { foreignKey: "messageId" });

export default MessageLike;
