import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/authService";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

const API = "http://localhost:8080/api";

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
        const [profRes, svcRes] = await Promise.all([
          axios.get(`${API}/providers/${id}/profile`),
          axios.get(`${API}/providers/${id}/services`),
        ]);
        setProfile(profRes.data.provider);
        setServices(svcRes.data);
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
            <div className="absolute inset-0 bg-primary/5 opacity-50" />

            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-xl">
              <span className="material-symbols-outlined text-4xl text-primary">business_center</span>
            </div>

            <div className="relative flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-textPrimary">
                    {profile?.businessName}
                  </h1>
                  <p className="text-secondary font-headline font-bold flex items-center gap-1 mt-1 text-sm bg-secondary/10 px-3 py-1 rounded-full w-fit">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    {profile?.experienceYears} Year{profile?.experienceYears !== 1 ? "s" : ""} Experience
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-glassBorder shadow-sm">
                    <span
                      className="material-symbols-outlined text-secondary text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-textPrimary font-bold text-xl leading-none">{profile?.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-textSecondary text-xs">({profile?.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="text-textSecondary text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {profile?.area}, {profile?.city} — {profile?.pincode}
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
                          ? "border-secondary ring-1 ring-secondary/30 relative shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-secondary/5 scale-[1.02]"
                          : "border-glassBorder"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-secondary">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2 pr-8">
                        <h3 className="text-base font-headline font-bold text-textPrimary">
                          {svc.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                         <span className="text-textSecondary flex items-center gap-1 text-sm bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {svc.durationMinutes} min
                        </span>
                        <span className="text-primary font-bold font-headline text-lg">₹{svc.price}</span>
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
                  <span className="text-xs font-label tracking-widest text-secondary uppercase bg-secondary/10 px-4 py-2 rounded-full font-bold">
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
                                  ? "bg-secondary text-deep-navy shadow-lg scale-105"
                                  : "bg-inputBg text-textPrimary hover:bg-glassBorder hover:border-primary/50 border border-inputBorder"
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
      </div>
    </PageWrapper>
  );
}
