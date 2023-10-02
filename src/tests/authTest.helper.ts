import { UserType } from "@/types/enums/token";
import User from "@/models/user.model";
import { generateAuthTokens } from "@/utils";
import { faker } from "@faker-js/faker";

export const createUserParams = (params?: {
    email?: string;
    username?: string;
    password?: string;
    role?: UserType;
  }) => {
    return {
      email: faker.internet.email(),
      password: faker.internet.password() + "@",
      username: faker.internet.userName(),
      ...params,
    };
  };
  
  export const createUserTest = async (userParams: {
    email?: string;
    username?: string;
    password?: string;
    role?: UserType;
  }) => {
    const { email, username, password, role } = userParams;
    return await User.create({
      email: email ? email : faker.internet.email(),
      password: password ? password : faker.internet.password(),
      username: username ? username : email ? email : faker.internet.userName(),
      role: role ? role : UserType.ADMIN,
    });
  };
  
  export const authenticate = async (user: User) => {
    return await generateAuthTokens(user);
  };