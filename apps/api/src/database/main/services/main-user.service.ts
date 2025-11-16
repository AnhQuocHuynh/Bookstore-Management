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

  async findUserByField(field: keyof User, value: string) {
    const user = await this.userRepo.findOne({
      where: {
        [field]: value,
      },
    });

    return user ? user : null;
  }

  async createNewUser(createUserDto: CreateMainUserDto) {
    const newUser = this.userRepo.create({
      ...createUserDto,
      password: await hashPassword(createUserDto.password),
    });
    return this.userRepo.save(newUser);
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
}
