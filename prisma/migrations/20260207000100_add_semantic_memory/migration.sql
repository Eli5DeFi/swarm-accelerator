-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "memoryType" TEXT NOT NULL DEFAULT 'evaluation',
    "entityId" TEXT,
    "entityType" TEXT,
    "userId" TEXT,
    "startupId" TEXT,
    "metadata" TEXT,
    "relevanceScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" DATETIME,
    CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Memory_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemorySearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "queryEmbedding" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "topResultIds" TEXT NOT NULL,
    "averageScore" REAL,
    "context" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemorySearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Memory_memoryType_idx" ON "Memory"("memoryType");

-- CreateIndex
CREATE INDEX "Memory_entityId_entityType_idx" ON "Memory"("entityId", "entityType");

-- CreateIndex
CREATE INDEX "Memory_userId_idx" ON "Memory"("userId");

-- CreateIndex
CREATE INDEX "Memory_startupId_idx" ON "Memory"("startupId");

-- CreateIndex
CREATE INDEX "Memory_createdAt_idx" ON "Memory"("createdAt");

-- CreateIndex
CREATE INDEX "Memory_relevanceScore_idx" ON "Memory"("relevanceScore");

-- CreateIndex
CREATE INDEX "MemorySearch_userId_idx" ON "MemorySearch"("userId");

-- CreateIndex
CREATE INDEX "MemorySearch_createdAt_idx" ON "MemorySearch"("createdAt");
