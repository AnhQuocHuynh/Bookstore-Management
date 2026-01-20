import { hashPassword } from '@/common/utils';
import { CreateMainUserDto } from '@/database/main/dto';
import { User } from '@/database/main/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MainUserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findUserByField(
    field: keyof User,
    value: string,
    repo?: Repository<User>,
  ) {
    const user = await (repo ?? this.userRepo).findOne({
      where: {
        [field]: value,
      },
    });

    return user ? user : null;
  }

  async createNewUser(
    createUserDto: CreateMainUserDto,
    repo?: Repository<User>,
  ) {
    const newUser = (repo ?? this.userRepo).create({
      ...createUserDto,
      password: await hashPassword(createUserDto.password),
      avatarUrl: 'https://github.com/shadcn.png',
    });
    return (repo ?? this.userRepo).save(newUser);
  }

  async updatePasswordOfUser(userId: string, newPassword: string) {
    const user = await this.findUserByField('id', userId);
    if (user) {
      user.password = await hashPassword(newPassword);
      await this.userRepo.save(user);
    }
  }

  async updateUser(data: Partial<User>, userId: string) {
    await this.userRepo.update({ id: userId }, data);
  }

  async getUseByIds(userIds: string[]) {
    if (!userIds || userIds.length === 0) return {};

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();

    const userMap: { [id: string]: User } = {};

    for (const user of users) {
      userMap[user.id] = user;
    }

    return userMap;
  }
}
