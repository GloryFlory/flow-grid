-- CreateTable: LandingPage (one per festival, Pro feature)
CREATE TABLE "landing_pages" (
    "id" TEXT NOT NULL,
    "festivalId" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'minimal',
    "headline" TEXT NOT NULL,
    "subheadline" TEXT,
    "description" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Sign me up',
    "webinarDate" TIMESTAMP(3),
    "webinarDuration" INTEGER,
    "speakerName" TEXT,
    "speakerTitle" TEXT,
    "speakerBio" TEXT,
    "speakerPhoto" TEXT,
    "privacyPolicyUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WebinarSubscriber (GDPR-compliant email signups)
CREATE TABLE "webinar_subscribers" (
    "id" TEXT NOT NULL,
    "festivalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "consentText" TEXT NOT NULL,
    "unsubscribeToken" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webinar_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_festivalId_key" ON "landing_pages"("festivalId");

-- CreateIndex
CREATE UNIQUE INDEX "webinar_subscribers_unsubscribeToken_key" ON "webinar_subscribers"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "webinar_subscribers_festivalId_email_key" ON "webinar_subscribers"("festivalId", "email");

-- CreateIndex
CREATE INDEX "webinar_subscribers_festivalId_idx" ON "webinar_subscribers"("festivalId");

-- CreateIndex
CREATE INDEX "webinar_subscribers_unsubscribeToken_idx" ON "webinar_subscribers"("unsubscribeToken");

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_festivalId_fkey" FOREIGN KEY ("festivalId") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinar_subscribers" ADD CONSTRAINT "webinar_subscribers_festivalId_fkey" FOREIGN KEY ("festivalId") REFERENCES "festivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
