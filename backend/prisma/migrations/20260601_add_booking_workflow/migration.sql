-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "contact_person" TEXT,
ADD COLUMN     "contact_phone" TEXT;

-- CreateTable
CREATE TABLE "booking_comments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "from_status" "BookingStatus",
    "to_status" "BookingStatus" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hall_unavailability" (
    "id" TEXT NOT NULL,
    "hall_id" TEXT NOT NULL,
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hall_unavailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_comments_booking_id_idx" ON "booking_comments"("booking_id");

-- CreateIndex
CREATE INDEX "booking_comments_author_id_idx" ON "booking_comments"("author_id");

-- CreateIndex
CREATE INDEX "booking_status_history_booking_id_idx" ON "booking_status_history"("booking_id");

-- CreateIndex
CREATE INDEX "booking_status_history_changed_by_id_idx" ON "booking_status_history"("changed_by_id");

-- CreateIndex
CREATE INDEX "hall_unavailability_hall_id_idx" ON "hall_unavailability"("hall_id");

-- CreateIndex
CREATE INDEX "hall_unavailability_hall_id_date_from_date_to_idx" ON "hall_unavailability"("hall_id", "date_from", "date_to");

-- AddForeignKey
ALTER TABLE "booking_comments" ADD CONSTRAINT "booking_comments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_comments" ADD CONSTRAINT "booking_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_unavailability" ADD CONSTRAINT "hall_unavailability_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

