import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

export interface ImageRef {
  url: string
  publicId?: string
}

export type Role = 'guest' | 'management'
export type IdentityDocumentType = 'id_card' | 'passport'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').$type<Role>().notNull().default('guest'),
  idDocumentType: text('id_document_type').$type<IdentityDocumentType>(),
  idDocumentNumber: text('id_document_number'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  issuer: text('issuer').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const regions = pgTable(
  'regions',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('regions_country_name_unique').on(table.countryId, table.name)],
)

export const hotels = pgTable('hotels', {
  id: serial('id').primaryKey(),
  regionId: integer('region_id')
    .notNull()
    .references(() => regions.id),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  images: jsonb('images').$type<ImageRef[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const roomTypes = pgTable('room_types', {
  id: serial('id').primaryKey(),
  hotelId: integer('hotel_id')
    .notNull()
    .references(() => hotels.id),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  capacity: integer('capacity').notNull(),
  images: jsonb('images').$type<ImageRef[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN'

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  hotelId: integer('hotel_id')
    .notNull()
    .references(() => hotels.id),
  roomTypeId: integer('room_type_id')
    .notNull()
    .references(() => roomTypes.id),
  numGuests: integer('num_guests').notNull(),
  checkInDate: date('check_in_date', { mode: 'string' }).notNull(),
  nights: integer('nights').notNull(),
  status: text('status').$type<BookingStatus>().notNull().default('CONFIRMED'),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    hotelId: integer('hotel_id')
      .notNull()
      .references(() => hotels.id),
    rating: integer('rating').notNull(),
    message: text('message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('reviews_user_hotel_unique').on(table.userId, table.hotelId)],
)
