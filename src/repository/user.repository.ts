import User from "@/models/user.model";
import { UserType } from "@/types/enums/token";
import { ValidationError } from "sequelize";

interface UserCreationAttributes {
  username: string;
  email: string;
  password: string;
  role: UserType;
}

interface UserLoginAttributes {
  email: string;
  password: string;
}

class UserRepository {
  async createUser(data: UserCreationAttributes): Promise<User | undefined> {
    let user = await User.create({
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role,
    });
    return user;
  }

  async updateUser(
    id: string,
    data: UserCreationAttributes
  ): Promise<number | undefined> {
    let user = await User.update(
      {
        email: data.email,
        username: data.username,
        password: data.password,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return user[0];
  }

  async loginUser(data: UserLoginAttributes): Promise<User> {
    let user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw Error("Invalid credentials");
    }

    let success = await user?.validatePassword(data.password);
    if (success) {
      return user;
    }

    throw Error("Invalid credentials");
  }

  async findUserById(id: number | undefined): Promise<User | null> {
    return User.findByPk(id);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async deleteUserById(id: number): Promise<number> {
    return User.destroy({ where: { id } });
  }
}

export default UserRepository;
