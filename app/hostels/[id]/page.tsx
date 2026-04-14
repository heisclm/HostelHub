'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHostelDetails } from '@/hooks/useHostels';
import { submitReview } from '@/services/reviewService';
import { Hostel, Room, Review } from '@/types';
import { MapPin, Wifi, ShieldCheck, BedDouble, CheckCircle2, ArrowLeft, Star, ChevronLeft, ChevronRight, Home, FileText, Info, Map as MapIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function HostelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hostelId = params.id as string;
  const { user } = useAuth();

  const { hostel, rooms, reviews, isLoading, mutateReviews } = useHostelDetails(hostelId);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review form state
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [activeTab, setActiveTab] = useState('details');

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!hostel || !hostel.isVerified) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-4">Hostel Not Found</h2>
        <p className="text-slate-500 mb-8">The hostel you are looking for does not exist or is not yet verified.</p>
        <button 
          onClick={() => router.push('/hostels')}
          className="bg-slate-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
        >
          Back to Hostels
        </button>
      </div>
    );
  }

  const handleBookRoom = (roomId: string) => {
    if (!user) {
      toast.error('Please log in to book a room.');
      router.push('/login');
      return;
    }
    // Proceed to booking
    router.push(`/book/${hostelId}/${roomId}`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review.');
      router.push('/login');
      return;
    }
    if (!newReviewComment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitReview({
        hostelId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous Student',
        rating: newReviewRating,
        comment: newReviewComment.trim()
      });
      
      toast.success('Review submitted successfully!');
      setNewReviewComment('');
      setNewReviewRating(5);
      
      // Refresh reviews using SWR mutate
      mutateReviews();
      
    } catch (error) {
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-8 md:py-16">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-6 md:mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Hostels
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-2">
                {hostel.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-6">
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500">
                  {hostel.address}, {hostel.location}
                </p>
                <div className="flex items-center gap-2 border border-slate-900 px-2 py-0.5 md:px-3 md:py-1">
                  <Star className="w-3 h-3 md:w-4 md:h-4 fill-slate-900 text-slate-900" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{hostel.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 underline cursor-pointer">
                  {reviews.length} reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Image Gallery */}
        <div className="mb-12 md:mb-16 relative border border-slate-900 bg-slate-50 aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
          {hostel.images?.[selectedImage] ? (
            <Image 
              src={hostel.images[selectedImage]} 
              alt={hostel.name} 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">No Image</div>
          )}
          
          {hostel.images && hostel.images.length > 1 && (
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-slate-900 text-white px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold tracking-widest border border-slate-900">
              {selectedImage + 1} / {hostel.images.length}
            </div>
          )}
          
          {hostel.images && hostel.images.length > 1 && (
            <>
              <button 
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : hostel.images!.length - 1)}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-900 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={() => setSelectedImage(prev => prev < hostel.images!.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-900 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12 md:space-y-16">
            
            {/* Tabs */}
            <div className="flex gap-6 md:gap-8 border-b border-slate-900 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('details')}
                className={`pb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${activeTab === 'details' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
              >
                Property details
                {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('policies')}
                className={`pb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${activeTab === 'policies' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
              >
                Policies
                {activeTab === 'policies' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Description */}
                <div>
                  <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-4 md:mb-6">Description</h3>
                  <div className="prose prose-sm md:prose-base max-w-none text-slate-600 leading-relaxed">
                    <p>
                      Welcome to {hostel.name}, located conveniently in {hostel.location}. This verified property offers a safe and comfortable environment for students, just {hostel.distanceFromCampus}km from the Catholic University campus. Experience top-notch facilities and a supportive community.
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-4 md:mb-6">What this place offers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8">
                    {hostel.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-slate-900 border-b border-slate-200 pb-3 md:pb-4">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                        <span className="text-xs md:text-sm font-bold uppercase tracking-widest">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map */}
                {hostel.coordinates && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-4 md:mb-6">Location</h3>
                    <div className="border border-slate-900 p-1 h-[300px] md:h-[400px]">
                      <MapView position={hostel.coordinates} title={hostel.name} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-6">Hostel Policies</h3>
                {hostel.policies && hostel.policies.length > 0 ? (
                  <ul className="space-y-6 text-slate-600">
                    {hostel.policies.map((policy, index) => (
                      <li key={index} className="flex items-start gap-4 border-b border-slate-200 pb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-900 mt-1">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-sm">{policy}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="border border-slate-200 p-8 text-center bg-slate-50">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No specific policies listed by the manager.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar (Rooms / Booking) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <h3 className="text-2xl font-heading font-bold uppercase tracking-tighter">Available Rooms</h3>
              {rooms.length === 0 ? (
                <div className="border border-slate-900 p-8 text-center bg-slate-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No rooms available currently.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {rooms.map(room => (
                    <div key={room.id} className={`border border-slate-900 p-6 flex flex-col transition-opacity ${!room.isAvailable ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-bold uppercase tracking-wider text-xl">{room.type}</h4>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Room {room.roomNumber}</p>
                        </div>
                        {!room.isAvailable && (
                          <span className="border border-slate-900 text-[10px] px-2 py-1 font-bold uppercase tracking-widest">Full</span>
                        )}
                      </div>
                      
                      <div className="mb-8">
                        <span className="text-3xl font-heading font-bold tracking-tighter">GH₵{room.pricePerSemester}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500"> / sem</span>
                      </div>
                      
                      <div className="space-y-4 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Capacity</span>
                          <span className="text-slate-900">{room.capacity} Students</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span>Available Beds</span>
                          <span className="text-slate-900">{room.capacity - room.occupiedBeds}</span>
                        </div>
                      </div>

                      <button 
                        className="w-full py-4 text-xs font-bold uppercase tracking-widest border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed" 
                        disabled={!room.isAvailable || room.capacity - room.occupiedBeds <= 0}
                        onClick={() => handleBookRoom(room.id!)}
                      >
                        {room.isAvailable && room.capacity - room.occupiedBeds > 0 ? 'Book Now' : 'Not Available'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Manager Card */}
              {hostel.contactDetails && (
                <div className="border border-slate-900 p-6 bg-slate-50 mt-8">
                  <h4 className="font-bold uppercase tracking-wider text-lg mb-4">Contact Manager</h4>
                  <div className="space-y-4">
                    {hostel.contactDetails.phone && (
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone</span>
                        <a href={`tel:${hostel.contactDetails.phone}`} className="text-sm font-bold text-slate-900 hover:underline">
                          {hostel.contactDetails.phone}
                        </a>
                      </div>
                    )}
                    {hostel.contactDetails.whatsapp && (
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">WhatsApp</span>
                        <a href={`https://wa.me/${hostel.contactDetails.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 hover:underline">
                          {hostel.contactDetails.whatsapp}
                        </a>
                      </div>
                    )}
                    {hostel.contactDetails.email && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</span>
                        <a href={`mailto:${hostel.contactDetails.email}`} className="text-sm font-bold text-slate-900 hover:underline">
                          {hostel.contactDetails.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 pt-16 border-t border-slate-900">
          <h2 className="text-4xl font-heading font-bold uppercase tracking-tighter mb-12">Reviews</h2>
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Review Form */}
            <div className="lg:col-span-4 lg:order-2">
              <div className="border border-slate-900 p-8 sticky top-24">
                <h3 className="text-xl font-heading font-bold uppercase tracking-tighter mb-8">Write a Review</h3>
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= newReviewRating ? 'fill-slate-900 text-slate-900' : 'text-slate-200'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Comment</label>
                      <textarea 
                        placeholder="Share your experience..." 
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all min-h-[100px] resize-y placeholder:text-slate-300 rounded-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-slate-900 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 mt-8"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">You must be logged in to write a review.</p>
                    <button 
                      onClick={() => router.push('/login')} 
                      className="border border-slate-900 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-8 lg:order-1 space-y-8">
              {reviews.length === 0 ? (
                <div className="text-center py-16 border border-slate-900 bg-slate-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No reviews yet. Be the first to review this hostel!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-slate-200 pb-8 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <p className="font-bold uppercase tracking-wider text-lg">{review.userName}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                          {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Just now'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-slate-900 text-slate-900' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

