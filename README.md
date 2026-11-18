# Altraware Motors

Bilingual motorcycle and spare-parts catalogue for **Pikipiki Altraware**, based in Kigamboni, Dar es Salaam. Gilera’s category-led browsing and Zero Motorcycles’ interactive bike presentation informed the design; no assets from either site are used.

## Run it

Node.js 22.12+:

```sh
npm ci
npm run dev     # Vite development server
npm test        # Type-check, build, and verify the generated HTML and links
npm run preview # Serve the production build from dist/
```

No API keys or back end are required. The build pre-renders a separate HTML document for each page and a custom 404. Direct links, refresh and browser Back work without a client-side router. Navigation and model details are available in the default English HTML before React loads; JavaScript enables Kiswahili, filters, the parts picker and the message composer.

| URL | Purpose |
| --- | --- |
| `/` | Campaign and shortcuts by riding style |
| `/motorcycles` | Five-model catalogue, with shareable `?use=adventure` and `?q=Xpress` filters |
| `/motorcycles/:model` | Model details, source listing and links to ask about the bike or its parts |
| `/parts` | Parts finder, optional `?bike=fh-200-10` preselection, and the Garage photo inspector |
| `/story` | About the business and the short campaign film |
| `/contact` | Inquiry composer; supports `?topic=parts&bike=fh-200-10&part=drive` |

Old links such as `/#story`, `/#garage` and `/#bike-fh-200-10` are redirected in the browser to their new destinations. The inquiry composer prepares a message locally: the visitor copies it and sends it through the official Instagram DM link. The site itself does not send or store inquiries.

## Motion and reference demos

The hero headline, image and light sweep animate on arrival, without touching the arrows. Sections reveal as they enter view. Supporting browsers also use native cross-document View Transitions for a diagonal wipe on same-origin navigation; other browsers keep normal links and the destination-page entrance. `prefers-reduced-motion` disables the entrances and wipes.

The optional **← / →** controls beside **01 / 02** play *Gravel Shift*. GSAP drives an original GLSL dust wipe on a WebGL canvas, loaded only when someone interacts with the controls. There is no autoplay between images. Without WebGL there’s a CSS fade; with reduced motion, a straight image change. This is a photo effect, not a 3D motorcycle model.

See the [motion reference kit](docs/motion-reference-kit.md) for GitHub/GitLab source, demos, license notes, and an AI-agent implementation brief.

## Preview or deploy

- After `npm run build`, run `npm run preview` to check the production files locally. On a static host, enable extensionless `.html` URLs and set `404.html` as the error document. Do not add a catch-all rewrite to `index.html`.
- The existing public site is [motorbike-omega.vercel.app](https://motorbike-omega.vercel.app/). [`vercel.json`](vercel.json) sets the Vite preset, `npm ci`, `npm run build`, `dist/`, and `cleanUrls`. Keep the Vercel root directory at the repository root. No environment variables are required; `SITE_URL` can override the public origin used for social images if the domain changes.
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
