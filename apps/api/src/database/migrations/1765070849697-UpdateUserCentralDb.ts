import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserCentralDb1765070849697 implements MigrationInterface {
  name = 'UpdateUserCentralDb1765070849697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "logo_url"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar_url" text`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "birth_date" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "address" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "address" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "birth_date" SET DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_url"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "logo_url" text`);
  }
}
