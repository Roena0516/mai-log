/*
  Warnings:

  - A unique constraint covering the columns `[songId,isDx,difficultyType]` on the table `Chart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,artist]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chart_songId_isDx_difficultyType_key" ON "Chart"("songId", "isDx", "difficultyType");

-- CreateIndex
CREATE UNIQUE INDEX "Song_title_artist_key" ON "Song"("title", "artist");
