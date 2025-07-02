/*
  Warnings:

  - You are about to drop the `Réservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `crééLe` on the `Trajet` table. All the data in the column will be lost.
  - You are about to drop the column `départ` on the `Trajet` table. All the data in the column will be lost.
  - You are about to drop the column `crééLe` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `crééLe` on the `Voiture` table. All the data in the column will be lost.
  - You are about to drop the column `modèle` on the `Voiture` table. All the data in the column will be lost.
  - Added the required column `depart` to the `Trajet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modele` to the `Voiture` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Réservation";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trajetId" TEXT NOT NULL,
    "passagerId" TEXT NOT NULL,
    "nbPlaces" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "Trajet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_passagerId_fkey" FOREIGN KEY ("passagerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paiement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "utilisateurId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "fournisseur" TEXT NOT NULL,
    "transactionRef" TEXT,
    "datePaiement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paiement_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Paiement_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Paiement" ("datePaiement", "fournisseur", "id", "montant", "reservationId", "statut", "transactionRef", "utilisateurId") SELECT "datePaiement", "fournisseur", "id", "montant", "reservationId", "statut", "transactionRef", "utilisateurId" FROM "Paiement";
DROP TABLE "Paiement";
ALTER TABLE "new_Paiement" RENAME TO "Paiement";
CREATE UNIQUE INDEX "Paiement_reservationId_key" ON "Paiement"("reservationId");
CREATE TABLE "new_Trajet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "depart" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "places" INTEGER NOT NULL,
    "prix" REAL NOT NULL,
    "conducteurId" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL,
    CONSTRAINT "Trajet_conducteurId_fkey" FOREIGN KEY ("conducteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trajet" ("conducteurId", "date", "destination", "id", "modifLe", "places", "prix") SELECT "conducteurId", "date", "destination", "id", "modifLe", "places", "prix" FROM "Trajet";
DROP TABLE "Trajet";
ALTER TABLE "new_Trajet" RENAME TO "Trajet";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'UTILISATEUR',
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL
);
INSERT INTO "new_User" ("email", "id", "modifLe", "motDePasse", "nom", "type") SELECT "email", "id", "modifLe", "motDePasse", "nom", "type" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Voiture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL,
    CONSTRAINT "Voiture_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Voiture" ("couleur", "id", "immatriculation", "marque", "modifLe", "proprietaireId") SELECT "couleur", "id", "immatriculation", "marque", "modifLe", "proprietaireId" FROM "Voiture";
DROP TABLE "Voiture";
ALTER TABLE "new_Voiture" RENAME TO "Voiture";
CREATE UNIQUE INDEX "Voiture_immatriculation_key" ON "Voiture"("immatriculation");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
