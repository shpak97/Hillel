-- CreateTable
CREATE TABLE "acl" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "acl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "acl_userId_idx" ON "acl"("userId");

-- CreateIndex
CREATE INDEX "acl_restaurantId_idx" ON "acl"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "acl_userId_restaurantId_resource_permission_key" ON "acl"("userId", "restaurantId", "resource", "permission");

-- AddForeignKey
ALTER TABLE "acl" ADD CONSTRAINT "acl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acl" ADD CONSTRAINT "acl_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill owner write access for existing restaurants
INSERT INTO "acl" ("userId", "restaurantId", "resource", "permission")
SELECT "ownerId", "uuid", 'restaurant', 'write'
FROM "restaurant"
ON CONFLICT ("userId", "restaurantId", "resource", "permission") DO NOTHING;
