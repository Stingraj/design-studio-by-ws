# Design Studio by WS — Private Invitation & Elite Registry

An invitation-only, award-winning architectural and spatial design platform built with **React**, **Vite**, **GSAP**, **Lenis**, and **Supabase**.

---

## 🏛️ Design Mood & Typography
* **Aesthetic**: Roman gravitas meets Italian Didone refinement (Marble, Ink, Antique Gold hairlines, and negative space).
* **Typography**:
  - `Cinzel`: Roman inscriptional capitals for section headings, navigation, and badges.
  - `Bodoni Moda`: Italian Didone typography for primary hero typography and numerals.
  - `Cormorant Garamond`: Body and italic editorial taglines.
  - `Inter` & `JetBrains Mono`: Clean interface and data display.
* **Palette**: Ivory (`#F5F0E6`), Ink (`#0E0E0E`), Oxblood (`#5A1A1F`), Antique Gold (`#B08D57`), Stone (`#8C877D`).

---

## 🔐 Authentication & Access Control

Access to the private member registry is strictly invitation-only based on the Supabase `elite_allowlist` table:

| Email | Role | Access Scope |
| :--- | :--- | :--- |
| `you@example.com` | `admin` | Full Administration Dashboard + Elite Member Portal |
| `member1@example.com` | `elite` | Private Elite Portfolio, Flagship Briefings, Project Uploader |

### Evaluation Quick Access
Click the **"Elite"** button in the navigation bar or the **"Member Access Login"** button in Section IV. The login modal includes quick-fill buttons for both roles.

---

## 📂 Public & Private Sections

1. **Hero**: 32.1s high-definition cinematic scroll-scrubbing video experience with camera dolly and subtle blur typography transitions.
2. **I. Companies (`#companies`)**: Live database query of affiliated ventures and design studios from Supabase `companies`. Click any card to expand details.
3. **II. Direction & Team (`#team`)**: Principals of the studio from `team_members` with grayscale-to-color portraits and small-caps expertise tags.
4. **III. Projects & Portfolios (`#projects`)**: Full-screen 100vh parallax scroll sequence through realized projects + interactive 3D presentations.
5. **Spatial Genesis Film**: Transformation video sequence from raw volume to finished architecture.
6. **IV. Private Registry Invitation (`#elite`)**: Invitation-only statement and direct modal login.
7. **Elite Member Portal (`/elite`)**:
   - Classified Flagship Case Study (**Project Aquila**).
   - Signed private media URL viewer (60 min expiry) from `elite-assets`.
   - Project Upload Form with database synchronization and storage bucket integration.
8. **Administration Dashboard (`/admin`)**:
   - Manage Projects (Public & Elite).
   - Manage Companies & Sort Order.
   - Manage Team Members.
   - Authorize & Deactivate Members via `elite_allowlist`.
   - Live Access Logs & Audit Trail.

---

## ⚙️ Environment Variables (`.env.local`)

```env
VITE_SUPABASE_URL=https://vmcnrepbmhcxnonylbtw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_K92wdH9R8eKNLfwnQeqEiQ_ZX7nWWFI
# Never put a service-role key in a VITE_ variable — VITE_ values are shipped to the browser.
# Admin operations belong in a server-side function.
```
