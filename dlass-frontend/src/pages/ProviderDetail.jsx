import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/authService";

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
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="spinner" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );

  const starCount = Math.round(profile?.rating || 0);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-white font-headline font-bold text-sm mb-8 transition-colors mt-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Search
        </button>

        {/* Provider Header Card */}
        <section className="mb-10">
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />

            {/* Avatar placeholder */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-xl">
              <span className="material-symbols-outlined text-4xl text-white">business_center</span>
            </div>

            <div className="relative flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tighter text-on-surface">
                    {profile?.businessName}
                  </h1>
                  <p className="text-secondary font-headline font-bold tracking-tight flex items-center gap-1 mt-1 text-sm">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    {profile?.experienceYears} Year{profile?.experienceYears !== 1 ? "s" : ""} Experience
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-outline-variant/10">
                    <span
                      className="material-symbols-outlined text-secondary text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-on-surface font-bold text-lg">{profile?.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-on-surface-variant text-sm">({profile?.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="text-on-surface-variant text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {profile?.area}, {profile?.city} — {profile?.pincode}
                  </div>
                </div>
              </div>
              {profile?.description && (
                <p className="text-on-surface-variant leading-relaxed max-w-2xl font-body italic text-sm">
                  &quot;{profile.description}&quot;
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Main 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Services List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface flex items-center gap-3">
              Available Services
              <span className="h-px flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent" />
            </h2>

            {services.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">
                  category
                </span>
                <p className="text-on-surface-variant/60 text-sm">No services listed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => { setSelectedService(svc); setBookSuccess(""); setBookError(""); }}
                      className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:translate-x-1 ${
                        isSelected
                          ? "border-l-4 border-secondary ring-1 ring-secondary/30 relative"
                          : "border-l-4 border-primary/40 hover:border-primary"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2">
                          <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-on-secondary text-sm">check</span>
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-base font-headline font-bold text-on-primary-container">
                          {svc.name}
                        </h3>
                        <span className="text-secondary font-bold font-headline">₹{svc.price}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        ⏱ {svc.durationMinutes} min
                      </p>
                      <button
                        className={`w-full mt-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-tight transition-all ${
                          isSelected
                            ? "bg-surface-container-highest text-on-surface-variant cursor-default"
                            : "bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select Service"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-6 md:p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">
                  Schedule Appointment
                </h2>
                {selectedService && (
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {selectedService.name}
                  </span>
                )}
              </div>

              {!selectedService ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4">
                    touch_app
                  </span>
                  <p className="text-on-surface-variant/50 font-headline font-bold">
                    Select a service to book
                  </p>
                </div>
              ) : (
                <>
                  {/* Date Picker */}
                  <div className="mb-6">
                    <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookDate}
                      min={todayISO()}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-highest/50 border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="mb-8">
                    <h3 className="text-sm font-label tracking-widest text-on-surface-variant uppercase mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Available Time Slots
                    </h3>
                    {slotsLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="spinner" />
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="text-on-surface-variant/50 text-sm py-4">
                        No available slots for this date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                                isSelected
                                  ? "bg-secondary-container text-on-secondary-container ring-2 ring-secondary/50 shadow-[0_0_15px_rgba(93,230,255,0.4)]"
                                  : "bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white border border-outline-variant/20"
                              }`}
                            >
                              {fmt(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {bookSuccess && (
                    <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <span className="material-symbols-outlined text-green-400">task_alt</span>
                      <p className="text-green-300 text-sm font-bold">{bookSuccess}</p>
                    </div>
                  )}
                  {bookError && (
                    <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <span className="material-symbols-outlined text-red-400">error</span>
                      <p className="text-red-300 text-sm">{bookError}</p>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <button
                    onClick={handleBook}
                    disabled={!selectedSlot || booking}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-black text-base shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {booking ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Booking…
                      </span>
                    ) : selectedSlot ? (
                      `Confirm ${fmt(selectedSlot.startTime)} – ${fmt(selectedSlot.endTime)}`
                    ) : (
                      "Select a slot to book"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
