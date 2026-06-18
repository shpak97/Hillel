-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Kyiv';

-- CreateTable
CREATE TABLE "restaurant_weekly_hours" (
    "id" SERIAL NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "restaurant_weekly_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_hours_override" (
    "id" SERIAL NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "restaurant_hours_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_weekly_hours_restaurantId_dayOfWeek_idx" ON "restaurant_weekly_hours"("restaurantId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "restaurant_hours_override_restaurantId_date_idx" ON "restaurant_hours_override"("restaurantId", "date");

-- AddForeignKey
ALTER TABLE "restaurant_weekly_hours" ADD CONSTRAINT "restaurant_weekly_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_hours_override" ADD CONSTRAINT "restaurant_hours_override_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
