import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserSchema1763829619438 implements MigrationInterface {
  name = 'UpdateUserSchema1763829619438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "logo_url" text`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "birth_date" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "address" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birth_date"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "logo_url"`);
  }
}
