# Motion reference kit

Mifano yenye **source + demo**, kwa ajili ya kujifunza na kumpa AI agent reference inayoweza kusoma. Anza na demo, chagua interaction moja, kisha soma faili zinazoiendesha. Usianze kwa ku-clone mwonekano wa site nzima.

## 01 / Website na product experience

| Mfano | Source · demo | Cha kuangalia |
| --- | --- | --- |
| **Pixel Image Gallery** · Astro + Barba.js + GSAP + Three.js/GLSL | [GitHub](https://github.com/J0SUKE/gsap-threejs-codrops) · [Vercel demo](https://gsap-threejs-codrops.vercel.app/) · [tutorial](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) | Scroll hadi picha ijitokeze, kisha ifungue. Linganisha `src/app/main.ts`, `src/app/components/canvas.ts` na `src/app/shaders/`. Huu ndio mfano wa kuanzia ukiwa na listing na detail **page** tofauti. README inataja MIT lakini faili ya `LICENSE` haikupatikana; tumia kama reference hadi masharti ya matumizi ya code yathibitishwe. |
| **ProfitOn** · Next.js + React Three Fiber + GLSL + GSAP | [GitLab](https://gitlab.com/VGM-Union/profiton) · [Vercel demo](https://profiton.vercel.app/) | Mfano wa landing page nzima yenye shader kama background, huku menu, FAQ na content zikiwa HTML ya kawaida. Soma [architecture](https://gitlab.com/VGM-Union/profiton/-/blob/main/documentation/architecture.md) na `src/app/components/backgroundGradient/`. Ni frontend iliyorejeshwa kwa portfolio, si huduma hai ya malipo au akaunti. |
| **Show, don’t tell** · Vite/React + React Three Fiber | [GitHub](https://github.com/rkaushik29/r3f-demo) · [Vercel demo](https://r3f-demo-phi.vercel.app/) | Buruta kuona bidhaa kutoka pembe tofauti. `src/Scene.tsx` ni reference ya GLB moja, HDRI na studio lighting; `src/App.tsx` ina loading, DPR na reduced-motion behavior. Camera ya demo, si model ya pikipiki. |
| **Bruno Simon Folio 2025** · Three.js + GSAP + physics | [GitHub](https://github.com/brunosimon/folio-2025) · [live site](https://bruno-simon.com/) | Endesha gari na fuata ramani. Soma sehemu ya **Game loop** ya README: input → physics → camera/render. Nzuri kwa interactive world; usiige gharama ya game loop kwa catalogue ya kawaida. [Source ya toleo la 2019](https://github.com/brunosimon/folio-2019) ni reference nyingine, tofauti na live site ya sasa. |

## 02 / Effects za kuchukua kama wazo

| Mfano | Source · demo | Cha kuangalia |
| --- | --- | --- |
| **Animating WebGL Shaders with GSAP** · WebGL/GLSL + GSAP | [GitHub](https://github.com/biazo/codrops-animate-shaders-with-gsap) · [demo](https://tympanus.net/Tutorials/ShaderAnimationGSAP/) | Linganisha `src/js/demo1/Effect.js` na `base.frag`. Jifunze jinsi timeline inavyobadilisha parameter ya shader, ambayo ndiyo inachora ripple, reveal au blur. Hii ndiyo reference iliyo karibu zaidi na mpito wa picha wa Altraware. |
| **Seam Transitions** · GSAP/ScrollTrigger + canvas/WebGL | [GitHub](https://github.com/codrops/SeamTransitions) · [demo](https://tympanus.net/Demos/SeamTransitions/) | Scroll kutoka hero kwenda section inayofuata; jaribu mist au sediment. Anza `js/seams/`. Useful kwa mpaka wa hero na catalogue, si lazima kugeuza scrolling ya site nzima. Inaruhusu ku-serve source bila build step. |
| **GL Transitions** · GLSL collection | [GitHub](https://github.com/gl-transitions/gl-transitions) · [gallery](https://gl-transitions.com/gallery) | Angalia jinsi shader inavyochanganya picha mbili kwa `progress` ya 0–1. Hizi ni effects, si sites nzima. Leseni inaweza kutofautiana kwa shader; soma header ya faili. |
| **Interlude** · Astro ClientRouter + GSAP + Three.js | [GitHub](https://github.com/codrops/interlude) · [demo](https://interlude.crnacura.workers.dev/) | Chagua jina la transition. Soma `src/transitions/` kwa effect moja kwa wakati. Ni starter yenye router ya Astro, **si Barba**; nzuri kwa kulinganisha architecture. |
| **Letter Effects** · Anime.js | [GitHub](https://github.com/codrops/LetterEffects) · [demo](https://tympanus.net/Development/LetterEffects/) | Chagua namba au pita juu ya maneno kuona typography effects. `js/textfx.js` ni ya API ya zamani; kwa project mpya tumia [Anime.js v4 docs na mifano](https://animejs.com/documentation/) · [official source](https://github.com/juliangarnier/anime). |
| **A path in space** · tween.js + Lume | [Source ya mfano](https://github.com/tweenjs/tween.js/blob/main/examples/24_lume_curve.html) · [demo](https://tweenjs.github.io/tween.js/examples/24_lume_curve.html) | Buruta ili uone orbit. Tween hubadilisha namba kadri muda unavyopita; scene ina render loop yake. Tazama [mifano mingine ya tween.js](https://tweenjs.github.io/tween.js/#examples) kwa curves na easing. |

**Barba.js kwa hatua ndogo:** [official source](https://github.com/barbajs/barba) · [basic transition](https://barba.js.org/docs/getstarted/basic-transition/) inafafanua `leave` na `enter`. [Ihatetomatoes’ demo repo](https://github.com/Ihatetomatoes/barbajs-demos) ina starter ndogo ya Barba + GSAP; live preview yake ilirudisha 522 wakati wa ukaguzi, kwa hiyo anza na Pixel Image Gallery kama unataka demo online.

**Leseni:** Kuona source hadharani hakumaanishi unaweza kui-publish tena. Kagua `LICENSE` na masharti ya picha, fonts, footage, models na brand kila kimoja; hifadhi attribution inayotakiwa. [GSAP ina Standard License yake](https://gsap.com/standard-license/), si MIT. Inaruhusu matumizi yake kwenye tovuti za biashara, lakini ina masharti kwa baadhi ya visual animation builders. Hatujanakili shader/source au media kutoka kwenye demo hizi kwenda Altraware.

## 03 / Tumejaribu nini kwa Altraware?

Fungua Home bila kubonyeza kitu: headline inapanda, picha inatulia taratibu, na mwanga unapita kwenye hero. Kisha fungua Motorcycles au Spare Parts kupitia menu; browser inayotumia cross-document View Transitions itaonyesha mpito wa diagonal. Zingine zinafungua ukurasa kwa kawaida, bila kubadili URL au Back behavior.

- [`src/motion/motion.css`](../src/motion/motion.css) na [`use-scroll-motion.ts`](../src/motion/use-scroll-motion.ts): hero na chapter entrances, mpito wa kurasa, na `IntersectionObserver` kwa sections zinazokuja unaposogeza ukurasa. Motion hii haihitaji WebGL na inazimwa kwa reduced motion.
- Hero bado ina **→ / ←** karibu na **01 / 02** kwa *Gravel Shift*, mpito wa vumbi kati ya picha mbili. [`gravel.ts`](../src/motion/gravel.ts) ina shader, crop, textures na tween. Canvas ina kikomo cha pixels; haichori frames wakati hakuna transition.
- [`use-scene-shift.ts`](../src/motion/use-scene-shift.ts): lazy import, decode, cancel na fallback. Bila WebGL kuna CSS fade; reduced motion hubadilisha picha moja kwa moja. Hii si model ya 3D.
- Kurasa zinatengenezwa mapema kama HTML tofauti, zikiunganishwa kwa `<a>` za kawaida. React inasimamia interactions za kila ukurasa. Hakuna haja ya kuongeza Barba, Anime.js, tween.js au Three.js kwa motion iliyopo.
- Hatua ya 3D inayofuata: pata **GLB/glTF iliyoidhinishwa ya model sahihi**, kisha weka viewer inayofunguka mteja akichagua kuiona. Bila asset halisi, picha zenye maelezo au photo spin ya frame halisi ni bora kuliko model ya kubuniwa.

### Brief ya kumpa agent

> Study the live demo and inspect the linked effect files. Recreate the technique, not the reference site’s branding, code of unclear license, or artwork. Enhance one interaction in the current site. Keep content in HTML, defer motion until needed, cap canvas resolution, and release the render loop and textures after playback. Provide a non-WebGL path and respect reduced motion. Show the effect in the production build at desktop and touch sizes; verify focus, back/deep links, and the original enquiry flow before sharing a preview.
