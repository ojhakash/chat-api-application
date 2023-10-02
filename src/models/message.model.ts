import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/Sequalize";
import Group from "@/models/group.model";
import User from "@/models/user.model";

interface MessageAttributes {
  id?: number;
  text: string;
  groupId: number;
  senderId: number;
  isDeleted?: boolean;
}

class Message extends Model<MessageAttributes> implements MessageAttributes {
  public readonly id?: number;
  public text!: string;
  public groupId!: number;
  public senderId!: number;
  public isDeleted?: boolean;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    modelName: "Message",
    tableName: "mssages",
    sequelize,
    defaultScope: {
      where: {
        isDeleted: false,
      },
    },
  }
);

Message.belongsTo(User, { foreignKey: "senderId", as: "user" });
Message.belongsTo(Group, { foreignKey: "groupId", as: "group" });

export default Message;
