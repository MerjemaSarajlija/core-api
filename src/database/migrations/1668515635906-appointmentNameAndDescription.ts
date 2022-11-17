import {MigrationInterface, QueryRunner} from "typeorm";

export class appointmentNameAndDescription1668515635906 implements MigrationInterface {
    name = 'appointmentNameAndDescription1668515635906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ADD "patientName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "availability" DROP CONSTRAINT "FK_05b50765bd00c64bfe8052d2b6e"`);
        await queryRunner.query(`ALTER TABLE "availability" ALTER COLUMN "doctorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "FK_05b50765bd00c64bfe8052d2b6e" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "availability" DROP CONSTRAINT "FK_05b50765bd00c64bfe8052d2b6e"`);
        await queryRunner.query(`ALTER TABLE "availability" ALTER COLUMN "doctorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "FK_05b50765bd00c64bfe8052d2b6e" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "patientName"`);
    }

}
