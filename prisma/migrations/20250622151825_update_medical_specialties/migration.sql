/*
  Warnings:

  - The values [CARDIOLOGIA,DERMATOLOGIA,CLINICO_GERAL,FISIOTERAPIA,ENDOCRINOLOGIA,ORTOPEDIA,GINECOLOGIA,PEDIATRIA,PSIQUIATRIA,OFTALMOLOGIA] on the enum `MedicalSpecialty` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MedicalSpecialty_new" AS ENUM ('CARDIOLOGY', 'DERMATOLOGY', 'GENERAL_PRACTICE', 'PHYSIOTHERAPY', 'ENDOCRINOLOGY', 'ORTHOPEDICS');
ALTER TABLE "users" ALTER COLUMN "specialty" TYPE "MedicalSpecialty_new" USING ("specialty"::text::"MedicalSpecialty_new");
ALTER TYPE "MedicalSpecialty" RENAME TO "MedicalSpecialty_old";
ALTER TYPE "MedicalSpecialty_new" RENAME TO "MedicalSpecialty";
DROP TYPE "MedicalSpecialty_old";
COMMIT;
