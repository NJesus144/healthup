/*
  Warnings:

  - You are about to drop the `doctor_availability` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctor_availability" DROP CONSTRAINT "doctor_availability_doctor_id_fkey";

-- DropTable
DROP TABLE "doctor_availability";
