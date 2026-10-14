-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_REOPENED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_COMMENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_ATTACHMENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_LABEL';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_PRIORITY_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_STATUS_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_DUE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOARD_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COLUMN_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'USER_MENTIONED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WORKSPACE_INVITE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SYSTEM';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SECURITY';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EMAIL';

-- AlterTable
ALTER TABLE "Board" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
ALTER TABLE "Board" ADD COLUMN IF NOT EXISTS "icon" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'NORMAL';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
    "userId" INTEGER NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "browserNotifications" BOOLEAN NOT NULL DEFAULT true,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "taskNotifications" BOOLEAN NOT NULL DEFAULT true,
    "commentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "mentionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_recipientId_isRead_deletedAt_archivedAt_idx" ON "Notification"("recipientId", "isRead", "deletedAt", "archivedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_senderId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'NotificationPreference_userId_fkey') THEN
    ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

