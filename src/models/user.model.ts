import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";

import sequelize from "@/config/Sequalize";
import { UserType } from "@/types/enums/token";

interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id?: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: string; 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(UserType.ADMIN,UserType.STANDARD),
      allowNull: false,
    },
  },
  {
    modelName: "User",
    tableName: "users",
    sequelize,
    hooks: {
      beforeCreate: async (user: User) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
    },
  }
);

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  if (values.password) {
    delete values.password;
  }
  return values;
};

export default User;
