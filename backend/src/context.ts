import type { Db } from './db/types'
import type { Auth } from './modules/auth'
import type { CloudinaryService } from './services/cloudinary'

/** The per-request dependencies every API module receives as one value (Spec 0002). */
export interface AppContext {
  db: Db
  auth: Auth
  cloudinary: CloudinaryService
}
