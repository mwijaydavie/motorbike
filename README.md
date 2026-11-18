# Altraware Motors

Bilingual motorcycle and spare-parts catalogue for **Pikipiki Altraware**, based in Kigamboni, Dar es Salaam. Gilera’s category-led browsing and Zero Motorcycles’ interactive bike presentation informed the design; no assets from either site are used.

## Run it

Node.js 22.12+:

```sh
npm ci
npm run dev
npm run build   # Type-checks and writes a static site to dist/
```

No API keys or back end are required. Bike details use shareable `#bike-…` links. The inquiry form prepares a message locally: the visitor copies it and sends it through the official Instagram DM link. The site itself does not send or store inquiries.

## Motion and reference demos

Use the **← / →** controls beside **01 / 02** in the hero to try *Gravel Shift*. GSAP advances an original GLSL dust transition on a WebGL canvas; the still photographs remain the source of truth. There is no autoplay. The effect is loaded on control interaction; a browser without WebGL gets a CSS fade, and reduced-motion users get a straight picture change. This is a photo effect, not a 3D motorcycle model.

See the [motion reference kit](docs/motion-reference-kit.md) for GitHub/GitLab source, demos, license notes, and an AI-agent implementation brief.

## Preview or deploy

- After `npm run build`, run `npm run preview` to check the same static files locally. Any static host can serve `dist/`.
- For Vercel, use a project dedicated to `mwijaydavie/motorbike`. [`vercel.json`](vercel.json) sets the Vite preset, `npm ci`, `npm run build`, and `dist/`. Keep the root directory at the repository root; no catch-all rewrite or environment variables are needed.
- For an **existing, initialized** Vercel project connected to this repo, push only the approved work branch to get a [Preview deployment](https://vercel.com/docs/deployments/environments#preview-environment-pre-production). Check the generated URL and protection settings before sharing. Do not merge, promote, or add a production domain for a preview.
- For a **new** project, confirm the project and first-deployment scope before importing or publishing. [Vercel treats the first deployment as Production](https://vercel.com/docs/deployments/environments#first-deployment); use a separate review project if an isolated first share is approved. Unpushed Arena edits are not available to a Vercel Git build.

## Maintain the catalogue

Edit `src/content.ts` for motorcycles, spare-parts categories, source links, and English/Kiswahili copy. Keep new photos in `public/media/` and update the image path for each listing. The feature viewer shows a supplier photo with selectable annotations, not a 3D model or a 360° spin.

| Content | Source / treatment |
| --- | --- |
| Kigamboni location and motorcycles + parts | [Pikipiki Altraware announcement](https://www.instagram.com/p/DfCUkxlu2lc/) and [official profile](https://www.instagram.com/pikipikialtraware/) |
| FH 125 Xpress | [Altraware reel](https://www.instagram.com/p/DfCX47dOOvZ/); local card uses a labeled reference photo from a [different Fenghao 125 cc supplier listing](https://fenghaomotor.en.made-in-china.com/product/UQHplPRbJDkN/China-Fenghao-125cc-Adult-Motorbikes-Scooters-Gasoline-Gas-Fuel-Systems-125cc-Motorcycle.html) |
| FH-200-10 | [Altraware post](https://www.instagram.com/p/Dfh0q--jtRo/); local card uses a labeled reference photo of the FH200-19 |
| FH150-7 and FH200-19 | [Fenghao FH150-7](https://gzfenghaomotor.com/products-_17/1154.html) (manufacturer preview, not a stock claim), [Fenghao FH200-19](https://fenghaomotor.en.made-in-china.com/product/MtbYOnxlhSkV/China-Fenghao-200cc-off-Road-Motorcycle-with-Powerful-LED-Headlights.html) (photo for the detail viewer and reference for hero artwork) |
| 180 cc listing and Wanhoo 250 | [180 cc reel](https://www.instagram.com/p/Dfy1LA3OdPL/) and [Wanhoo post](https://www.instagram.com/p/Dfy2oVpDoyP/). TSh 2,800,000 is the price in the original 180 cc reel, not a current quote. |
| Brand mark | [Altraware Technology](https://altra.tanzaniareach.com/) logo from the [public Altraware site repository](https://github.com/mwijay12/altraware-tech/blob/main/public/assets/altraware/logo.png), adapted to the Motors palette |
| Campaign hero, workshop and road story | Editorial artwork generated for this site. The short local motion film is made from that artwork; it also links to Altraware’s real Xpress reel. |

Before publishing, confirm current inventory and prices, replace representative shots with photos of the exact bikes where possible, and confirm permission to use the manufacturer photos. The map currently points to Kigamboni generally, not a verified shop pin. Add a shop pin or WhatsApp contact only after the business confirms it.
