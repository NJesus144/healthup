/*
  Warnings:

  - The primary key for the `appointments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `blocked_dates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `doctor_availability` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "blocked_dates" DROP CONSTRAINT "blocked_dates_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "doctor_availability" DROP CONSTRAINT "doctor_availability_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "patient_id" SET DATA TYPE TEXT,
ALTER COLUMN "doctor_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "appointments_id_seq";

-- AlterTable
ALTER TABLE "blocked_dates" DROP CONSTRAINT "blocked_dates_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "doctor_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "blocked_dates_id_seq";

-- AlterTable
ALTER TABLE "doctor_availability" DROP CONSTRAINT "doctor_availability_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "doctor_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "doctor_availability_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "doctor_availability_id_seq";

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "appointment_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "notifications_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "doctor_availability" ADD CONSTRAINT "doctor_availability_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
