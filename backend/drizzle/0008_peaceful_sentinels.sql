CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "countries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "countries" ("name") VALUES ('Thailand'), ('Israel');--> statement-breakpoint
ALTER TABLE "regions" DROP CONSTRAINT "regions_name_unique";--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "country_id" integer;--> statement-breakpoint
UPDATE "regions"
SET "country_id" = (SELECT "id" FROM "countries" WHERE "countries"."name" = "regions"."name")
WHERE "country_id" IS NULL AND "name" IN (SELECT "name" FROM "countries");--> statement-breakpoint
INSERT INTO "regions" ("country_id", "name")
SELECT c."id", r."name"
FROM (
	VALUES
		('Thailand', 'Northern'),
		('Thailand', 'Northeastern'),
		('Thailand', 'Central'),
		('Thailand', 'Eastern'),
		('Thailand', 'Western'),
		('Thailand', 'Southern'),
		('Israel', 'Jerusalem'),
		('Israel', 'Northern'),
		('Israel', 'Haifa'),
		('Israel', 'Central'),
		('Israel', 'Tel Aviv'),
		('Israel', 'Southern')
) AS r(country, name)
JOIN "countries" c ON c."name" = r.country
ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "hotels"
SET "region_id" = nr."id"
FROM (
	VALUES
		('X Hotel Bangkok', 'Thailand', 'Central'),
		('X Hotel Phuket', 'Thailand', 'Southern'),
		('X Hotel Tel Aviv', 'Israel', 'Tel Aviv'),
		('X Hotel Jerusalem', 'Israel', 'Jerusalem')
) AS m(hotel, country, region)
JOIN "countries" c ON c."name" = m.country
JOIN "regions" nr ON nr."country_id" = c."id" AND nr."name" = m.region
WHERE "hotels"."name" = m.hotel;--> statement-breakpoint
DELETE FROM "regions"
WHERE "name" IN (SELECT "name" FROM "countries")
	AND NOT EXISTS (SELECT 1 FROM "hotels" WHERE "hotels"."region_id" = "regions"."id");--> statement-breakpoint
ALTER TABLE "regions" ALTER COLUMN "country_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_country_name_unique" UNIQUE("country_id","name");
