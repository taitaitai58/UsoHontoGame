/*
  Warnings:

  - Added the required column `name` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "playerLimit" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT '準備中',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Game" ("createdAt", "creatorId", "id", "playerLimit", "status", "updatedAt") SELECT "createdAt", "creatorId", "id", "playerLimit", "status", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE INDEX "Game_creatorId_idx" ON "Game"("creatorId");
CREATE INDEX "Game_status_idx" ON "Game"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
