import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1762246288764 implements MigrationInterface {
  name = 'InitDatabase1762246288764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."authorization_code_type_enum" AS ENUM('reset_password', 'invite_employee')`,
    );
    await queryRunner.query(
      `CREATE TABLE "authorization_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "type" "public"."authorization_code_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_586233caf7e281dc24aaedd1335" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_store" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying, "name" character varying, "host" character varying NOT NULL, "port" integer NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "database" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'postgres', "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_2a8df21d3ba2d52e53fe3693376" UNIQUE ("code"), CONSTRAINT "PK_f1d2d2186aa819d95f5ce0b30f7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_type_enum" AS ENUM('sign_up', 'reset_password')`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."otp_type_enum" NOT NULL, "otp" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "metadata" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'OWNER', 'EMPLOYEE', 'CUSTOMER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "full_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "is_email_verified" boolean NOT NULL DEFAULT false, "role" "public"."user_role_enum" NOT NULL DEFAULT 'OWNER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "authorization_code" ADD CONSTRAINT "FK_e259cc0926bf29f2d053ba4bae5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" ADD CONSTRAINT "FK_067491301f4067b8b0e39a8fade" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_258d028d322ea3b856bf9f12f25" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_258d028d322ea3b856bf9f12f25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_store" DROP CONSTRAINT "FK_067491301f4067b8b0e39a8fade"`,
    );
    await queryRunner.query(
      `ALTER TABLE "authorization_code" DROP CONSTRAINT "FK_e259cc0926bf29f2d053ba4bae5"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`DROP TABLE "otp"`);
    await queryRunner.query(`DROP TYPE "public"."otp_type_enum"`);
    await queryRunner.query(`DROP TABLE "book_store"`);
    await queryRunner.query(`DROP TABLE "authorization_code"`);
    await queryRunner.query(
      `DROP TYPE "public"."authorization_code_type_enum"`,
    );
  }
}
