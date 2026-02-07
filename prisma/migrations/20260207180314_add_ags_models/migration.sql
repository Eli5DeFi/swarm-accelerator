/*
  Warnings:

  - You are about to alter the column `metadata` on the `Memory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `context` on the `MemorySearch` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "walletAddress" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "apiKey" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("provider", "providerAccountId"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,

    PRIMARY KEY ("identifier", "token")
);

-- CreateTable
CREATE TABLE "Startup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "fundingAsk" INTEGER NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "founderName" TEXT NOT NULL,
    "founderEmail" TEXT NOT NULL,
    "website" TEXT,
    "deckUrl" TEXT,
    "pitchVideo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Startup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "financialScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "marketScore" INTEGER NOT NULL,
    "legalScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "financialFeedback" JSONB NOT NULL,
    "technicalFeedback" JSONB NOT NULL,
    "marketFeedback" JSONB NOT NULL,
    "legalFeedback" JSONB NOT NULL,
    "valuation" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "offersGenerated" JSONB,
    "analysisStartedAt" DATETIME NOT NULL,
    "analysisCompletedAt" DATETIME,
    "analysisDuration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Funding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "dealAmount" INTEGER NOT NULL,
    "equityPercent" REAL NOT NULL,
    "dealType" TEXT NOT NULL,
    "acceptedAt" DATETIME NOT NULL,
    "totalReleased" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Funding_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fundingId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txHash" TEXT,
    "completedAt" DATETIME,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Milestone_fundingId_fkey" FOREIGN KEY ("fundingId") REFERENCES "Funding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VCMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "vcId" TEXT NOT NULL,
    "interested" BOOLEAN NOT NULL DEFAULT false,
    "interestLevel" INTEGER NOT NULL,
    "feedback" TEXT,
    "personaResponse" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VCMatch_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VCMatch_vcId_fkey" FOREIGN KEY ("vcId") REFERENCES "VC" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fundSize" TEXT NOT NULL,
    "focusAreas" TEXT NOT NULL,
    "stagePreference" TEXT NOT NULL,
    "investmentRangeMin" INTEGER NOT NULL,
    "investmentRangeMax" INTEGER NOT NULL,
    "thesis" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "personaName" TEXT,
    "personaPersonality" TEXT,
    "personaStyle" TEXT,
    "riskTolerance" TEXT NOT NULL DEFAULT 'MODERATE',
    "priorities" TEXT NOT NULL,
    "assistantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoachingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "threadId" TEXT,
    "messages" JSONB NOT NULL,
    "actionItems" JSONB NOT NULL,
    "nextCheckIn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachingSession_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "agentType" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketingCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "schedule" JSONB,
    "metrics" JSONB,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "MarketingCampaign_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT,
    "agentName" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "result" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    CONSTRAINT "AgentActivity_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "referredBy" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ExitAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "revenue" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ANALYZING',
    "valuationLow" INTEGER,
    "valuationBase" INTEGER,
    "valuationHigh" INTEGER,
    "readinessScore" INTEGER,
    "recommendation" TEXT,
    "topAcquirers" TEXT NOT NULL,
    "fullReport" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "fundingType" TEXT NOT NULL,
    "amountSeeking" INTEGER NOT NULL,
    "valuation" INTEGER,
    "tokenPrice" REAL,
    "minTicketSize" INTEGER NOT NULL,
    "maxTicketSize" INTEGER NOT NULL,
    "revenue" INTEGER NOT NULL,
    "revenueGrowth" INTEGER NOT NULL,
    "customers" INTEGER NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "traction" TEXT NOT NULL,
    "moat" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "investmentThesis" TEXT,
    "keyRisks" TEXT NOT NULL,
    "keyOpportunities" TEXT NOT NULL,
    "comparables" TEXT NOT NULL,
    "exitScenarios" TEXT NOT NULL,
    "idealInvestorTypes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "focusAreas" TEXT NOT NULL,
    "stagePreference" TEXT NOT NULL,
    "checkSizeMin" INTEGER NOT NULL,
    "checkSizeMax" INTEGER NOT NULL,
    "geography" TEXT NOT NULL,
    "fundingTypes" TEXT NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "investmentThesis" TEXT NOT NULL,
    "priorities" TEXT NOT NULL,
    "dealBreakers" TEXT NOT NULL,
    "portfolioCompanies" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "industryFit" INTEGER NOT NULL,
    "stageFit" INTEGER NOT NULL,
    "ticketSizeFit" INTEGER NOT NULL,
    "geographyFit" INTEGER NOT NULL,
    "fundingTypeFit" INTEGER NOT NULL,
    "thesisFit" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,
    "synergies" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "investorViewed" BOOLEAN NOT NULL DEFAULT false,
    "investorInterested" BOOLEAN NOT NULL DEFAULT false,
    "projectViewed" BOOLEAN NOT NULL DEFAULT false,
    "meetingScheduled" DATETIME,
    "meetingNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "companyId" TEXT,
    "totalSupply" INTEGER,
    "circulatingSupply" INTEGER,
    "contractAddress" TEXT,
    "chainId" INTEGER,
    "accreditedOnly" BOOLEAN NOT NULL DEFAULT false,
    "lockupPeriod" INTEGER,
    "transferRestrictions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "price" REAL,
    "minQuantity" REAL,
    "maxQuantity" REAL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "filledQuantity" REAL NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "buyOrderId" TEXT NOT NULL,
    "sellOrderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "price" REAL NOT NULL,
    "totalValue" REAL NOT NULL,
    "settlementStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "settlementMethod" TEXT NOT NULL,
    "settlementTxHash" TEXT,
    "buyerFee" REAL NOT NULL,
    "sellerFee" REAL NOT NULL,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" DATETIME,
    CONSTRAINT "Trade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trade_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trade_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "marketTam" TEXT NOT NULL,
    "marketGrowth" TEXT NOT NULL,
    "marketSegment" TEXT NOT NULL,
    "moat" TEXT NOT NULL,
    "revenueModel" TEXT NOT NULL,
    "targetCustomer" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "competitiveAdvantage" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "selectedFounderId" TEXT,
    CONSTRAINT "GeneratedIdea_selectedFounderId_fkey" FOREIGN KEY ("selectedFounderId") REFERENCES "FounderApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FounderApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedIn" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "bio" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "commitment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "interviewScore" INTEGER,
    "interviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FounderApplication_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "GeneratedIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Memory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "memoryType" TEXT NOT NULL DEFAULT 'evaluation',
    "entityId" TEXT,
    "entityType" TEXT,
    "userId" TEXT,
    "startupId" TEXT,
    "metadata" JSONB,
    "relevanceScore" REAL,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Memory_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Memory" ("accessCount", "content", "createdAt", "embedding", "entityId", "entityType", "id", "lastAccessedAt", "memoryType", "metadata", "relevanceScore", "startupId", "updatedAt", "userId") SELECT "accessCount", "content", "createdAt", "embedding", "entityId", "entityType", "id", "lastAccessedAt", "memoryType", "metadata", "relevanceScore", "startupId", "updatedAt", "userId" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
CREATE INDEX "Memory_memoryType_idx" ON "Memory"("memoryType");
CREATE INDEX "Memory_entityId_entityType_idx" ON "Memory"("entityId", "entityType");
CREATE INDEX "Memory_userId_idx" ON "Memory"("userId");
CREATE INDEX "Memory_startupId_idx" ON "Memory"("startupId");
CREATE INDEX "Memory_createdAt_idx" ON "Memory"("createdAt");
CREATE INDEX "Memory_relevanceScore_idx" ON "Memory"("relevanceScore");
CREATE TABLE "new_MemorySearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "queryEmbedding" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "topResultIds" TEXT NOT NULL,
    "averageScore" REAL,
    "context" JSONB,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemorySearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MemorySearch" ("averageScore", "context", "createdAt", "id", "query", "queryEmbedding", "resultCount", "topResultIds", "userId") SELECT "averageScore", "context", "createdAt", "id", "query", "queryEmbedding", "resultCount", "topResultIds", "userId" FROM "MemorySearch";
DROP TABLE "MemorySearch";
ALTER TABLE "new_MemorySearch" RENAME TO "MemorySearch";
CREATE INDEX "MemorySearch_userId_idx" ON "MemorySearch"("userId");
CREATE INDEX "MemorySearch_createdAt_idx" ON "MemorySearch"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_apiKey_idx" ON "User"("apiKey");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Startup_status_idx" ON "Startup"("status");

-- CreateIndex
CREATE INDEX "Startup_createdAt_idx" ON "Startup"("createdAt");

-- CreateIndex
CREATE INDEX "Startup_userId_idx" ON "Startup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_startupId_key" ON "Analysis"("startupId");

-- CreateIndex
CREATE INDEX "Analysis_recommendation_idx" ON "Analysis"("recommendation");

-- CreateIndex
CREATE UNIQUE INDEX "Funding_startupId_key" ON "Funding"("startupId");

-- CreateIndex
CREATE INDEX "Funding_status_idx" ON "Funding"("status");

-- CreateIndex
CREATE INDEX "Milestone_fundingId_idx" ON "Milestone"("fundingId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE INDEX "VCMatch_status_idx" ON "VCMatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VCMatch_startupId_vcId_key" ON "VCMatch"("startupId", "vcId");

-- CreateIndex
CREATE UNIQUE INDEX "VC_email_key" ON "VC"("email");

-- CreateIndex
CREATE INDEX "VC_firmName_idx" ON "VC"("firmName");

-- CreateIndex
CREATE INDEX "CoachingSession_startupId_agentType_idx" ON "CoachingSession"("startupId", "agentType");

-- CreateIndex
CREATE INDEX "Message_startupId_createdAt_idx" ON "Message"("startupId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketingCampaign_startupId_status_idx" ON "MarketingCampaign"("startupId", "status");

-- CreateIndex
CREATE INDEX "AgentActivity_startupId_agentType_idx" ON "AgentActivity"("startupId", "agentType");

-- CreateIndex
CREATE INDEX "AgentActivity_status_idx" ON "AgentActivity"("status");

-- CreateIndex
CREATE INDEX "AgentActivity_startedAt_idx" ON "AgentActivity"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE INDEX "WaitlistEntry_email_idx" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_idx" ON "WaitlistEntry"("createdAt");

-- CreateIndex
CREATE INDEX "ExitAnalysis_status_idx" ON "ExitAnalysis"("status");

-- CreateIndex
CREATE INDEX "ExitAnalysis_createdAt_idx" ON "ExitAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_industry_idx" ON "Project"("industry");

-- CreateIndex
CREATE INDEX "Project_fundingType_idx" ON "Project"("fundingType");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_email_key" ON "Investor"("email");

-- CreateIndex
CREATE INDEX "Investor_type_idx" ON "Investor"("type");

-- CreateIndex
CREATE INDEX "Investor_active_idx" ON "Investor"("active");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_overallScore_idx" ON "Match"("overallScore");

-- CreateIndex
CREATE UNIQUE INDEX "Match_projectId_investorId_key" ON "Match"("projectId", "investorId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_key" ON "Asset"("symbol");

-- CreateIndex
CREATE INDEX "Asset_symbol_idx" ON "Asset"("symbol");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "Order_assetId_status_idx" ON "Order"("assetId", "status");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Trade_assetId_idx" ON "Trade"("assetId");

-- CreateIndex
CREATE INDEX "Trade_buyerId_idx" ON "Trade"("buyerId");

-- CreateIndex
CREATE INDEX "Trade_sellerId_idx" ON "Trade"("sellerId");

-- CreateIndex
CREATE INDEX "Trade_executedAt_idx" ON "Trade"("executedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedIdea_selectedFounderId_key" ON "GeneratedIdea"("selectedFounderId");

-- CreateIndex
CREATE INDEX "GeneratedIdea_status_idx" ON "GeneratedIdea"("status");

-- CreateIndex
CREATE INDEX "GeneratedIdea_score_idx" ON "GeneratedIdea"("score");

-- CreateIndex
CREATE INDEX "GeneratedIdea_generatedAt_idx" ON "GeneratedIdea"("generatedAt");

-- CreateIndex
CREATE INDEX "FounderApplication_ideaId_idx" ON "FounderApplication"("ideaId");

-- CreateIndex
CREATE INDEX "FounderApplication_status_idx" ON "FounderApplication"("status");

-- CreateIndex
CREATE INDEX "FounderApplication_createdAt_idx" ON "FounderApplication"("createdAt");
