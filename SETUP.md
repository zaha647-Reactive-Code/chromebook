# MyChromebook.pk — Next.js + Firebase setup

This is the same website, converted to Next.js and connected to Firebase
(project **chromebook-site**), as described in the QA report.

---

## Part 1 — Run it on your computer (Anum)

Do these in the Antigravity terminal, inside the `chromebook` folder, on the
`nextjs-conversion` branch.

**1. Move the images into the new `public` folder**

```
mkdir public
git mv assets public/assets
```

**2. Create your settings file** (the public Firebase details are already in it)

```
Copy-Item .env.example .env.local
```

**3. Install and start**

```
npm install
npm run dev
```

Open **http://localhost:3000**. The whole site works with the current 24 products.
Until Firebase is connected (Part 2), placing an order or sending the contact form
shows a clear "not connected yet" message. It does **not** pretend to work.

**4. Save your work to GitHub**

```
git add -A
git commit -m "Convert site to Next.js with Firebase"
git push -u origin nextjs-conversion
```

---

## Part 2 — Connect Firebase (owner or Anum, one time)

In the Firebase console → project **chromebook-site** (report section 6.3):

1. **Blaze plan** with a budget alert (for example Rs 2,000 a month).
2. **Authentication** → Sign-in method → turn on **Email/Password**.
   Settings → Authorized domains → add `localhost`, the live domain, and the Vercel domain.
3. **Firestore Database** → Create → **production mode** → location **asia-south1**.
4. **Storage** → Get started → same location.
5. **Rules** — publish these before adding any data:
   - Firestore → Rules → paste the contents of `firestore.rules` → Publish
   - Storage → Rules → paste the contents of `storage.rules` → Publish
6. **Service-account key** (this is the secret that lets the website's server save orders):
   Project settings → Service accounts → **Generate new private key**.
   Save the file **outside** the project folder, for example in Documents.
   **Never** put it in GitHub, WhatsApp, email or any AI chat.
   Then add it to `.env.local` with this command. Change the path to where you saved the file:

   ```
   $k = Get-Content "$HOME\Documents\chromebook-site-key.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 10
   Add-Content .env.local "FIREBASE_SERVICE_ACCOUNT=$k"
   ```

7. **Copy the 24 products into Firestore** (one time):

   ```
   npm run migrate:products
   ```

8. Stop the site (Ctrl + C) and start it again with `npm run dev`. Orders, tracking
   and the contact form now save to Firebase.

### Make the first admin (report 6.6)

1. On the site, create a normal account for the owner at **/signup**.
2. In the terminal:
   ```
   npm run make-admin -- owner@email.com
   ```
3. Sign out and sign in again. **/admin** now opens: products (with photo upload),
   orders, messages and store settings.
4. In **Admin → Settings**, enter the real WhatsApp number and bank details.
5. In **Admin → Products**, enter the real stock quantities. For each product with real
   specifications, fill them in and untick **Sample content**.

### Email alerts for new orders (choose one)

- **Option A (easiest):** create a free account at resend.com, then add to `.env.local`:
  `RESEND_API_KEY=...` and `ALERT_EMAIL_TO=the-address-that-gets-order-alerts`
- **Option B:** install the Firebase **Trigger Email** extension. The site already
  writes every email to the `mail` collection for it.

Until one of these is set up, orders are still saved and show up live in the admin
panel, but no email is sent.

---

## Part 3 — Go live (owner)

1. **vercel.com** → Add New Project → import the GitHub repository → branch `nextjs-conversion`
   (or merge it into `main` first).
2. **Environment Variables**: add every line from `.env.local`, including
   `FIREBASE_SERVICE_ACCOUNT` (and `RESEND_API_KEY` / `ALERT_EMAIL_TO` if used).
   Set `NEXT_PUBLIC_SITE_URL=https://mychromebook.pk`.
3. Deploy, then connect the domain `mychromebook.pk` in Vercel → Domains.
4. Firebase → Authentication → Authorized domains → add `mychromebook.pk`.
5. Google Cloud Console → APIs & Services → Credentials → restrict the browser API
   key to the site's addresses (report 6.3 step 8).
6. After it works: turn on **App Check** (report 6.3 step 7).

Old addresses (`shop.html`, `product.html?id=…`, and the old WordPress links)
redirect to the new pages automatically.

---

## What is still a demo, or needs the business

| Item | Status |
|---|---|
| Orders, stock, tracking, contact form | Built and tested against a stand-in database. **First real test: after Part 2.** |
| Accounts, admin panel, photo upload | Built. **First real test: after Part 2.** Firebase logins cannot be reached from the build workspace. |
| Email alerts | Needs Option A or B above. |
| Stock quantities | Placeholders (10 / 2 / 0). Enter the real numbers in Admin. |
| Product specs and extra photos | Sample content is **hidden** from customers until real data is entered. |
| WhatsApp number, bank details | Enter them in Admin → Settings. |
| Terms, Refund, Privacy pages | Drafts. The owner decides the open points (report I8), then a legal check. |
| Blog editing in admin (M5) | Not built yet. Articles are in `data/posts.json`. Left out under the report's "cut polish first" rule. |
| Old HTML files in the repository | Delete them after you've checked the new pages (`git rm *.html`, then keep going). |
