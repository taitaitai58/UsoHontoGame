-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "creatorId" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "currentPlayers" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT '準備中',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Game" ("createdAt", "creatorId", "currentPlayers", "id", "maxPlayers", "name", "status", "updatedAt") SELECT "createdAt", "creatorId", "currentPlayers", "id", "maxPlayers", "name", "status", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE INDEX "Game_creatorId_idx" ON "Game"("creatorId");
CREATE INDEX "Game_status_idx" ON "Game"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
