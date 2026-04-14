'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createHostel } from '@/services/hostelService';
import { useManagerVerification } from '@/hooks/useDashboard';
import { toast } from 'sonner';
import { z } from 'zod';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const hostelSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  distanceFromCampus: z.number().min(0, 'Distance must be a positive number'),
  amenities: z.string().min(3, 'Please provide at least one amenity'),
  contactPhone: z.string().min(10, 'Please provide a valid phone number'),
  contactEmail: z.string().email('Please provide a valid email address'),
  contactWhatsapp: z.string().optional(),
});

export default function AddHostelPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { verificationStatus, isLoading: checkingVerification } = useManagerVerification(user?.uid);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    distanceFromCampus: '',
    amenities: '',
    contactPhone: '',
    contactEmail: '',
    contactWhatsapp: '',
  });
  const [policies, setPolicies] = useState<string[]>(['']);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (userData?.role !== 'manager') {
      router.push('/');
      return;
    }
    // Pre-fill email from user data
    if (user.email) {
      setFormData(prev => ({ ...prev, contactEmail: user.email || '' }));
    }
  }, [user, userData, router]);

  useEffect(() => {
    if (!checkingVerification && verificationStatus?.status !== 'verified') {
      toast.error('You must be verified to add a hostel.');
      router.push('/manager/dashboard');
    }
  }, [checkingVerification, verificationStatus, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        toast.error('You can only upload up to 5 images.');
        return;
      }
      setImages(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setErrors({});
    
    try {
      const validatedData = hostelSchema.parse({
        ...formData,
        distanceFromCampus: Number(formData.distanceFromCampus)
      });

      if (images.length === 0) {
        toast.error('Please upload at least one image.');
        return;
      }

      setIsLoading(true);
      const amenitiesList = validatedData.amenities.split(',').map(a => a.trim()).filter(a => a);
      const filteredPolicies = policies.map(p => p.trim()).filter(p => p);
      
      const hostelId = await createHostel(user.uid, {
        name: validatedData.name,
        location: validatedData.location,
        address: validatedData.address,
        distanceFromCampus: validatedData.distanceFromCampus,
        coordinates: coordinates || undefined,
        amenities: amenitiesList,
        policies: filteredPolicies,
        contactDetails: {
          phone: validatedData.contactPhone,
          email: validatedData.contactEmail,
          whatsapp: validatedData.contactWhatsapp || undefined,
        }
      }, images);

      toast.success('Hostel added successfully! Now add some rooms.');
      router.push(`/manager/hostels/${hostelId}`);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the errors in the form.');
      } else {
        toast.error(error.message || 'Failed to add hostel');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingVerification) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (verificationStatus?.status !== 'verified') return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
              Add <br/> Hostel.
            </h1>
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
              List your property on our platform.
            </p>
          </div>
          <button 
            onClick={() => router.back()} 
            className="w-full md:w-auto inline-flex items-center justify-center border border-slate-900 px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="border border-slate-900 p-6 md:p-12 bg-white">
          <h2 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-8 md:mb-12">Hostel Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hostel Name</label>
                <input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Sunrise Hostel" 
                  className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                  required 
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">General Location</label>
                <input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Fiaso, Berlin Top" 
                  className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                  required 
                />
                {errors.location && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Specific Address</label>
              <input 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="e.g. Plot 45, Fiaso Main Road" 
                className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                required 
              />
              {errors.address && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="distance" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Distance from Campus (km)</label>
              <input 
                id="distance" 
                type="number" 
                step="0.1"
                min="0"
                value={formData.distanceFromCampus}
                onChange={(e) => setFormData({...formData, distanceFromCampus: e.target.value})}
                placeholder="e.g. 1.5" 
                className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                required 
              />
              {errors.distanceFromCampus && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.distanceFromCampus}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="amenities" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Amenities (comma separated)</label>
              <textarea 
                id="amenities" 
                value={formData.amenities}
                onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                placeholder="e.g. Free Wi-Fi, Backup Generator, Water Reservoir, Security" 
                className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all min-h-[100px] resize-y placeholder:text-slate-300 rounded-none"
                required 
              />
              {errors.amenities && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.amenities}</p>}
            </div>

            <div className="pt-8 border-t border-slate-200">
              <h3 className="text-lg font-heading font-bold uppercase tracking-tighter mb-6">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                  <input 
                    id="contactPhone" 
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="e.g. 0241234567" 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                    required 
                  />
                  {errors.contactPhone && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.contactPhone}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                  <input 
                    id="contactEmail" 
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="e.g. manager@hostel.com" 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                    required 
                  />
                  {errors.contactEmail && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.contactEmail}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="contactWhatsapp" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">WhatsApp Number (Optional)</label>
                  <input 
                    id="contactWhatsapp" 
                    value={formData.contactWhatsapp}
                    onChange={(e) => setFormData({...formData, contactWhatsapp: e.target.value})}
                    placeholder="e.g. 0241234567" 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-heading font-bold uppercase tracking-tighter">Hostel Policies</h3>
                <button
                  type="button"
                  onClick={() => setPolicies([...policies, ''])}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border border-slate-900 px-3 py-1 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  + Add Policy
                </button>
              </div>
              <div className="space-y-4">
                {policies.map((policy, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-3">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <input 
                        value={policy}
                        onChange={(e) => {
                          const newPolicies = [...policies];
                          newPolicies[index] = e.target.value;
                          setPolicies(newPolicies);
                        }}
                        placeholder="e.g. No smoking inside the rooms." 
                        className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                      />
                    </div>
                    {policies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPolicies = [...policies];
                          newPolicies.splice(index, 1);
                          setPolicies(newPolicies);
                        }}
                        className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-200">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GPS Location (Optional)</label>
                <p className="text-[10px] text-slate-400 mt-1">Click on the map to set the exact location of your hostel.</p>
              </div>
              <div className="border border-slate-900 p-1 bg-slate-50">
                <MapPicker position={coordinates} onPositionChange={setCoordinates} />
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="images" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hostel Images (Max 5)</label>
              <div className="border border-dashed border-slate-400 p-6 md:p-8 text-center hover:bg-slate-50 transition-colors">
                <input 
                  id="images" 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  required 
                />
                <label htmlFor="images" className="cursor-pointer flex flex-col items-center justify-center">
                  <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">Choose Files</span>
                  <span className="text-[10px] text-slate-500">or drag and drop</span>
                </label>
              </div>
              {images.length > 0 && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">{images.length} file(s) selected</p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white py-4 md:py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-8" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving Hostel...' : 'Save & Continue to Rooms'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

