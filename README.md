<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/33383c18-6751-4607-9027-fab167196232

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Users & roles

Sign in as the system administrator with `admin@isoft.internal` / `hr2026`, then open **User Access** in the sidebar to:

- create a login for a new person or an existing employee (email, password, role)
- change a user's role (Admin, CEO, CTO, HR Team, Leader, Employee)
- reset passwords, disable or remove logins

Each user sees only the screens and actions their role allows. Only admins can change roles or preview the app as another role.
Logins are stored in the browser (localStorage) with hashed passwords; a production deployment needs a server-side auth backend.
