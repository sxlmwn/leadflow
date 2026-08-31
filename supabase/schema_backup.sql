


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "vertical" "text" NOT NULL,
    "sub_vertical" "text",
    "theme_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "form_schema" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "legal_copy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."buyer_brands" (
    "buyer_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL
);


ALTER TABLE "public"."buyer_brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."buyer_deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "delivered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "request_payload" "jsonb",
    "response_payload" "jsonb",
    "http_status" integer,
    "accepted" boolean,
    "price_paid" numeric,
    "converted" boolean DEFAULT false,
    "converted_at" timestamp with time zone,
    "conversion_value" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."buyer_deliveries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."buyers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "api_endpoint" "text",
    "api_key_encrypted" "text",
    "price_per_lead" numeric,
    "pricing_model" "text" DEFAULT 'flat'::"text",
    "min_accept_score" numeric,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "min_score" numeric DEFAULT 0,
    CONSTRAINT "buyers_pricing_model_check" CHECK (("pricing_model" = ANY (ARRAY['flat'::"text", 'tiered'::"text", 'auction'::"text"])))
);


ALTER TABLE "public"."buyers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "landing_url" "text" NOT NULL,
    "subid_params" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "referrer" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "converted_lead_id" "uuid"
);


ALTER TABLE "public"."clicks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "click_id" "uuid",
    "full_name" "text",
    "email" "text",
    "phone" "text",
    "zip_code" "text",
    "form_answers" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "subid_params" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "funnel_variant" "text",
    "funnel_step_reached" integer,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "is_duplicate" boolean DEFAULT false NOT NULL,
    "duplicate_of_lead_id" "uuid",
    "trustedform_cert_url" "text",
    "dnc_scrub_passed" boolean,
    "dnc_scrub_checked_at" timestamp with time zone,
    "score" numeric,
    "score_breakdown" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dnc_flagged" boolean DEFAULT false,
    "sold" boolean DEFAULT false NOT NULL,
    "sold_to_buyer_id" "uuid",
    "sold_at" timestamp with time zone,
    CONSTRAINT "leads_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'verifying'::"text", 'verified'::"text", 'rejected'::"text", 'sold'::"text", 'duplicate'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "check_type" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "raw_response" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "verification_results_check_type_check" CHECK (("check_type" = ANY (ARRAY['trustedform'::"text", 'dnc_scrub'::"text", 'scoring'::"text"]))),
    CONSTRAINT "verification_results_status_check" CHECK (("status" = ANY (ARRAY['passed'::"text", 'failed'::"text", 'error'::"text", 'skipped'::"text"])))
);


ALTER TABLE "public"."verification_results" OWNER TO "postgres";


ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."buyer_brands"
    ADD CONSTRAINT "buyer_brands_pkey" PRIMARY KEY ("buyer_id", "brand_id");



ALTER TABLE ONLY "public"."buyer_deliveries"
    ADD CONSTRAINT "buyer_deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."buyers"
    ADD CONSTRAINT "buyers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clicks"
    ADD CONSTRAINT "clicks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification_results"
    ADD CONSTRAINT "verification_results_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_clicks_brand" ON "public"."clicks" USING "btree" ("brand_id");



CREATE INDEX "idx_clicks_created" ON "public"."clicks" USING "btree" ("created_at");



CREATE INDEX "idx_clicks_subid_params" ON "public"."clicks" USING "gin" ("subid_params");



CREATE INDEX "idx_deliveries_buyer" ON "public"."buyer_deliveries" USING "btree" ("buyer_id");



CREATE INDEX "idx_deliveries_converted" ON "public"."buyer_deliveries" USING "btree" ("converted");



CREATE INDEX "idx_deliveries_lead" ON "public"."buyer_deliveries" USING "btree" ("lead_id");



CREATE INDEX "idx_leads_brand" ON "public"."leads" USING "btree" ("brand_id");



CREATE INDEX "idx_leads_created" ON "public"."leads" USING "btree" ("created_at");



CREATE INDEX "idx_leads_email" ON "public"."leads" USING "btree" ("email");



CREATE INDEX "idx_leads_phone" ON "public"."leads" USING "btree" ("phone");



CREATE INDEX "idx_leads_sold" ON "public"."leads" USING "btree" ("sold");



CREATE INDEX "idx_leads_sold_to_buyer_id" ON "public"."leads" USING "btree" ("sold_to_buyer_id");



CREATE INDEX "idx_leads_status" ON "public"."leads" USING "btree" ("status");



CREATE INDEX "idx_leads_subid_params" ON "public"."leads" USING "gin" ("subid_params");



CREATE INDEX "idx_verification_results_check_type" ON "public"."verification_results" USING "btree" ("check_type");



CREATE INDEX "idx_verification_results_lead_id" ON "public"."verification_results" USING "btree" ("lead_id");



ALTER TABLE ONLY "public"."buyer_brands"
    ADD CONSTRAINT "buyer_brands_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."buyer_brands"
    ADD CONSTRAINT "buyer_brands_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id");



ALTER TABLE ONLY "public"."buyer_deliveries"
    ADD CONSTRAINT "buyer_deliveries_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id");



ALTER TABLE ONLY "public"."buyer_deliveries"
    ADD CONSTRAINT "buyer_deliveries_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id");



ALTER TABLE ONLY "public"."clicks"
    ADD CONSTRAINT "clicks_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."clicks"
    ADD CONSTRAINT "fk_clicks_converted_lead" FOREIGN KEY ("converted_lead_id") REFERENCES "public"."leads"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_click_id_fkey" FOREIGN KEY ("click_id") REFERENCES "public"."clicks"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_duplicate_of_lead_id_fkey" FOREIGN KEY ("duplicate_of_lead_id") REFERENCES "public"."leads"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_sold_to_buyer_id_fkey" FOREIGN KEY ("sold_to_buyer_id") REFERENCES "public"."buyers"("id");



ALTER TABLE ONLY "public"."verification_results"
    ADD CONSTRAINT "verification_results_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."buyer_brands" TO "anon";
GRANT ALL ON TABLE "public"."buyer_brands" TO "authenticated";
GRANT ALL ON TABLE "public"."buyer_brands" TO "service_role";



GRANT ALL ON TABLE "public"."buyer_deliveries" TO "anon";
GRANT ALL ON TABLE "public"."buyer_deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."buyer_deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."buyers" TO "anon";
GRANT ALL ON TABLE "public"."buyers" TO "authenticated";
GRANT ALL ON TABLE "public"."buyers" TO "service_role";



GRANT ALL ON TABLE "public"."clicks" TO "anon";
GRANT ALL ON TABLE "public"."clicks" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."verification_results" TO "anon";
GRANT ALL ON TABLE "public"."verification_results" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_results" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































