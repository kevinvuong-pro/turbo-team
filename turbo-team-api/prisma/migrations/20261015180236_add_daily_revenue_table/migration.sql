-- CreateTable
CREATE TABLE "daily_revenues" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "posRevenue" DECIMAL(12,2) NOT NULL,
    "eatclubRevenue" DECIMAL(12,2) NOT NULL,
    "labourCosts" DECIMAL(12,2) NOT NULL,
    "covers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_revenues_date_key" ON "daily_revenues"("date");

-- CreateIndex
CREATE INDEX "daily_revenues_date_idx" ON "daily_revenues"("date");
