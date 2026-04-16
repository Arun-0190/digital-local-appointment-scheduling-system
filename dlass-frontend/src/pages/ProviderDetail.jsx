import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/authService";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import ReviewModal from "../components/ReviewModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api`;

function fmt(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [selectedService, setSelectedService] = useState(null);
  const [bookDate, setBookDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookSuccess, setBookSuccess] = useState("");
  const [bookError, setBookError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profRes, svcRes, revRes] = await Promise.all([
          axios.get(`${API}/providers/${id}/profile`),
          axios.get(`${API}/providers/${id}/services`),
          axios.get(`${API}/reviews/provider/${id}`)
        ]);
        setProfile(profRes.data.provider);
        setServices(svcRes.data);
        setReviews(revRes.data);
      } catch (e) {
        setError("Failed to load provider details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);



  const fetchSlots = () => {
    if (!selectedService || !bookDate) { setSlots([]); return; }
    setSlotsLoading(true);
    setSelectedSlot(null);
    setBookError("");
    axios
      .get(`${API}/providers/${id}/slots`, { params: { serviceId: selectedService.id, date: bookDate } })
      .then((r) => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => { fetchSlots(); }, [selectedService, bookDate, id]);

  async function handleBook() {
    if (!selectedSlot) return;
    const token = getToken();
    if (!token) { navigate("/login"); return; }
    setBooking(true);
    setBookError("");
    setBookSuccess("");
    try {
      await axios.post(
        `${API}/appointments`,
        {
          providerId: id,
          serviceId: selectedService.id,
          date: bookDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookSuccess("Appointment booked! Check your dashboard.");
      fetchSlots();
      setSelectedSlot(null);
    } catch (e) {
      setBookError(e.response?.data?.message || "Booking failed. That slot may be taken.");
    } finally {
      setBooking(false);
    }
  }

  if (loading)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center pt-32">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );

  if (error)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center pt-32">
          <p className="text-coral text-center bg-coral/10 px-6 py-4 rounded-xl border border-coral/20">{error}</p>
        </div>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-textSecondary hover:text-textPrimary font-headline font-bold text-sm mb-8 transition-colors mt-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Search
        </button>

        <section className="mb-10">
          <GlassCard className="!p-6 md:!p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-600/5 dark:bg-indigo-400/5 group-hover:bg-indigo-600/10 transition-colors" />

            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-indigo-600/10 flex items-center justify-center shrink-0 border-2 border-indigo-500/20 shadow-lg">
              {profile?.profileImageUrl ? (
                <img 
                  src={`${BASE_URL}${profile.profileImageUrl.startsWith('/') ? '' : '/'}${profile.profileImageUrl}`} 
                  alt={profile.businessName || "Provider"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="material-symbols-outlined text-4xl text-indigo-600 dark:text-indigo-400">person</span>
              )}
            </div>

            <div className="relative flex-1 space-y-3 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-textPrimary">
                    {profile?.businessName}
                  </h1>
                  <h2 className="text-lg text-textSecondary font-medium mt-1 mb-2">
                    {profile?.userName || "Provider"}
                  </h2>
                  <p className="text-blue-600 dark:text-blue-400 font-headline font-bold flex items-center gap-1 mt-1 text-xs uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg w-fit border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    {profile?.experienceYears} Year{profile?.experienceYears !== 1 ? "s" : ""} Experience
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span
                      className="material-symbols-outlined text-amber-500 text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-textPrimary font-bold text-xl leading-none">{profile?.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-textSecondary text-xs">({profile?.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="text-textSecondary text-xs flex items-center gap-1 opacity-70">
                    <span className="material-symbols-outlined text-sm text-indigo-600">location_on</span>
                    {profile?.area}, {profile?.city} — {profile?.pincode}
                  </div>
                  <div className="mt-2 w-full">
                    <Button 
                      onClick={() => navigate("/dashboard", { state: { openChatWith: { id: profile.userId, name: profile.businessName } } })} 
                      className="w-full !px-4 !py-2 text-sm flex items-center justify-center gap-2"
                      variant="outline"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      Chat Provider
                    </Button>
                  </div>
                </div>
              </div>
              {profile?.description && (
                <p className="text-textSecondary leading-relaxed max-w-2xl text-sm pt-2">
                  {profile.description}
                </p>
              )}
            </div>
          </GlassCard>
        </section>

        {/* PORTFOLIO SECTION */}
        {profile?.portfolioImages && profile.portfolioImages.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold tracking-tight text-textPrimary flex items-center gap-3 mb-6">
              Portfolio
              <span className="h-px flex-1 bg-gradient-to-r from-glassBorder to-transparent" />
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.portfolioImages.map((imgUrl, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-glassBorder group">
                  <img
                    src={`${BASE_URL}/uploads/provider/${imgUrl}`}
                    alt={`Portfolio ${i+1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-headline font-bold tracking-tight text-textPrimary flex items-center gap-3">
              Available Services
              <span className="h-px flex-1 bg-gradient-to-r from-glassBorder to-transparent" />
            </h2>

            {services.length === 0 ? (
              <GlassCard className="!p-8 text-center shadow-none border-dashed bg-transparent">
                <span className="material-symbols-outlined text-4xl text-textSecondary/30 mb-2 block">
                  category
                </span>
                <p className="text-textSecondary/60 text-sm">No services listed yet.</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <GlassCard
                      key={svc.id}
                      hoverEffect={!isSelected}
                      onClick={() => { setSelectedService(svc); setBookSuccess(""); setBookError(""); }}
                      className={`!p-5 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20 relative shadow-xl bg-indigo-50/10 scale-[1.02]"
                          : "border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2 pr-8">
                        <h3 className="text-base font-headline font-bold text-textPrimary">
                          {svc.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                         <span className="text-textSecondary flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {svc.durationMinutes} min
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold font-headline text-lg">₹{svc.price}</span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <GlassCard className="!p-6 md:!p-8 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-glassBorder pb-6">
                <h2 className="text-2xl font-headline font-bold tracking-tight text-textPrimary">
                  Schedule Appointment
                </h2>
                {selectedService && (
                  <span className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {selectedService.name} Selected
                  </span>
                )}
              </div>

              {!selectedService ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-textSecondary/20 mb-6">
                    event_available
                  </span>
                  <p className="text-textSecondary font-headline font-bold text-lg">
                    Select a service to view availability
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <label className="block text-xs font-label font-bold text-textSecondary uppercase tracking-widest mb-3 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">calendar_today</span>
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookDate}
                      min={todayISO()}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full sm:w-1/2 px-4 py-3 bg-inputBg border border-inputBorder rounded-xl text-textPrimary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm shadow-inner"
                    />
                  </div>

                  <div className="mb-8">
                    <label className="block text-xs font-label font-bold text-textSecondary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Available Time Slots
                    </label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="bg-black/5 dark:bg-white/5 rounded-xl p-6 text-center border border-glassBorder">
                         <span className="material-symbols-outlined text-textSecondary/50 text-3xl mb-2">event_busy</span>
                         <p className="text-textSecondary text-sm">
                          No available slots for this date.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {slots.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
                                  : "bg-white dark:bg-gray-800 text-textSecondary hover:text-indigo-600 hover:border-indigo-400 border border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              {fmt(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {bookSuccess && (
                    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                      <span className="material-symbols-outlined text-teal-400">task_alt</span>
                      <p className="text-teal-500 font-bold text-sm">{bookSuccess}</p>
                    </div>
                  )}
                  {bookError && (
                    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-coral/10 border border-coral/20">
                      <span className="material-symbols-outlined text-coral">error</span>
                      <p className="text-coral text-sm">{bookError}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-glassBorder mt-auto">
                    <Button
                      onClick={handleBook}
                      disabled={!selectedSlot || booking}
                      isLoading={booking}
                      className="w-full text-base py-4"
                    >
                      {selectedSlot ? (
                        <span className="flex items-center gap-2">
                           <span className="material-symbols-outlined">event_on</span>
                           Confirm {fmt(selectedSlot.startTime)} Booking
                        </span>
                      ) : (
                        "Select a slot to book"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
        
        {/* REVIEWS SECTION */}
        <section className="mt-10 mb-20 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-glassBorder pb-6">
            <h2 className="text-2xl font-headline font-bold tracking-tight text-textPrimary flex items-center gap-3">
              Client Reviews
            </h2>
          </div>
          
          {reviews.length === 0 ? (
             <GlassCard className="!p-8 text-center shadow-none border-dashed bg-transparent">
               <span className="material-symbols-outlined text-4xl text-textSecondary/30 mb-2 block">
                 rate_review
               </span>
               <p className="text-textSecondary/60 text-sm">No reviews yet. Be the first to review this provider!</p>
             </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(rev => (
                <GlassCard key={rev.id} className="!p-6 group relative overflow-hidden flex flex-col h-full hover:border-indigo-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-0.5 mb-4 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 w-fit rounded-lg">
                      {[1,2,3,4,5].map(star => (
                         <span key={star} className={`material-symbols-outlined text-sm ${rev.rating >= star ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`} style={{ fontVariationSettings: rev.rating >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {rev.userName ? rev.userName.charAt(0) : "U"}
                      </div>
                      <span className="text-sm font-bold text-textPrimary">{rev.userName || "User"}</span>
                    </div>

                    {rev.comment ? (
                      <p className="text-textPrimary text-base mb-6 leading-relaxed flex-1 italic group-hover:text-indigo-950 dark:group-hover:text-indigo-100 transition-colors">"{rev.comment}"</p>
                    ) : (
                      <p className="text-textSecondary/50 italic text-sm mb-6 flex-1">Excellent service!</p>
                    )}
                    <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                       <span className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
                         <span className="material-symbols-outlined text-[10px]">event</span>
                         {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>



      </div>
    </PageWrapper>
  );
}
