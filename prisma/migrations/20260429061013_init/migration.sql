-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "title" TEXT,
    "playCountTotal" INTEGER NOT NULL DEFAULT 0,
    "playCountVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "achievement" INTEGER NOT NULL,
    "difficultyType" TEXT NOT NULL,
    "isDx" BOOLEAN NOT NULL,
    "clearMark" TEXT NOT NULL DEFAULT 'clear',
    "sync" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "achievement" INTEGER NOT NULL,
    "difficultyType" TEXT NOT NULL,
    "isDx" BOOLEAN NOT NULL,
    "clearMark" TEXT NOT NULL DEFAULT 'clear',
    "sync" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "catcode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "isDx" BOOLEAN NOT NULL,
    "difficultyType" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "levelValue" DOUBLE PRECISION NOT NULL,
    "isNewVersion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
