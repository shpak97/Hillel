-- DropTable
DROP TABLE IF EXISTS "restaurant_weekly_hours";
DROP TABLE IF EXISTS "restaurant_hours_override";
DROP TABLE IF EXISTS "menu_weekly_hours";
DROP TABLE IF EXISTS "menu_hours_override";

-- CreateTable
CREATE TABLE "restaurant_hours" (
    "id" SERIAL NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "date" DATE,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,

    CONSTRAINT "restaurant_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_hours" (
    "id" SERIAL NOT NULL,
    "menuId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "date" DATE,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,

    CONSTRAINT "menu_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_hours_restaurantId_dayOfWeek_idx" ON "restaurant_hours"("restaurantId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "restaurant_hours_restaurantId_date_idx" ON "restaurant_hours"("restaurantId", "date");

-- CreateIndex
CREATE INDEX "menu_hours_menuId_dayOfWeek_idx" ON "menu_hours"("menuId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "menu_hours_menuId_date_idx" ON "menu_hours"("menuId", "date");

-- AddForeignKey
ALTER TABLE "restaurant_hours" ADD CONSTRAINT "restaurant_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_hours" ADD CONSTRAINT "menu_hours_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
