# Business Model & Expense Report
## Digital Local Appointment Scheduling System (DLASS)

---

### 1. Executive Summary
The Digital Local Appointment Scheduling System (DLASS) is a platform designed to bridge the gap between local service providers (clinics, salons, repair services, etc.) and customers. By automating booking workflows, it reduces administrative overhead and eliminates the common issue of manual scheduling and "no-shows" via automated reminders.

### 2. Business Model
The business model is based on a **Software as a Service (SaaS)** framework, focusing on affordability for small Indian businesses.

#### A. Revenue Streams
1.  **Starter (Free Tier):**
    *   **Features:** Basic scheduling, 50 bookings/month, email notifications.
    *   **Goal:** User acquisition and product familiarity.
2.  **Basic (₹499/month):**
    *   **Features:** Unlimited bookings, SMS notifications, basic analytics dashboard, customer database.
3.  **Pro (₹999/month):**
    *   **Features:** Multi-staff management, online payment integration (Razorpay/Stripe), advanced scheduling rules, AI-driven booking recommendations.

#### B. Target Audience
*   Healthcare (Clinics, Physiotherapists)
*   Beauty & Wellness (Salons, Spas)
*   Professional Services (Lawyers, Consultants)
*   Home Services (Plumbing, Electrical, HVAC)

---

### 3. Expense Forecast (Minimum Cost Strategy)
The primary objective is to keep operational overhead low by utilizing "Free Tiers" of major cloud providers during the MVP phase.

| Category | Item | Provider | Estimated Cost (INR/Year) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Domain** | .in or .com Domain | Hostinger / GoDaddy | ₹800 - ₹1,200 | Initial purchase + annual renewal |
| **Hosting** | Backend (Spring Boot) | Render / Railway | ₹0 (Free Tier) | 512MB RAM, limited active time |
| **Hosting** | Frontend (React) | Vercel / Netlify | ₹0 (Forever Free) | Global CDN infrastructure |
| **Database** | PostgreSQL | Neon.tech / Supabase | ₹0 (Free Tier) | Scalable managed cloud DB |
| **Security** | SSL Certificate | Let's Encrypt | ₹0 | Included in hosting services |
| **Email Service** | Transactional Emails | Brevo (formerly Sendinblue) | ₹0 (Free Tier) | 300 emails per day limit |
| **SMS Gateway** | Appointment Alerts | Fast2SMS / Twilio | ₹500 | Pay-as-you-go (~₹0.20 per SMS) |
| **Payment Gateway** | Transaction Fee | Razorpay / Stripe | ~2% per txn | No upfront cost |
| **TOTAL INITIAL COST** | | | **₹1,300 - ₹1,700** | **Total for 1 Year (MVP)** |

---

### 4. Scalability Cost (Pro Setup)
Once the platform exceeds the free tier limits (usually >10 active businesses), the following paid infrastructure is recommended:

*   **VPS Hosting:** ₹500/month (DigitalOcean Droplet or AWS Lightsail) = **₹6,000/year**.
*   **Managed Database:** ₹1,200/month (Optional upgrade) = **₹14,400/year**.
*   **Total Scaled Cost:** ~₹2,000/month across all components.

### 5. Implementation Roadmap
1.  **Q1 (MVP):** Deploy on free tiers, focus on local adoption.
2.  **Q2 (Growth):** Integrate paid SMS bundles for better delivery rates.
3.  **Q3 (Scale):** Move to a dedicated VPS in the AWS Mumbai Region (ap-south-1) for lower latency.

---

*Prepared by: Antigravity AI*
*Date: April 2, 2026*
