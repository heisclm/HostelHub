import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folder } = body;

    if (!process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary API Secret is not configured' },
        { status: 500 }
      );
    }

    // Generate the timestamp on the secure backend server. 
    // This prevents "Stale request" errors if the client laptop's clock is inaccurate.
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    console.log(`[Cloudinary API] Generating signature for folder: ${folder} at timestamp: ${timestamp}`);

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({ signature, timestamp });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
