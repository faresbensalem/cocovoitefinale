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
    "effectue" BOOLEAN NOT NULL DEFAULT false,
    "conducteurId" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL,
    CONSTRAINT "Trajet_conducteurId_fkey" FOREIGN KEY ("conducteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trajet" ("adresseArrivee", "adresseDepart", "animauxAcceptes", "bagagesAcceptes", "conducteurId", "creeLe", "date", "depart", "destination", "id", "modifLe", "places", "prix") SELECT "adresseArrivee", "adresseDepart", "animauxAcceptes", "bagagesAcceptes", "conducteurId", "creeLe", "date", "depart", "destination", "id", "modifLe", "places", "prix" FROM "Trajet";
DROP TABLE "Trajet";
ALTER TABLE "new_Trajet" RENAME TO "Trajet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
