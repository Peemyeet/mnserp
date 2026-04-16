-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "mns_payment_ship_confirm" (
    "psc_id" BIGSERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL DEFAULT 1,
    "job_id" INTEGER NOT NULL DEFAULT 0,
    "bo_no" VARCHAR(200) NOT NULL DEFAULT '',
    "rfq_no" VARCHAR(50) NOT NULL DEFAULT '',
    "payment_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "transfer_ref" VARCHAR(200) NOT NULL DEFAULT '',
    "shipped" BOOLEAN NOT NULL DEFAULT false,
    "tracking_no" VARCHAR(120) NOT NULL DEFAULT '',
    "remark" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mns_payment_ship_confirm_pkey" PRIMARY KEY ("psc_id")
);

-- CreateTable
CREATE TABLE "mns_delivery_note" (
    "dn_id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL DEFAULT 1,
    "job_id" INTEGER NOT NULL DEFAULT 0,
    "psc_id" BIGINT,
    "dn_no" VARCHAR(40) NOT NULL,
    "dn_date" DATE NOT NULL,
    "bo_no" VARCHAR(200) NOT NULL DEFAULT '',
    "cus_id" INTEGER NOT NULL DEFAULT 0,
    "ship_to_name" VARCHAR(300) NOT NULL DEFAULT '',
    "ship_to_address" TEXT NOT NULL DEFAULT '',
    "tracking_no" VARCHAR(120) NOT NULL DEFAULT '',
    "status" SMALLINT NOT NULL DEFAULT 0,
    "modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mns_delivery_note_pkey" PRIMARY KEY ("dn_id")
);

-- CreateTable
CREATE TABLE "mns_delivery_note_line" (
    "dnl_id" SERIAL NOT NULL,
    "dn_id" INTEGER NOT NULL,
    "line_no" INTEGER NOT NULL DEFAULT 1,
    "part_id" INTEGER NOT NULL DEFAULT 0,
    "description" VARCHAR(500) NOT NULL DEFAULT '',
    "qty" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "unit" VARCHAR(30) NOT NULL DEFAULT '',
    "unit_price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remark" VARCHAR(500) NOT NULL DEFAULT '',

    CONSTRAINT "mns_delivery_note_line_pkey" PRIMARY KEY ("dnl_id")
);

-- CreateIndex
CREATE INDEX "idx_psc_job" ON "mns_payment_ship_confirm"("job_id");

-- CreateIndex
CREATE INDEX "idx_psc_bo" ON "mns_payment_ship_confirm"("bo_no");

-- CreateIndex
CREATE INDEX "idx_psc_created" ON "mns_payment_ship_confirm"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mns_delivery_note_dn_no_key" ON "mns_delivery_note"("dn_no");

-- CreateIndex
CREATE INDEX "idx_dn_job" ON "mns_delivery_note"("job_id");

-- CreateIndex
CREATE INDEX "idx_dn_psc" ON "mns_delivery_note"("psc_id");

-- CreateIndex
CREATE INDEX "idx_dn_date" ON "mns_delivery_note"("dn_date");

-- CreateIndex
CREATE INDEX "idx_dnl_dn" ON "mns_delivery_note_line"("dn_id");

-- CreateIndex
CREATE INDEX "idx_dnl_part" ON "mns_delivery_note_line"("part_id");

-- AddForeignKey
ALTER TABLE "mns_delivery_note" ADD CONSTRAINT "mns_delivery_note_psc_id_fkey" FOREIGN KEY ("psc_id") REFERENCES "mns_payment_ship_confirm"("psc_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mns_delivery_note_line" ADD CONSTRAINT "mns_delivery_note_line_dn_id_fkey" FOREIGN KEY ("dn_id") REFERENCES "mns_delivery_note"("dn_id") ON DELETE CASCADE ON UPDATE CASCADE;
