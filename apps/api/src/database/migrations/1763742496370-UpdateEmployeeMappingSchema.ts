import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEmployeeMappingSchema1763742496370
  implements MigrationInterface
{
  name = 'UpdateEmployeeMappingSchema1763742496370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_mapping" RENAME COLUMN "email" TO "username"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_mapping" RENAME COLUMN "username" TO "email"`,
    );
  }
}
