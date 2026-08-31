# 🍽️ RESTAURANT ONBOARDING DATA TEMPLATE
> **Instructions for AI Agents & Operators:** Fill out all sections of this document before replicating or adapting the codebase. Every field maps directly to application configuration constants, styling tokens, SEO tags, or database seeds.

---

## 1. Brand Identity & Basic Information

| Field Key | Field Name | Description | Example / Format | Your Restaurant Data |
| :--- | :--- | :--- | :--- | :--- |
| `BRAND_NAME` | Restaurant Name | Primary display name of the restaurant | `Benne Saaram` | |
| `BRAND_NAME_LOCAL` | Localized Script Name | Name in regional/native script (optional) | `ಬೆಣ್ಣೆ ಸಾರಂ` or `बेण्णे सारಮ್` | |
| `TAGLINE` | Brand Tagline | Short 3-6 word slogan under hero title | `Authentic South Indian Flavours` | |
| `SUBTITLE` | Secondary Tagline | Concise summary of core specialties | `Davangere Benne Dosa & Degree Filter Kaapi` | |
| `CUISINE_TYPE` | Primary Cuisine | Main culinary category | `South Indian / Karnataka / Udupi` | |
| `DIETARY_TYPE` | Dietary Standard | Dietary classification (`veg`, `vegan`, `jain`, `non-veg`, `halal`, `mixed`) | `veg` | |
| `PRICE_RANGE` | Price Category | Price rating symbol | `₹` or `₹₹` | |
| `ESTABLISHED_YEAR` | Year Founded | Year the establishment was opened | `2024` | |

---

## 2. Contact & Location Information

| Field Key | Field Name | Description | Example / Format | Your Restaurant Data |
| :--- | :--- | :--- | :--- | :--- |
| `PHONE_DISPLAY` | Formatted Phone | Human-readable contact phone number | `+91 98902 04569` | |
| `PHONE_CLEAN` | Clean Dial Phone | Digits-only phone for `tel:` links | `919890204569` | |
| `WHATSAPP_NUMBER` | WhatsApp Order Phone | Digits with country code for WhatsApp ordering | `917057053534` | |
| `EMAIL` | Contact Email | Support or inquiry email (optional) | `hello@bennesaaram.com` | |
| `INSTAGRAM_HANDLE` | Instagram Handle | Instagram profile username | `@bennesaaramofficial` | |
| `INSTAGRAM_URL` | Instagram Link | Full URL to Instagram profile | `https://www.instagram.com/bennesaaramofficial` | |
| `STREET_ADDRESS_L1` | Street Address Line 1 | Unit, shop number, building name | `Shop No. 1, Pandit Park-2` | |
| `STREET_ADDRESS_L2` | Street Address Line 2 | Landmark, cross street, neighborhood | `Near Cycle Circle, Parijat Nagar` | |
| `CITY` | City | City name | `Nashik` | |
| `STATE` | State / Province | State or administrative region | `Maharashtra` | |
| `POSTAL_CODE` | PIN / Postal Code | Postal code | `422005` | |
| `COUNTRY_CODE` | ISO Country Code | 2-letter country code | `IN` | |
| `MAPS_PLUS_CODE` | Google Plus Code | Open Location Code or 7-character code | `2Q35+82X, Nashik` | |
| `MAPS_URL` | Google Maps URL | Verified Google Maps listing URL | `https://maps.app.goo.gl/ihJwnuPz2DZmVrZG6` | |
| `LATITUDE` | Latitude | GPS coordinate for distance & maps | `19.9975` | |
| `LONGITUDE` | Longitude | GPS coordinate for distance & maps | `73.7898` | |

---

## 3. Operational Timings & Shifts

| Field Key | Field Name | Description | Example / Format | Your Restaurant Data |
| :--- | :--- | :--- | :--- | :--- |
| `TIMEZONE` | Timezone Identifier | Standard IANA timezone | `Asia/Kolkata` | |
| `HAS_SPLIT_SHIFTS` | Split Shift Mode | `true` if closed in afternoon, `false` if continuous | `true` | |
| `MORNING_OPEN_MIN` | Shift 1 Open Minute | Minutes from midnight (e.g. 8:00 AM = 8*60 = 480) | `480` (8:00 AM) | |
| `MORNING_CLOSE_MIN`| Shift 1 Close Minute | Minutes from midnight (e.g. 3:00 PM = 15*60 = 900) | `900` (3:00 PM) | |
| `MORNING_LABEL` | Shift 1 Display Name | Human-readable name for shift 1 | `Morning Batch (Breakfast & Lunch)` | |
| `EVENING_OPEN_MIN` | Shift 2 Open Minute | Minutes from midnight (e.g. 6:00 PM = 18*60 = 1080) | `1080` (6:00 PM) | |
| `EVENING_CLOSE_MIN`| Shift 2 Close Minute | Minutes from midnight (e.g. 10:00 PM = 22*60 = 1320) | `1320` (10:00 PM) | |
| `EVENING_LABEL` | Shift 2 Display Name | Human-readable name for shift 2 | `Evening Batch (Tawa Specials)` | |
| `WEEKLY_HOLIDAY_DAY`| Weekly Closed Day | Day index (`0`=Sun, `1`=Mon, `2`=Tue, `3`=Wed, `4`=Thu, `5`=Fri, `6`=Sat, `null`=None) | `2` (Tuesday) | |
| `HOLIDAY_LABEL` | Holiday Text | Human-readable notice for closed day | `Closed all day Tuesday` | |
| `PEAK_RUSH_HOURS` | Peak Rush Window | Time window when queues are highest | `8:30 AM – 10:30 AM` | |

