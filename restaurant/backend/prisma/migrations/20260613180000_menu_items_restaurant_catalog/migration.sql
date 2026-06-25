-- Create junction table
CREATE TABLE "menu_section_item" (
    "sectionId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_section_item_pkey" PRIMARY KEY ("sectionId","menuItemId")
);

-- Add restaurantId to menu_item
ALTER TABLE "menu_item" ADD COLUMN "restaurantId" TEXT;

-- Backfill restaurantId from section -> menu
UPDATE "menu_item" AS mi
SET "restaurantId" = m."restaurantId"
FROM "menu_section" AS ms
JOIN "menu" AS m ON m.uuid = ms."menuId"
WHERE mi."sectionId" = ms.uuid;

-- Migrate section links
INSERT INTO "menu_section_item" ("sectionId", "menuItemId", "sortOrder")
SELECT "sectionId", uuid, "sortOrder"
FROM "menu_item"
WHERE "deletedAt" IS NULL;

-- Enforce restaurantId
ALTER TABLE "menu_item" ALTER COLUMN "restaurantId" SET NOT NULL;

-- Drop old section relation
ALTER TABLE "menu_item" DROP CONSTRAINT IF EXISTS "menu_item_sectionId_fkey";
DROP INDEX IF EXISTS "menu_item_sectionId_sortOrder_idx";
ALTER TABLE "menu_item" DROP COLUMN "sectionId";
ALTER TABLE "menu_item" DROP COLUMN "sortOrder";

-- Foreign keys
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "menu_item_restaurantId_idx" ON "menu_item"("restaurantId");

ALTER TABLE "menu_section_item" ADD CONSTRAINT "menu_section_item_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "menu_section"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_section_item" ADD CONSTRAINT "menu_section_item_menuItemId_fkey"
    FOREIGN KEY ("menuItemId") REFERENCES "menu_item"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "menu_section_item_sectionId_sortOrder_idx" ON "menu_section_item"("sectionId", "sortOrder");
