/*
  Warnings:

  - You are about to drop the `Objet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Objet";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'UTILISATEUR',
    "crééLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Voiture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marque" TEXT NOT NULL,
    "modèle" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "crééLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL,
    CONSTRAINT "Voiture_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trajet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "départ" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "places" INTEGER NOT NULL,
    "prix" REAL NOT NULL,
    "conducteurId" TEXT NOT NULL,
    "crééLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL,
    CONSTRAINT "Trajet_conducteurId_fkey" FOREIGN KEY ("conducteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Réservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trajetId" TEXT NOT NULL,
    "passagerId" TEXT NOT NULL,
    "nbPlaces" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "crééLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Réservation_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "Trajet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Réservation_passagerId_fkey" FOREIGN KEY ("passagerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteurId" TEXT NOT NULL,
    "cibleId" TEXT NOT NULL,
    CONSTRAINT "Avis_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avis_cibleId_fkey" FOREIGN KEY ("cibleId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "utilisateurId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "fournisseur" TEXT NOT NULL,
    "transactionRef" TEXT,
    "datePaiement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paiement_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Paiement_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Réservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Voiture_immatriculation_key" ON "Voiture"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_reservationId_key" ON "Paiement"("reservationId");