---

## 4. Brand Narrative, Hero Copy & Section Text

| Field Key | Field Name | Description | Example / Format | Your Restaurant Data |
| :--- | :--- | :--- | :--- | :--- |
| `HERO_PUNCHLINE` | Hero Hook / Quote | Expressive italic quote in hero section | `Butter on the tawa before the batter.` | |
| `HERO_DESCRIPTION` | Hero Story Subtext | 2-line story explaining authenticity/craft | `Pure white butter on sizzling cast iron. The authentic soul of Davangere, made fresh every morning.` | |
| `SIGNATURES_TITLE` | Signatures Section Title| Headline for the S-curve showcase | `Three plates worth the queue` | |
| `SIGNATURES_SUBTITLE`| Signatures Subtitle | Subtitle explaining why these 3 are special | `Everything on the tawa starts from the same fourteen-hour batter. These three are what the morning line forms for.` | |
| `MENU_BOARD_TITLE` | Menu Section Title | Headline for full menu board | `The board` | |
| `MENU_BOARD_SUBTITLE`| Menu Section Subtitle| Ordering instructions above menu list | `Everything we make, in the order it comes off the line. Tap add to build a takeaway order, which goes out as a WhatsApp message you send yourself.` | |
| `VISIT_TITLE` | Footer Section Title | Headline for location/visit section | `Come by the circle` | |
| `VISIT_DESCRIPTION` | Footer Description | Short guide on seating, rush & takeout | `A small, food-first kitchen with a fast takeaway counter. The morning rush runs 8:30 to 10:30, so order ahead on WhatsApp and skip it.` | |
| `CATERING_NOTE` | Bulk / Catering Note | Note regarding bulk boxes / advance orders | `Same number on WhatsApp. Bulk breakfast boxes for poojas, offices and celebrations, called in a day ahead.` | |
| `PACKAGING_NOTE` | Takeaway Feature Note| Special note on food packaging | `Takeaway packed to stay crisp` | |
| `TAX_NOTE` | Pricing / Tax Note | Clarification on prices and currency | `Prices in rupees, taxes included` | |
| `LANGUAGE_CODE` | Subtitle Language Code | ISO language code for subtitle pronunciation (`kn`, `hi`, `mr`, `ta`, `it`, `fr`, `en`) | `kn` | |

---

## 5. Visual Identity, Color Palette & Fonts

| Token / Asset | Description | Recommended Hex / Value | Your Restaurant Value |
| :--- | :--- | :--- | :--- |
| `PRIMARY_COLOR` (`kara`) | Dominant brand accent, hero wrapper, primary buttons | `#991D22` (Ruby Kara Red) | |
| `PRIMARY_DARK` (`kara-dark`) | Hover states & dark accents | `#6B1419` | |
| `BACKGROUND_COLOR` (`coconut`)| Clean parchment / background surface | `#FAF5ED` (Coconut Ivory) | |
| `BACKGROUND_DARK` (`coconut-dark`)| Subtle borders, card contrast background | `#F0E7D8` | |
| `ACCENT_COLOR` (`ghee`) | Gold / highlights / price pills / badges | `#D49B35` (Ghee Gold) | |
| `ACCENT_LIGHT` (`ghee-light`) | High-contrast text on dark backgrounds | `#E5B45C` | |
| `DARK_CANVAS` (`kaapi`) | Deep charcoal, footer background, primary text | `#1F1A17` (Kaapi Charcoal) | |
| `DEEP_ACCENT` (`temple`) | Deep menu board canvas / secondary dark | `#5C1420` (Temple Maroon) | |
| `FONT_DISPLAY` | Editorial / Display Headings Font | `'DM Serif Display', serif` | |
| `FONT_BODY` | UI, Body Copy & Numbers Font | `'Plus Jakarta Sans', sans-serif` | |
| `EMBLEM_MOTIF_SVG` | Vector mark / watermark pattern path | `Sikku Kolam` (or custom SVG) | |

---

## 6. Social Proof & Ratings

| Field Key | Field Name | Description | Example / Format | Your Restaurant Data |
| :--- | :--- | :--- | :--- | :--- |
| `GOOGLE_RATING` | Aggregate Star Rating | Verified score out of 5.0 | `4.2` | |
| `REVIEW_COUNT` | Total Review Count | Formatted count of verified reviews | `175+` | |
| `REPUTATION_HIGHLIGHTS` | Customer Sentiment Highlights | Top 3 quotes from verified reviews | `["Crispiest dosa in town", "Filter coffee is pure gold", "Worth the morning rush"]` | |

