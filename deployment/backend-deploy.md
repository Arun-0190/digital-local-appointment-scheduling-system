# 🚀 Backend Deployment Guide (Render)

This guide explains how to deploy the DLASS backend specifically to [Render](https://render.com).

## 1. Prerequisites
- A Render account.
- A GitHub/GitLab repository with your project code.
- A MongoDB Atlas connection string.

## 2. Deployment Steps

### Method A: Using Docker (Recommended)
1. Log in to Render and click **New > Web Service**.
2. Connect your repository.
3. Select the `backend/dlass-backend` folder if prompted for a Root Directory.
4. Render should automatically detect the `Dockerfile`.
5. In the **Environment Variables** section, add the following (see below).

### Method B: Native Java Runtime
If you prefer not to use Docker:
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/dlass-backend-0.0.1-SNAPSHOT.jar`
- **Runtime**: Select `Docker` or ensure the environment has Java 21.

---

## 3. Required Environment Variables

Add these in the Render Dashboard under **Environment**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster...` |
| `FRONTEND_URL` | The URL of your deployed frontend | `https://dlass.onrender.com` |
| `PORT` | Auto-provided by Render | `10000` (handled by app) |
| `JWT_SECRET` | Secret key for JWT signing | `AnyLongRandomStringHere` |
| `MAIL_HOST` | SMTP Host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP Port | `587` |
| `MAIL_USERNAME` | SMTP Email | `your-email@gmail.com` |
| `MAIL_PASSWORD` | App-specific Password | `xxxx xxxx xxxx xxxx` |
| `ADMIN_EMAIL` | Initial Admin Email | `admin@dlass.com` |
| `ADMIN_PASSWORD` | Initial Admin Password | `SetSecurePassword123` |

---

## 4. Persistent Storage (Optional but Recommended)
By default, uploaded avatars and portfolio images are saved to the `uploads/` folder inside the container. **This storage is ephemeral** and will be wiped on every redeploy.

To persist these files:
1. Go to **Settings > Disks** in your Render service.
2. Click **Add Disk**.
3. **Name**: `uploads-storage`.
4. **Mount Path**: `/app/uploads`.
5. **Size**: 1GB (Free tier/Starter).

---

## 5. Deployment Checks
- After deployment, visit your URL (e.g., `https://dlass-api.onrender.com/api/auth/test` or similar) to verify it's running.
- Check the **Logs** tab in Render for any startup errors.
