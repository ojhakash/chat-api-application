import Group from "@/models/group.model";
import User from "@/models/user.model";
import UserGroup from "@/models/userGroup.model";
import sequelize from "sequelize";

interface GroupCreationAttributes {
  name: string;
}

class GroupRepository {
  async createGroup(
    data: GroupCreationAttributes,
    userId: number
  ): Promise<Group | undefined> {
    let group = await Group.create({ name: data.name });
    let userGroup = await UserGroup.create({ groupId: group.id ?? 0, userId });
    return group;
  }

  async findGroupById(id: number | undefined): Promise<Group | null> {
    let group = await Group.findByPk(id);
    if (group && group.isActive) {
      return group;
    }
    return null;
  }

  async markInActiveGroupById(id: number | undefined): Promise<number> {
    let groups = await Group.update(
      {
        isActive: false,
      },
      {
        where: {
          id: id,
          isActive: true,
        },
      }
    );
    return groups[0];
  }

  async getGroupsByUseId(userId: number): Promise<UserGroup[]> {
    let userGroups = await UserGroup.findAll({
      where: { userId },
      include: [{ model: Group, where: { isActive: true }, attributes: [] }],
      raw: true,
      nest: false,
      attributes: [
        [sequelize.literal('"Group"."id"'), "groupId"],
        [sequelize.literal('"Group"."name"'), "groupName"],
        [sequelize.literal('"Group"."isActive"'), "isActive"],
        [sequelize.literal('"Group"."createdAt"'), "createdAt"],
        [sequelize.literal('"Group"."updatedAt"'), "updatedAt"],
      ],
    });
    return userGroups;
  }

  async listAllGroups(): Promise<Group[]> {
    let groups = await Group.findAll({});
    return groups;
  }

  async getUsersByGroupId(groupId: number): Promise<UserGroup[]> {
    let userGroups = await UserGroup.findAll({
      where: { groupId },
      include: [{ model: User, attributes: [] }],
      raw: true,
      nest: false,
      attributes: [
        [sequelize.literal('"User"."id"'), "userId"],
        [sequelize.literal('"User"."username"'), "username"],
        [sequelize.literal('"User"."email"'), "email"],
        [sequelize.literal('"User"."role"'), "role"],
      ],
    });
    return userGroups;
  }

  async addUserToGroup(groupId: number, userId: number): Promise<UserGroup> {
    let userGroup = await UserGroup.create({ groupId, userId });
    return userGroup;
  }

  async removeUserFromGroup(groupId: number, userId: number): Promise<number> {
    let userGroupCount = await UserGroup.destroy({
      where: { groupId, userId },
    });
    return userGroupCount;
  }

  async getGroupByUserIdAndGroupId(
    userId: number,
    groupId: number
  ): Promise<UserGroup | null> {
    let userGroup = await UserGroup.findOne({ where: { groupId, userId } });
    return userGroup;
  }
}

export default GroupRepository;
