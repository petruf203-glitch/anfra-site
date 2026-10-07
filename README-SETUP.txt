ANFRA FINAL WALLET VERSION

1. Supabase reset (before launch):
   Run reset_test.sql in Supabase SQL Editor.
   It deletes the current test Founding 1000 entries and returns the counter to 0 / 1000.

2. GitHub Pages:
   Replace these files in the repository:
   - index.html
   - style.css
   - script.js
   - admin.html

   Do NOT replace the Supabase database using supabase_schema.sql if it is already working.

3. Wallet selector:
   The site now shows important Solana wallets and also auto-detects compatible Wallet Standard wallets.

4. Eligibility:
   The browser checks for at least 10,000 ANFRA before calling the Founding 1000 RPC.

5. Important security note:
   The current browser-side balance check is suitable for testing, but before a serious public launch the same 10,000 ANFRA rule should also be enforced server-side (Supabase Edge Function) and wallet ownership should be signed/verified.


SECURE BALANCE CHECK
1. In Supabase Dashboard, create/deploy the Edge Function named check-and-claim using supabase/functions/check-and-claim/index.ts.
2. The function checks the ANFRA balance server-side, then calls claim_founding_member.
3. The included supabase/config.toml sets verify_jwt=false so the public site can call the function with the publishable key.
4. The database RPC should NOT be executable by anon/authenticated; the updated supabase_schema.sql revokes that permission.
5. After deploying the Edge Function, upload index.html, style.css, script.js and admin.html to GitHub.
