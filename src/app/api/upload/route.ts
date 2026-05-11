import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Allowed file types and max size (50MB for videos)
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
]
const MAX_SIZE = 50 * 1024 * 1024 

export async function POST(request: Request) {
  try {
    // 1. Auth Check: Only logged-in users can upload
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 2. File Type Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // 3. File Size Validation
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    
    // Generate unique filename with original extension or fallback to jpg
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${uuidv4()}.${extension}`
    
    console.log(`Uploading ${filename} (${file.size} bytes) to ethoss-media bucket...`);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('ethoss-media')
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('ethoss-media')
      .getPublicUrl(filename)
    
    return NextResponse.json({ 
      url: publicUrl,
      success: true 
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
