import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmployeeMappingTableToCentralDb1763631271318
  implements MigrationInterface
{
  name = 'AddEmployeeMappingTableToCentralDb1763631271318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."employee_mapping_role_enum" AS ENUM('STORE_MANAGER', 'STAFF', 'CASHIER', 'INVENTORY', 'ACCOUNTANT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_mapping" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" "public"."employee_mapping_role_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "bookstore_id" uuid, CONSTRAINT "PK_6e7cb4c45099357cbdd7c155db4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_mapping" ADD CONSTRAINT "FK_c49796d30deef9e00711d1bab32" FOREIGN KEY ("bookstore_id") REFERENCES "book_store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_mapping" DROP CONSTRAINT "FK_c49796d30deef9e00711d1bab32"`,
    );
    await queryRunner.query(`DROP TABLE "employee_mapping"`);
    await queryRunner.query(`DROP TYPE "public"."employee_mapping_role_enum"`);
  }
}
