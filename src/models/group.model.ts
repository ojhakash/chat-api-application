import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/Sequalize";

interface GroupAttributes {
  id?: number;
  name: string;
  isActive?: boolean;
}

class Group extends Model<GroupAttributes> implements GroupAttributes {
  public readonly id?: number;
  public name!: string;
  public isActive?: boolean;
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    modelName: "Group",
    tableName: "groups",
    sequelize,
    defaultScope: {
      where: {
        isActive: true,
      },
    },
  }
);



export default Group;
