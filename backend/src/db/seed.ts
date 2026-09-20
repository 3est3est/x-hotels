import type { Db } from './types'
import { countries, hotels, regions, roomTypes, type ImageRef } from './schema'

const img = (name: string): ImageRef[] => [
  { url: `https://res.cloudinary.com/demo/image/upload/${name}.jpg`, publicId: name },
]

const demoRoomTypes = [
  {
    name: 'Deluxe',
    description: 'A comfortable deluxe room with a king bed and city view.',
    capacity: 2,
    images: img('sample'),
  },
  {
    name: 'Suite',
    description: 'A spacious suite with a separate living area.',
    capacity: 4,
    images: img('sofa'),
  },
  {
    name: 'Family',
    description: 'A family room with two bedrooms and a lounge.',
    capacity: 6,
    images: img('breakfast'),
  },
]

/**
 * The group's operating structure: one branch Hotel per Region, named for the
 * Region's principal city. The migration writes the same Countries and Regions
 * into an existing database, so seeding an already-migrated database only fills
 * in what is missing.
 */
const business: Record<string, Record<string, string>> = {
  Thailand: {
    Northern: 'Chiang Mai',
    Northeastern: 'Khon Kaen',
    Central: 'Bangkok',
    Eastern: 'Pattaya',
    Western: 'Kanchanaburi',
    Southern: 'Phuket',
  },
  Israel: {
    Jerusalem: 'Jerusalem',
    Northern: 'Tiberias',
    Haifa: 'Haifa',
    Central: 'Netanya',
    'Tel Aviv': 'Tel Aviv',
    Southern: 'Eilat',
  },
}

const demoImages = ['sample', 'beach_house', 'hotel_binoc', 'building', 'waterfall', 'sky']

export async function seedDemoData(db: Db) {
  const countryNames = Object.keys(business)
  const insertedCountries = await db
    .insert(countries)
    .values(countryNames.map((name) => ({ name })))
    .onConflictDoNothing()
    .returning({ id: countries.id })

  const countryRows = await db.select({ id: countries.id, name: countries.name }).from(countries)
  const countryId = new Map(countryRows.map((country) => [country.name, country.id]))

  const regionValues = Object.entries(business).flatMap(([country, branches]) =>
    Object.keys(branches).map((name) => ({ countryId: countryId.get(country)!, name })),
  )
  const insertedRegions = await db
    .insert(regions)
    .values(regionValues)
    .onConflictDoNothing()
    .returning({ id: regions.id })

  const regionRows = await db
    .select({ id: regions.id, name: regions.name, countryId: regions.countryId })
    .from(regions)
  const regionOf = (country: string, region: string) =>
    regionRows.find((row) => row.countryId === countryId.get(country) && row.name === region)!.id

  const hotelValues = Object.entries(business).flatMap(([country, branches]) =>
    Object.entries(branches).map(([region, city], index) => ({
      regionId: regionOf(country, region),
      name: `X Hotel ${city}`,
      description: `The X Hotel branch in ${city}, ${region} Region, ${country}.`,
      images: img(demoImages[index % demoImages.length]),
    })),
  )
  const insertedHotels = await db
    .insert(hotels)
    .values(hotelValues)
    .onConflictDoNothing()
    .returning({ id: hotels.id })

  const hotelRows = await db.select({ id: hotels.id }).from(hotels)
  const hotelsWithRoomTypes = new Set(
    (await db.select({ hotelId: roomTypes.hotelId }).from(roomTypes)).map((row) => row.hotelId),
  )
  let insertedRoomTypes = 0
  for (const hotel of hotelRows) {
    if (hotelsWithRoomTypes.has(hotel.id)) continue
    await db.insert(roomTypes).values(
      demoRoomTypes.map((roomType) => ({
        hotelId: hotel.id,
        name: roomType.name,
        description: roomType.description,
        capacity: roomType.capacity,
        images: roomType.images,
      })),
    )
    insertedRoomTypes += demoRoomTypes.length
  }

  return {
    countries: insertedCountries.length,
    regions: insertedRegions.length,
    hotels: insertedHotels.length,
    roomTypes: insertedRoomTypes,
  }
}

const isMain = import.meta.main

if (isMain) {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required (put it in .env)')
  }
  const { createDb } = await import('./driver')
  const db = createDb(url)
  const counts = await seedDemoData(db)
  console.log(
    `seeded ${counts.countries} countries, ${counts.regions} regions, ${counts.hotels} hotels, ${counts.roomTypes} room types`,
  )
  await db.$client.end()
}

