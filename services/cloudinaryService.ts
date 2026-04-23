export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      // Fallback for development if Cloudinary is not configured
      console.warn('Cloudinary is not configured. Returning a placeholder URL.');
      return `https://picsum.photos/seed/${file.name}/800/600`;
    }

    // Request both signature AND secure timestamp from our backend
    // relying on the client device clock causes "Stale request" errors 
    // if the user's laptop time is out of sync.
    // Adding a unique cacheBuster prevents ANY browser/Next.js deep caching.
    const cacheBuster = new Date().getTime();
    const signatureResponse = await fetch(`/api/upload?t=${cacheBuster}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder }),
      cache: 'no-store'
    });

    if (!signatureResponse.ok) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, timestamp } = await signatureResponse.json();

    // Upload directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
    }

    const data = await uploadResponse.json();
    return data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};
