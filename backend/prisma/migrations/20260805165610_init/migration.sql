-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PRState" AS ENUM ('OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'COMMENTED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('WARNING', 'CAUTION', 'INFO', 'SUCCESS');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('BOTTLENECK', 'WORKLOAD', 'VELOCITY', 'COLLABORATION', 'QUALITY', 'STRATEGIC');

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "encryptedToken" TEXT NOT NULL,
    "tokenCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "githubLogin" TEXT,
    "githubUserId" INTEGER,
    "email" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "githubRepoId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "githubPrId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" "PRState" NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "authorLogin" TEXT NOT NULL,
    "authorAvatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "mergedAt" TIMESTAMP(3),
    "linesAdded" INTEGER NOT NULL DEFAULT 0,
    "linesDeleted" INTEGER NOT NULL DEFAULT 0,
    "filesChanged" INTEGER NOT NULL DEFAULT 0,
    "commitsCount" INTEGER NOT NULL DEFAULT 0,
    "timeToFirstReview" INTEGER,
    "timeToMerge" INTEGER,
    "reviewCycleCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "githubReviewId" INTEGER NOT NULL,
    "pullRequestId" TEXT NOT NULL,
    "reviewerLogin" TEXT NOT NULL,
    "reviewerAvatarUrl" TEXT,
    "state" "ReviewState" NOT NULL,
    "body" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "githubCommentId" INTEGER NOT NULL,
    "pullRequestId" TEXT NOT NULL,
    "authorLogin" TEXT NOT NULL,
    "authorAvatarUrl" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "repositoryId" TEXT,
    "ownerId" TEXT,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "priority" INTEGER NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "cycleTimeP50" INTEGER,
    "cycleTimeP95" INTEGER,
    "mergeRate" DOUBLE PRECISION,
    "prsOpened" INTEGER NOT NULL DEFAULT 0,
    "prsMerged" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "ownerId" TEXT NOT NULL,
    "memberLogins" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_sessionId_key" ON "AppSettings"("sessionId");

-- CreateIndex
CREATE INDEX "AppSettings_githubLogin_idx" ON "AppSettings"("githubLogin");

-- CreateIndex
CREATE INDEX "AppSettings_sessionId_idx" ON "AppSettings"("sessionId");

-- CreateIndex
CREATE INDEX "Repository_fullName_idx" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_lastSyncedAt_idx" ON "Repository"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "Repository_isActive_idx" ON "Repository"("isActive");

-- CreateIndex
CREATE INDEX "Repository_ownerId_idx" ON "Repository"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_ownerId_githubRepoId_key" ON "Repository"("ownerId", "githubRepoId");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_createdAt_idx" ON "PullRequest"("repositoryId", "createdAt");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_mergedAt_idx" ON "PullRequest"("repositoryId", "mergedAt");

-- CreateIndex
CREATE INDEX "PullRequest_state_idx" ON "PullRequest"("state");

-- CreateIndex
CREATE INDEX "PullRequest_mergedAt_idx" ON "PullRequest"("mergedAt");

-- CreateIndex
CREATE INDEX "PullRequest_updatedAt_idx" ON "PullRequest"("updatedAt");

-- CreateIndex
CREATE INDEX "PullRequest_authorLogin_idx" ON "PullRequest"("authorLogin");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_authorLogin_idx" ON "PullRequest"("repositoryId", "authorLogin");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Review_githubReviewId_key" ON "Review"("githubReviewId");

-- CreateIndex
CREATE INDEX "Review_pullRequestId_idx" ON "Review"("pullRequestId");

-- CreateIndex
CREATE INDEX "Review_reviewerLogin_idx" ON "Review"("reviewerLogin");

-- CreateIndex
CREATE INDEX "Review_submittedAt_idx" ON "Review"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_githubCommentId_key" ON "Comment"("githubCommentId");

-- CreateIndex
CREATE INDEX "Comment_pullRequestId_idx" ON "Comment"("pullRequestId");

-- CreateIndex
CREATE INDEX "Comment_authorLogin_idx" ON "Comment"("authorLogin");

-- CreateIndex
CREATE INDEX "SyncJob_status_idx" ON "SyncJob"("status");

-- CreateIndex
CREATE INDEX "SyncJob_createdAt_idx" ON "SyncJob"("createdAt");

-- CreateIndex
CREATE INDEX "Insight_generatedAt_idx" ON "Insight"("generatedAt");

-- CreateIndex
CREATE INDEX "Insight_priority_idx" ON "Insight"("priority");

-- CreateIndex
CREATE INDEX "Insight_ownerId_idx" ON "Insight"("ownerId");

-- CreateIndex
CREATE INDEX "MetricSnapshot_date_idx" ON "MetricSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MetricSnapshot_repositoryId_date_key" ON "MetricSnapshot"("repositoryId", "date");

-- CreateIndex
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");

-- CreateIndex
CREATE INDEX "Team_ownerId_name_idx" ON "Team"("ownerId", "name");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AppSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AppSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AppSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricSnapshot" ADD CONSTRAINT "MetricSnapshot_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AppSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

