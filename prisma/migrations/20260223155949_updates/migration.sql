-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE "User_subscriptions" ALTER COLUMN "auto_renew" SET DEFAULT false;
