import { hashPassword } from '@/common/utils/helpers';
import { User } from '@/database/main/entities';
import { UserRole } from '@/modules/users/enums';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  private readonly logger = new Logger(MainSeeder.name);

  async run(dataSource: DataSource): Promise<any> {
    const queryRunner: QueryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;
      const userRepo = entityManager.getRepository(User);
      this.logger.log('🌱 Starting seeding admin data...');

      const users: Partial<User>[] = [];

      for (let i = 0; i < 1; i++) {
        users.push({
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phoneNumber: faker.phone.number({
            style: 'international',
          }),
          password: await hashPassword(process.env.PASSWORD_FAKE || ''),
          role: UserRole.ADMIN,
          isActive: true,
          isEmailVerified: true,
        });
      }

      await userRepo.insert(users);

      this.logger.log(`✅ Seeded ${users.length} users successfully.`);
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error('❌ Seeding failed', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
