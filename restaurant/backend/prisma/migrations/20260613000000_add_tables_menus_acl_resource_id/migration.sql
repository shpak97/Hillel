-- AlterTable
ALTER TABLE "acl" ADD COLUMN "resourceId" TEXT NOT NULL DEFAULT '*';

-- DropIndex
DROP INDEX "acl_userId_restaurantId_resource_permission_key";

-- CreateIndex
CREATE UNIQUE INDEX "acl_userId_restaurantId_resource_resourceId_permission_key" ON "acl"("userId", "restaurantId", "resource", "resourceId", "permission");

-- CreateTable
CREATE TABLE "restaurant_table" (
    "uuid" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "restaurant_table_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "menu" (
    "uuid" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "menu_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "table_menu" (
    "tableId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "table_menu_pkey" PRIMARY KEY ("tableId","menuId")
);

-- CreateTable
CREATE TABLE "menu_weekly_hours" (
    "id" SERIAL NOT NULL,
    "menuId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_weekly_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_hours_override" (
    "id" SERIAL NOT NULL,
    "menuId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_hours_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_table_restaurantId_idx" ON "restaurant_table"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_table_restaurantId_label_key" ON "restaurant_table"("restaurantId", "label");

-- CreateIndex
CREATE INDEX "menu_restaurantId_idx" ON "menu"("restaurantId");

-- CreateIndex
CREATE INDEX "menu_weekly_hours_menuId_dayOfWeek_idx" ON "menu_weekly_hours"("menuId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "menu_hours_override_menuId_date_idx" ON "menu_hours_override"("menuId", "date");

-- AddForeignKey
ALTER TABLE "restaurant_table" ADD CONSTRAINT "restaurant_table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_menu" ADD CONSTRAINT "table_menu_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "restaurant_table"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_menu" ADD CONSTRAINT "table_menu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_weekly_hours" ADD CONSTRAINT "menu_weekly_hours_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_hours_override" ADD CONSTRAINT "menu_hours_override_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
