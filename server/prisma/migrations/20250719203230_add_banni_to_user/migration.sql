-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "numero" TEXT,
    "dateNaissance" DATETIME,
    "type" TEXT NOT NULL DEFAULT 'UTILISATEUR',
    "banni" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifLe" DATETIME NOT NULL
);
INSERT INTO "new_User" ("creeLe", "dateNaissance", "email", "id", "modifLe", "motDePasse", "nom", "numero", "type") SELECT "creeLe", "dateNaissance", "email", "id", "modifLe", "motDePasse", "nom", "numero", "type" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
