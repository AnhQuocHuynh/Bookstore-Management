import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDatabaseSchemas1762445793417 implements MigrationInterface {
  name = 'UpdateDatabaseSchemas1762445793417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "database_connection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "host" character varying NOT NULL, "port" integer NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "database" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'postgres', "is_connected" boolean NOT NULL DEFAULT false, "last_connected_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "book_store_id" uuid, CONSTRAINT "REL_f36e9080549d2c61d02159040e" UNIQUE ("book_store_id"), CONSTRAINT "PK_85605bc51c189e1c0e20a19bacb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "host"`);
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "port"`);
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "database"`);
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "address" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "phone_number" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD CONSTRAINT "UQ_e5bad87ddc7c2d64661e1d0fd0d" UNIQUE ("phone_number")`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ALTER COLUMN "code" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD CONSTRAINT "UQ_efd6a21004532c10d72e6a8a31e" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "database_connection" ADD CONSTRAINT "FK_f36e9080549d2c61d02159040ea" FOREIGN KEY ("book_store_id") REFERENCES "book_store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_connection" DROP CONSTRAINT "FK_f36e9080549d2c61d02159040ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" DROP CONSTRAINT "UQ_efd6a21004532c10d72e6a8a31e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ALTER COLUMN "code" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" DROP CONSTRAINT "UQ_e5bad87ddc7c2d64661e1d0fd0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" DROP COLUMN "phone_number"`,
    );
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "type" character varying NOT NULL DEFAULT 'postgres'`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "database" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "password" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "port" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD "host" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "database_connection"`);
  }
}
