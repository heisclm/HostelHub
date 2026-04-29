import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import HostelClient from './hostel-client';

type Props = {
  params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  if (!adminDb) {
    return {
      title: 'Hostel Details',
    };
  }

  try {
    const docSnap = await adminDb.collection('hostels').doc(id).get();
    
    if (!docSnap.exists) {
      return {
        title: 'Hostel Not Found',
      };
    }

    const hostel = docSnap.data();
    
    if (!hostel) {
      return {
        title: 'Hostel Not Found'
      };
    }

    const imageUrl = hostel.images?.[0] || '/og-image.jpg';

    return {
      title: `${hostel.name} | HostelHub`,
      description: `Book your stay at ${hostel.name} in ${hostel.location}. Distance from campus: ${hostel.distanceFromCampus}km. Rated ${hostel.rating}/5.`,
      openGraph: {
        title: `${hostel.name} | HostelHub`,
        description: `Experience a great stay at ${hostel.name}. Click to view available rooms and amenities.`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: hostel.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${hostel.name} | HostelHub`,
        description: `Experience a great stay at ${hostel.name} near CUG.`,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for hostel:', error);
    return {
      title: 'Hostel Details',
    };
  }
}

export default function Page() {
  return <HostelClient />;
}
