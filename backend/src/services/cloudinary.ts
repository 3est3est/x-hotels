export interface SignedUploadParams {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
}

export interface IdentityAsset {
  publicId: string
  url: string
}

export interface CloudinaryService {
  signUpload(params: { folder: string }): Promise<SignedUploadParams>
  findIdentityAsset(publicId: string): Promise<IdentityAsset | null>
}

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function createCloudinary(config: {
  cloudName: string
  apiKey: string
  apiSecret: string
}): CloudinaryService {
  const { cloudName, apiKey, apiSecret } = config

  const signParams = async (params: Record<string, string>) => {
    const toSign =
      Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&') + apiSecret
    return sha1Hex(toSign)
  }

  return {
    async signUpload({ folder }) {
      const timestamp = Math.floor(Date.now() / 1000)
      const signature = await signParams({ folder, timestamp: String(timestamp) })
      return { cloudName, apiKey, folder, timestamp, signature }
    },
    async findIdentityAsset(publicId) {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodeURIComponent(publicId)}`,
        {
          headers: {
            Authorization: 'Basic ' + btoa(`${apiKey}:${apiSecret}`),
          },
        },
      )
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`Cloudinary API error: ${res.status}`)
      const data = (await res.json()) as { public_id: string; secure_url: string }
      return { publicId: data.public_id, url: data.secure_url }
    },
  }
}
