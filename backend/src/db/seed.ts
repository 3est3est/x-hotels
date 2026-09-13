import type { Db } from './types'
import { hotels, regions, roomTypes, type ImageRef } from './schema'

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

export async function seedDemoData(db: Db) {
  const regionRows = await db
    .insert(regions)
    .values([{ name: 'Thailand' }, { name: 'Israel' }])
    .returning()
  const regionId = new Map(regionRows.map((r) => [r.name, r.id]))

  const hotelRows = await db
    .insert(hotels)
    .values([
      {
        regionId: regionId.get('Thailand')!,
        name: 'X Hotel Bangkok',
        description: 'The flagship X Hotel in the heart of Bangkok.',
        images: img('sample'),
      },
      {
        regionId: regionId.get('Thailand')!,
        name: 'X Hotel Phuket',
        description: 'A beachfront X Hotel on the Andaman coast.',
        images: img('beach_house'),
      },
      {
        regionId: regionId.get('Israel')!,
        name: 'X Hotel Tel Aviv',
        description: 'A modern X Hotel by the Mediterranean.',
        images: img('hotel_binoc'),
      },
      {
        regionId: regionId.get('Israel')!,
        name: 'X Hotel Jerusalem',
        description: 'A historic X Hotel steps from the Old City.',
        images: img('building'),
      },
    ])
    .returning()

  for (const hotel of hotelRows) {
    await db.insert(roomTypes).values(
      demoRoomTypes.map((roomType) => ({
        hotelId: hotel.id,
        name: roomType.name,
        description: roomType.description,
        capacity: roomType.capacity,
        images: roomType.images,
      })),
    )
  }

  return { regions: regionRows.length, hotels: hotelRows.length, roomTypes: hotelRows.length * demoRoomTypes.length }
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
  console.log(`seeded ${counts.regions} regions, ${counts.hotels} hotels, ${counts.roomTypes} room types`)
  await db.$client.end()
}
