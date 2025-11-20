import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBookStoreSchema1763571313210 implements MigrationInterface {
  name = 'UpdateBookStoreSchema1763571313210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_store" ADD "logo_url" text`);
    await queryRunner.query(
      `ALTER TYPE "public"."otp_type_enum" RENAME TO "otp_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_type_enum" AS ENUM('sign_up', 'reset_password', 'change_password')`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "type" TYPE "public"."otp_type_enum" USING "type"::"text"::"public"."otp_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."otp_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."otp_type_enum_old" AS ENUM('sign_up', 'reset_password')`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "type" TYPE "public"."otp_type_enum_old" USING "type"::"text"::"public"."otp_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."otp_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."otp_type_enum_old" RENAME TO "otp_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "book_store" DROP COLUMN "logo_url"`);
  }
}