---

## 7. Signature Dishes (The 3 Highlight Showcase Plates)

> **Note:** The layout features 3 flagship signature dishes in the Hero Section and S-Curve Split Section.

### Highlight 1 (Left Flank)
- **Dish Name**: `Ghee podi thatte Idli`
- **Subtitle (Local Name)**: `ತುಪ್ಪ ಪೋಡಿ ಥಟ್ಟೆ ಇಡ್ಲಿ`
- **Category**: `Idli & Vada`
- **Price**: `100`
- **Spice Level (0–3)**: `2`
- **Prep / Specialty Tag**: `Plate-sized • Pure cow ghee • Gunpowder podi`
- **Description**: `Plate-sized Karnataka idli bathed in pure hot cow ghee and crusted with gunpowder podi`
- **Image File**: `/images/thatte-idli.jpg` (and `/images/thatte-idli.webp`)

### Highlight 2 (Center Hero Star)
- **Dish Name**: `Benne plain dosa`
- **Subtitle (Local Name)**: `ಬೆಣ್ಣೆ ಸಾದಾ ದೋಸೆ`
- **Category**: `Dosa`
- **Price**: `120`
- **Spice Level (0–3)**: `0`
- **Prep / Specialty Tag**: `Stone-ground batter • Pure white butter`
- **Description**: `Golden crisp fermented batter roasted with generous pure white butter on heavy cast iron`
- **Image File**: `/images/benne-dosa.jpg` (and `/images/benne-dosa.webp`)

### Highlight 3 (Right Flank)
- **Dish Name**: `Garlic roast masala dosa`
- **Subtitle (Local Name)**: `ಬೆಳ್ಳುಳ್ಳಿ ರೋಸ್ಟ್ ಮಸಾಲ ದೋಸೆ`
- **Category**: `Dosa`
- **Price**: `170`
- **Spice Level (0–3)**: `3`
- **Prep / Specialty Tag**: `Red garlic paste • Spiced potato masala`
- **Description**: `Mahogany crisp garlic roast dosa filled with savory spiced potato masala`
- **Image File**: `/images/garlic-dosa.jpg` (and `/images/garlic-dosa.webp`)

---

## 8. Menu Categories (Courses)

List all menu categories with their display titles and brief editorial subtitle notes.

| Category Key | Display Title | Editorial Note (Subtitle) | Default Course Tint |
| :--- | :--- | :--- | :--- |
| `Dosa` | `Dosa` | `Cast iron, pure white butter, stone-ground batter` | `bg-sand` |
| `Uttappam` | `Uttappam` | `Thick, fluffy, cast-iron roasted` | `bg-sand` |
| `Idli & Vada` | `Idli & Vada` | `Thatte idli, button idli & crisp medu vada` | `bg-sage` |
| `Beverage` | `Beverages` | `Degree filter coffee, iced kaapi, chai & boost` | `bg-turmeric` |
| `Dessert` | `Desserts` | `Mysore pak, kesari bhat, softy & cheesecake` | `bg-rose` |

---

## 9. Full Menu Catalog Table

| ID | Item Name | Subtitle (Local / Note) | Category | Price (₹) | Spice (0-3) | Tags | Prep Line | Description | Image Path (Optional) |
| :- | :--- | :--- | :--- | :- | :- | :--- | :--- | :--- | :--- |
| 1 | Benne plain dosa | ಬೆಣ್ಣೆ ಸಾದಾ ದೋಸೆ | Dosa | 120 | 0 | `signature, bestseller` | Stone-ground batter • Pure white butter | Golden crisp fermented batter roasted with generous pure white butter on heavy cast iron | `/images/benne-dosa.jpg` |
| 2 | Benne plain Masala dosa | ಬೆಣ್ಣೆ ಮಸಾಲ ದೋಸೆ | Dosa | 140 | 1 | `bestseller` | Pure white butter • Spiced potato masala | Crisp white-butter dosa layered with fragrant spiced potato masala filling | |
| 3 | Filter coffee | ಡಿಗ್ರಿ ಫಿಲ್ಟರ್ ಕಾಫಿ | Beverage | 70 | 0 | `signature, must-try` | Gravity drip brewed • 15% chicory | Dark-roast Arabica-Robusta with chicory, frothed in traditional brass davarah & tumbler | |

*(Add all dishes in this format or provide as JSON array)*

---

## 10. Required Graphic Assets Checklist

- [ ] **Logo Vector**: Square/Circle SVG (`/kolam.svg` or `/brand-logo.svg`)
- [ ] **Watermark Artwork**: High-res light/dark SVGs (`/kolam-cream.svg`, `/kolam-kara.svg`)
- [ ] **Touch Icon / Favicon**: 512x512 PNG/JPG (`/benne.jpg` or `/app-icon.png`)
- [ ] **3 Signature Dish Photos**: Minimum 900x900px JPG and WebP files in `public/images/`
- [ ] **OpenGraph Social Preview Image**: 1200x630px JPG (`/images/og-image.jpg`)
