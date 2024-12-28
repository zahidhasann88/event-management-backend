import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1703779200000 implements MigrationInterface {
  name = 'CreateTables1703779200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text,
        "date" TIMESTAMP NOT NULL,
        "location" varchar,
        "max_attendees" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "attendees" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "email" varchar NOT NULL UNIQUE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "registrations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "event_id" uuid NOT NULL REFERENCES events(id),
        "attendee_id" uuid NOT NULL REFERENCES attendees(id),
        "registered_at" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("event_id", "attendee_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "registrations"`);
    await queryRunner.query(`DROP TABLE "attendees"`);
    await queryRunner.query(`DROP TABLE "events"`);
  }
} 