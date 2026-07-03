# Snack & Go at Sun Petro — Website

A warm, image-rich marketing site for **Snack & Go**, the family-owned convenience
store with a full-service **Sun Petro** gas station in Williamstown, NJ.

Built as plain **HTML + CSS + JavaScript** — no build step, no framework, no
dependencies. Just open it or drop it on any static host.

```
sunperto/
├── index.html         ← all the page content
├── css/styles.css     ← colors, fonts, layout
├── js/main.js         ← carousel, animations, menu, image fallback
├── images/            ← drop your own photos here (see images/README.txt)
└── README.md          ← this file
```

---

## Preview it locally

**Easiest:** double-click `index.html` — it opens in your browser.

**Better (so maps/fonts behave exactly like production),** run a tiny local
server from this folder:

```bash
# Python 3 (already on most machines)
python -m http.server 8080
```

Then visit <http://localhost:8080>. (On Windows PowerShell the same command
works if Python is installed; or install the VS Code "Live Server" extension and
click **Go Live**.)

---

## 1. Swap the stock photos for your own

Every image is stock right now and clearly marked. To use your own:

1. Put your photo in the **`images/`** folder, e.g. `images/my-store.jpg`.
2. In `index.html`, find the image — each has a comment above it like:
   ```html
   <!-- REPLACE: bright convenience-store interior with full shelves · 1200×900 -->
   ```
3. Change its `src` to your file and update the `alt` text:
   ```html
   <img class="stock" loading="lazy"
        src="images/my-store.jpg"
        alt="Inside our Williamstown store on a busy morning" />
   ```

Recommended sizes are listed in **`images/README.txt`**.

> If any image URL fails to load, the site automatically replaces it with a clean
> red placeholder tile showing the description — you’ll never see a broken image.

---

## 2. Edit text (hours, phone, address, etc.)

All text lives in **`index.html`** — open it in any editor and change the words.
Common edits:

| To change…            | Search `index.html` for…                         |
|-----------------------|--------------------------------------------------|
| Phone number          | `740-9125` (appears in links as `tel:+18567409125` and as visible text) |
| Address               | `505 N Black Horse Pike`                          |
| Hours                 | the `Hours` section — `6:00 AM – 10:00 PM` rows   |
| Tagline / hero words  | the `hero-tagline` and `hero-title` blocks        |
| Testimonials          | the `testimonials` section (reworded placeholders — replace with your own) |
| Map / Street View     | the coordinates `39.6943015,-74.9981898`          |

**Important:** if you change the phone number, update **both** the visible text
**and** the `tel:` link (e.g. `href="tel:+18567409125"`). Likewise, if the
business info changes, also update the matching values in the **JSON-LD** block
near the top of `index.html` (inside `<script type="application/ld+json">`) so
Google shows the correct details.

Fuel prices are intentionally **not** on the site — the “Check Today’s Prices”
button links out to GasBuddy so you never have to update numbers by hand.

---

## 3. Deploy it free (pick one)

The whole site is static files, so any of these work. **Netlify drag-and-drop is
the fastest.**

### Option A — Netlify (drag & drop, ~1 minute)
1. Go to <https://app.netlify.com/drop>.
2. Drag the **entire `sunperto` folder** onto the page.
3. Done — you get a live URL instantly. To use your own domain, open
   **Site settings → Domain management** and follow the steps.

### Option B — Vercel
1. Install once: `npm i -g vercel` (or use the website).
2. From this folder run: `vercel` and follow the prompts (accept defaults).
3. Run `vercel --prod` to publish. Custom domains are added in the dashboard.

### Option C — GitHub Pages (free with a GitHub account)
1. Create a new GitHub repo and upload these files (keep the folder structure).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select the **`main`** branch and the **`/ (root)`** folder, then **Save**.
5. Your site appears at `https://<your-username>.github.io/<repo-name>/` in a
   minute or two.

---

## Notes on what’s built in

- **Responsive & mobile-first** — looks great from phone to desktop.
- **Accessible** — semantic HTML, alt text on every image, keyboard-navigable
  nav and carousel, skip link, strong color contrast, respects
  “reduce motion” settings.
- **Fast** — lazy-loaded images, no frameworks, system-friendly fonts.
- **SEO** — descriptive title, meta description, Open Graph tags, and
  `LocalBusiness` (ConvenienceStore) JSON-LD with your address, phone, geo
  coordinates and daily 6 AM–10 PM hours.
- **Maps** — embedded Google Map + Google Street View, plus “Get Directions”
  buttons that open Google Maps navigation. No API key required.

Fonts: **Fredoka** (headings) + **Nunito Sans** (body), loaded from Google Fonts.
Colors: warm red `#D62828` / deep red `#A01D1D` on cream `#FFF7F0` and white,
with warm charcoal `#2C2622` text.
