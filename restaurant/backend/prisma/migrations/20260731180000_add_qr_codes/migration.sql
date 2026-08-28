-- CreateTable
CREATE TABLE "qr_code" (
    "uuid" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deactivatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_code_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "qr_code_menu" (
    "qrCodeId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "selectTable" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "qr_code_menu_pkey" PRIMARY KEY ("qrCodeId","menuId")
);

-- CreateIndex
CREATE INDEX "qr_code_restaurantId_idx" ON "qr_code"("restaurantId");

-- CreateIndex
CREATE INDEX "qr_code_menu_qrCodeId_sortOrder_idx" ON "qr_code_menu"("qrCodeId", "sortOrder");

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code_menu" ADD CONSTRAINT "qr_code_menu_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_code"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code_menu" ADD CONSTRAINT "qr_code_menu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
