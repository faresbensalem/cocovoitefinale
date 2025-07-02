/*
  Warnings:

  - Added the required column `adresseArrivee` to the `Trajet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adresseDepart` to the `Trajet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "dateNaissance" DATETIME;
ALTER TABLE "User" ADD COLUMN "numero" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trajet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "depart" TEXT NOT NULL,
    "adresseDepart" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "adresseArrivee" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "places" INTEGER NOT NULL,
    "prix" REAL NOT NULL,
    "animauxAcceptes" BOOLEAN NOT NULL DEFAULT false,
    "bagagesAcceptes" BOOLEAN NOT NULL DEFAULT true,
    "conducteurId" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL,
    CONSTRAINT "Trajet_conducteurId_fkey" FOREIGN KEY ("conducteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trajet" ("conducteurId", "creeLe", "date", "depart", "destination", "id", "modifLe", "places", "prix") SELECT "conducteurId", "creeLe", "date", "depart", "destination", "id", "modifLe", "places", "prix" FROM "Trajet";
DROP TABLE "Trajet";
ALTER TABLE "new_Trajet" RENAME TO "Trajet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
