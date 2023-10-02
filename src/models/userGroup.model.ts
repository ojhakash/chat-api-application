import { DataTypes, Model } from "sequelize";
import { NextFunction } from "express";

import sequelize from "@/config/Sequalize";
import User from "./user.model";
import Group from "./group.model";

interface UserGroupAttributes {
  id?: number;
  groupId: number;
  userId: number;
}

class UserGroup
  extends Model<UserGroupAttributes>
  implements UserGroupAttributes
{
  public id?: number;
  public groupId!: number;
  public userId!: number;
}

UserGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isUnique: async function (value: number, next: NextFunction) {
          const group = await UserGroup.findOne({
            where: {
              userId: value,
            },
          });

          if (group && group.groupId === this.groupId) {
            const error = new Error(
              "groupId and userId combination must be unique."
            );
            next(error);
          }
          next();
        },
      },
    },
  },
  {
    modelName: "UserGroup",
    tableName: "user_groups",
    sequelize,
  }
);

UserGroup.belongsTo(User, { foreignKey: "userId" });
UserGroup.belongsTo(Group, { foreignKey: "groupId" });

export default UserGroup;
