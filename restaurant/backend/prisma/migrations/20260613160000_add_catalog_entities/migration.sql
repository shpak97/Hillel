CREATE TYPE "MeasureUnit" AS ENUM ('G', 'KG', 'ML', 'L', 'PCS', 'PORTION');

CREATE TABLE "ingredient" (
    "uuid" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUnit" "MeasureUnit" NOT NULL,
    "deactivatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ingredient_pkey" PRIMARY KEY ("uuid")
);

CREATE TABLE "product" (
    "uuid" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "baseUnit" "MeasureUnit" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("uuid")
);

CREATE TABLE "product_ingredient" (
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" "MeasureUnit" NOT NULL,

    CONSTRAINT "product_ingredient_pkey" PRIMARY KEY ("productId","ingredientId")
);

CREATE TABLE "menu_section" (
    "uuid" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deactivatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "menu_section_pkey" PRIMARY KEY ("uuid")
);

CREATE TABLE "menu_item" (
    "uuid" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deactivatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "menu_item_pkey" PRIMARY KEY ("uuid")
);

CREATE TABLE "menu_item_product" (
    "menuItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "priceOverride" DECIMAL(10,2),

    CONSTRAINT "menu_item_product_pkey" PRIMARY KEY ("menuItemId","productId")
);

CREATE INDEX "ingredient_restaurantId_idx" ON "ingredient"("restaurantId");
CREATE INDEX "product_restaurantId_idx" ON "product"("restaurantId");
CREATE INDEX "menu_section_menuId_sortOrder_idx" ON "menu_section"("menuId", "sortOrder");
CREATE INDEX "menu_item_sectionId_sortOrder_idx" ON "menu_item"("sectionId", "sortOrder");

ALTER TABLE "ingredient" ADD CONSTRAINT "ingredient_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product" ADD CONSTRAINT "product_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_ingredient" ADD CONSTRAINT "product_ingredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_ingredient" ADD CONSTRAINT "product_ingredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_section" ADD CONSTRAINT "menu_section_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "menu_section"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_item_product" ADD CONSTRAINT "menu_item_product_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_item"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_item_product" ADD CONSTRAINT "menu_item_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
