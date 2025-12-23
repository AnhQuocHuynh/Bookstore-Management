import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserSchemaLatest1763829894217 implements MigrationInterface {
  name = 'UpdateUserSchemaLatest1763829894217';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
