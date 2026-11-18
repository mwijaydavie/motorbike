# Altraware operations workspace

## Kuanza na demo

Fungua **`/admin`**. Kitufe cha **EN / SW** hubadilisha lugha ya dashibodi na tovuti kwenye kivinjari hicho.

1. **Muhtasari** unaonyesha modeli zilizoorodheshwa, zilizopo, maulizo yanayoendelea, na bei ambazo zimetumwa lakini bado zinahitaji ufuatiliaji. Chati inahesabu maulizo yaliyorekodiwa, si watu waliotembelea tovuti.
2. **Stock → Hariri.** Sasisha idadi, upatikanaji na bei ya tovuti kwa TSh. Idadi ni ya ndani. Acha bei wazi kama bei itatolewa kwa kuuliza. Hakikisha una uhakika wa bei na stock kabla ya kuhifadhi kwenye tovuti halisi.
3. **Maulizo → Ulizo jipya.** Rekodi DM, simu au ulizo la dukani. Badili hatua kuwa **Fuatilia**, **Bei imetumwa**, **Limekamilika** au **Limefungwa**. Hakuna ujumbe unaotumwa moja kwa moja.
4. Kwa demo, tumia taarifa za mfano tu. **Rudisha mfano** hufuta mabadiliko kwenye kivinjari hiki bila kugusa tovuti halisi.

```sh
npm ci
npm run dev                      # development, with sample data
# Or, to review the built demo:
npm run build:demo               # .vite/demo, not dist/
npm run preview:demo -- --port 5173 --strictPort
```

Open `http://localhost:5173/admin` locally. The demo stores sample records and any edits on that browser and origin only. Open the demo’s own storefront to verify a price change or a hidden model. Do not copy the demo directory into a live deployment. The production build has no demo switch or sample records.

## Enable private access on Vercel

A normal `npm run build` still produces the static storefront and a sign-in shell at `/admin`. `npm run preview` serves those files only; without Vercel Functions it should show **Setup required**, not sample data. The storefront does not require a backend. Real staff edits use the two server functions in `api/` and require configured storage and access.

1. In the correct Vercel project, keep the repository root as the Root Directory and `npm run build` as the build command. Use HTTPS. Test with an isolated **Preview** environment and a disposable Redis database first. Do not use a production database in a shared branch preview.
2. Provision an Upstash Redis database (or a compatible HTTPS REST endpoint that accepts JSON command arrays and `EVAL`). Use a private database and the **read/write REST token**, not the read-only token.
3. On a trusted local terminal, run `npm run ops:credentials`. Save its random password in a password manager and share it only with authorized staff via a secure channel. Copy only the generated hash to `OPS_PASSWORD_HASH`. Do not add any of these values to the repo, client code, `VITE_` variables, or chat.
4. Set these server-side environment variables for the intended Vercel environment and redeploy that environment:

   | Variable | Value |
   | --- | --- |
   | `OPS_REDIS_REST_URL` | HTTPS Redis REST endpoint |
   | `OPS_REDIS_REST_TOKEN` | Redis read/write REST token |
   | `OPS_PASSWORD_HASH` | Full `scrypt$…$…` hash printed by the helper, not the password |

   Workspace keys are namespaced using `VERCEL_TARGET_ENV`/`VERCEL_ENV` when available, but separate databases and passwords are recommended for Preview and Production. The database is empty until the first save. Setup does not import any demo data.
5. In that deployment, visit `/admin` in a new tab. Confirm it requires sign-in, test a **non-sensitive** inquiry and a temporary stock change, and verify both after refreshing. Ensure `/api/operations` returns `401` while signed out and `/api/catalogue` returns only listing fields. Undo the test stock edit and remove the test inquiry. Check sign-out before sharing access.

## What is published

- Only the existing motorcycle models are managed here. Stock counts, customer references, contact details, internal notes and recent changes stay private. The storefront reads only a separate snapshot of the listing flag, published price, and availability; it does not read the private workspace. **In stock** requires a private count of at least one; **Out of stock** cannot have a positive count.
- A blank price does not publish a price. The 180 cc post’s TSh 2,800,000 stays labelled as the original post price, not today’s quote. Photo and fitment caveats are unchanged in intent.
- **Hide from catalogue** removes the model from the home lineup, browse results and related models after the site loads the update. Old direct links stay available for reference and parts support, with a not-listed notice and no current offer. When JavaScript is disabled or the catalogue API is unavailable, visitors get the original static catalogue with no live stock/price claims. Do not use the checkbox to take down content that must be removed from the static site.
- Saves are revision-checked. If another tab or staff member has saved first, close the editor, refresh the workspace and reopen the record before applying your edits.

## Operating boundaries

- A shared staff password provides one access level. There are no separate staff accounts, roles, automatic reminders, sales payments, or audit attribution to individual staff. Sessions expire after eight hours; **Sign out** revokes the current session. Rotating the password hash and redeploying invalidates older sessions for the new deployment. Restrict access to preview and previous deployment URLs separately.
- Record only the minimum customer details needed to follow up. The workspace holds up to 300 inquiries and the 50 latest change events. Remove records you no longer need and configure backup/retention in the Redis provider. A removal deletes the record from the workspace, not from any backups your provider has retained.
- Instagram, the public message composer and the admin inquiry register are not connected. No messages are imported or sent automatically. Parts inquiries can be tracked here, but spare-parts SKU inventory and catalogue content editing are not included.

`npm test` checks the built pages, validation, sign-in/session rules, stale writes, the Redis REST adapter contract and public/private separation using a local fixture. It does not require or verify a configured cloud database.
