/*
  Warnings:

  - Added the required column `reservationId` to the `Avis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note" INTEGER NOT NULL DEFAULT 0,
    "commentaire" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteurId" TEXT NOT NULL,
    "cibleId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    CONSTRAINT "Avis_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avis_cibleId_fkey" FOREIGN KEY ("cibleId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avis_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avis" ("auteurId", "cibleId", "commentaire", "date", "id", "note") SELECT "auteurId", "cibleId", "commentaire", "date", "id", "note" FROM "Avis";
DROP TABLE "Avis";
ALTER TABLE "new_Avis" RENAME TO "Avis";
CREATE UNIQUE INDEX "Avis_reservationId_key" ON "Avis"("reservationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
