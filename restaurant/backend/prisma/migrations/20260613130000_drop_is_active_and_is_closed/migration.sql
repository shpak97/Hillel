-- Restaurant: sync deactivatedAt from isActive, drop isActive
UPDATE "restaurant"
SET "deactivatedAt" = COALESCE("deactivatedAt", NOW())
WHERE "isActive" = false AND "deletedAt" IS NULL;

ALTER TABLE "restaurant" DROP COLUMN "isActive";

-- Menu: add deactivatedAt, migrate, drop isActive
ALTER TABLE "menu" ADD COLUMN "deactivatedAt" TIMESTAMP(3);

UPDATE "menu"
SET "deactivatedAt" = NOW()
WHERE "isActive" = false AND "deletedAt" IS NULL;

ALTER TABLE "menu" DROP COLUMN "isActive";

-- Table: add deactivatedAt, migrate, drop isActive
ALTER TABLE "restaurant_table" ADD COLUMN "deactivatedAt" TIMESTAMP(3);

UPDATE "restaurant_table"
SET "deactivatedAt" = NOW()
WHERE "isActive" = false AND "deletedAt" IS NULL;

ALTER TABLE "restaurant_table" DROP COLUMN "isActive";

-- Hours overrides: closed rows -> 00:00-00:00, drop isClosed
UPDATE "restaurant_hours_override"
SET "opensAt" = '00:00', "closesAt" = '00:00'
WHERE "isClosed" = true;

DELETE FROM "restaurant_hours_override"
WHERE "isClosed" = false AND ("opensAt" IS NULL OR "closesAt" IS NULL);

ALTER TABLE "restaurant_hours_override"
  ALTER COLUMN "opensAt" SET NOT NULL,
  ALTER COLUMN "closesAt" SET NOT NULL;

ALTER TABLE "restaurant_hours_override" DROP COLUMN "isClosed";

UPDATE "menu_hours_override"
SET "opensAt" = '00:00', "closesAt" = '00:00'
WHERE "isClosed" = true;

DELETE FROM "menu_hours_override"
WHERE "isClosed" = false AND ("opensAt" IS NULL OR "closesAt" IS NULL);

ALTER TABLE "menu_hours_override"
  ALTER COLUMN "opensAt" SET NOT NULL,
  ALTER COLUMN "closesAt" SET NOT NULL;

ALTER TABLE "menu_hours_override" DROP COLUMN "isClosed";
