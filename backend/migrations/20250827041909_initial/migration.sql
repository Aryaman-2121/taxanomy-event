-- CreateEnum
CREATE TYPE "public"."taxonomy_status" AS ENUM ('draft', 'active', 'deprecated', 'archived');

-- CreateEnum
CREATE TYPE "public"."classification_status" AS ENUM ('pending', 'confirmed', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "public"."assignment_method" AS ENUM ('system', 'user', 'ai', 'import');

-- CreateEnum
CREATE TYPE "public"."namespace_type" AS ENUM ('system', 'custom', 'predefined');

-- CreateTable
CREATE TABLE "public"."taxonomies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "namespace" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."taxonomy_status" NOT NULL DEFAULT 'draft',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_hierarchical" BOOLEAN NOT NULL DEFAULT true,
    "max_depth" INTEGER NOT NULL DEFAULT 6,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "taxonomies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "taxonomy_id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_leaf" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "confidence_score" REAL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "taxonomy_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "confidence_score" REAL NOT NULL DEFAULT 1.0,
    "assigned_by" "public"."assignment_method" NOT NULL DEFAULT 'user',
    "status" "public"."classification_status" NOT NULL DEFAULT 'confirmed',
    "expires_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."namespaces" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "type" "public"."namespace_type" NOT NULL DEFAULT 'custom',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "quota_limit" INTEGER,
    "quota_used" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "namespaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entity_tags" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "confidence_score" REAL NOT NULL DEFAULT 1.0,
    "assigned_by" "public"."assignment_method" NOT NULL DEFAULT 'user',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "entity_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "taxonomies_tenant_id_idx" ON "public"."taxonomies"("tenant_id");

-- CreateIndex
CREATE INDEX "taxonomies_tenant_id_namespace_idx" ON "public"."taxonomies"("tenant_id", "namespace");

-- CreateIndex
CREATE INDEX "taxonomies_tenant_id_status_idx" ON "public"."taxonomies"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "taxonomies_namespace_status_idx" ON "public"."taxonomies"("namespace", "status");

-- CreateIndex
CREATE INDEX "taxonomies_slug_idx" ON "public"."taxonomies"("slug");

-- CreateIndex
CREATE INDEX "taxonomies_created_at_idx" ON "public"."taxonomies"("created_at");

-- CreateIndex
CREATE INDEX "taxonomies_updated_at_idx" ON "public"."taxonomies"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomies_tenant_id_namespace_slug_key" ON "public"."taxonomies"("tenant_id", "namespace", "slug");

-- CreateIndex
CREATE INDEX "categories_tenant_id_idx" ON "public"."categories"("tenant_id");

-- CreateIndex
CREATE INDEX "categories_tenant_id_taxonomy_id_idx" ON "public"."categories"("tenant_id", "taxonomy_id");

-- CreateIndex
CREATE INDEX "categories_tenant_id_taxonomy_id_parent_id_idx" ON "public"."categories"("tenant_id", "taxonomy_id", "parent_id");

-- CreateIndex
CREATE INDEX "categories_taxonomy_id_level_idx" ON "public"."categories"("taxonomy_id", "level");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "public"."categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_path_idx" ON "public"."categories"("path");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "public"."categories"("is_active");

-- CreateIndex
CREATE INDEX "categories_usage_count_idx" ON "public"."categories"("usage_count");

-- CreateIndex
CREATE INDEX "categories_ai_generated_confidence_score_idx" ON "public"."categories"("ai_generated", "confidence_score");

-- CreateIndex
CREATE INDEX "categories_created_at_idx" ON "public"."categories"("created_at");

-- CreateIndex
CREATE INDEX "categories_updated_at_idx" ON "public"."categories"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenant_id_taxonomy_id_slug_key" ON "public"."categories"("tenant_id", "taxonomy_id", "slug");

-- CreateIndex
CREATE INDEX "classifications_tenant_id_idx" ON "public"."classifications"("tenant_id");

-- CreateIndex
CREATE INDEX "classifications_tenant_id_entity_type_idx" ON "public"."classifications"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "classifications_tenant_id_entity_type_entity_id_idx" ON "public"."classifications"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "classifications_entity_type_entity_id_idx" ON "public"."classifications"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "classifications_category_id_idx" ON "public"."classifications"("category_id");

-- CreateIndex
CREATE INDEX "classifications_taxonomy_id_idx" ON "public"."classifications"("taxonomy_id");

-- CreateIndex
CREATE INDEX "classifications_status_idx" ON "public"."classifications"("status");

-- CreateIndex
CREATE INDEX "classifications_assigned_by_idx" ON "public"."classifications"("assigned_by");

-- CreateIndex
CREATE INDEX "classifications_confidence_score_idx" ON "public"."classifications"("confidence_score");

-- CreateIndex
CREATE INDEX "classifications_expires_at_idx" ON "public"."classifications"("expires_at");

-- CreateIndex
CREATE INDEX "classifications_created_at_idx" ON "public"."classifications"("created_at");

-- CreateIndex
CREATE INDEX "classifications_updated_at_idx" ON "public"."classifications"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "classifications_tenant_id_entity_type_entity_id_category_id_key" ON "public"."classifications"("tenant_id", "entity_type", "entity_id", "category_id");

-- CreateIndex
CREATE INDEX "namespaces_tenant_id_idx" ON "public"."namespaces"("tenant_id");

-- CreateIndex
CREATE INDEX "namespaces_tenant_id_type_idx" ON "public"."namespaces"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "namespaces_tenant_id_is_active_idx" ON "public"."namespaces"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "namespaces_type_idx" ON "public"."namespaces"("type");

-- CreateIndex
CREATE INDEX "namespaces_is_system_idx" ON "public"."namespaces"("is_system");

-- CreateIndex
CREATE INDEX "namespaces_created_at_idx" ON "public"."namespaces"("created_at");

-- CreateIndex
CREATE INDEX "namespaces_updated_at_idx" ON "public"."namespaces"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "namespaces_tenant_id_slug_key" ON "public"."namespaces"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "tags_tenant_id_idx" ON "public"."tags"("tenant_id");

-- CreateIndex
CREATE INDEX "tags_tenant_id_category_id_idx" ON "public"."tags"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "tags_category_id_idx" ON "public"."tags"("category_id");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "public"."tags"("name");

-- CreateIndex
CREATE INDEX "tags_is_active_idx" ON "public"."tags"("is_active");

-- CreateIndex
CREATE INDEX "tags_usage_count_idx" ON "public"."tags"("usage_count");

-- CreateIndex
CREATE INDEX "tags_created_at_idx" ON "public"."tags"("created_at");

-- CreateIndex
CREATE INDEX "tags_updated_at_idx" ON "public"."tags"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tenant_id_slug_key" ON "public"."tags"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "entity_tags_tenant_id_idx" ON "public"."entity_tags"("tenant_id");

-- CreateIndex
CREATE INDEX "entity_tags_tenant_id_entity_type_idx" ON "public"."entity_tags"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "entity_tags_tenant_id_entity_type_entity_id_idx" ON "public"."entity_tags"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "entity_tags_entity_type_entity_id_idx" ON "public"."entity_tags"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "entity_tags_tag_id_idx" ON "public"."entity_tags"("tag_id");

-- CreateIndex
CREATE INDEX "entity_tags_assigned_by_idx" ON "public"."entity_tags"("assigned_by");

-- CreateIndex
CREATE INDEX "entity_tags_confidence_score_idx" ON "public"."entity_tags"("confidence_score");

-- CreateIndex
CREATE INDEX "entity_tags_created_at_idx" ON "public"."entity_tags"("created_at");

-- CreateIndex
CREATE INDEX "entity_tags_updated_at_idx" ON "public"."entity_tags"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tenant_id_entity_type_entity_id_tag_id_key" ON "public"."entity_tags"("tenant_id", "entity_type", "entity_id", "tag_id");

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_taxonomy_id_fkey" FOREIGN KEY ("taxonomy_id") REFERENCES "public"."taxonomies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classifications" ADD CONSTRAINT "classifications_taxonomy_id_fkey" FOREIGN KEY ("taxonomy_id") REFERENCES "public"."taxonomies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classifications" ADD CONSTRAINT "classifications_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entity_tags" ADD CONSTRAINT "entity_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
