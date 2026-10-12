# Leaderboard setup: UST Google sign-in

One-time dashboard setup for the sign-in and leaderboards. The app code is
already in place. Until this is done, the app's Sign in button takes you to
a Google or Supabase error page, and nothing else changes.

Supabase project: `fqxrxsqxicjmixsrfcmo`, the same one as the live
"N reviewing now" count.

You need the address your app is served from. Below it's written as
`https://YOUR-SITE/`: your Vercel address, e.g. `https://your-project.vercel.app/`
or your custom domain. Include the trailing `/`.

---

## 0. Check UST lets students use outside apps (2 min)

Do this first. Some university Google accounts are blocked from signing in
to apps the school hasn't approved. Google then shows *"Access blocked: this
app is not approved by your organization's admin"*.

You can only find out by trying it, which happens in step 4. If UST blocks
it, the only fix is asking UST IT to allow the app's client ID. Nothing in
the app can get around that block.

## 1. Google Cloud: create the sign-in client (≈10 min)

1. Go to <https://console.cloud.google.com/> and sign in. A personal Gmail
   is fine for owning the project.
2. Create a new project, for example **Multi Quiz App**.
3. Open **Google Auth Platform**. Search "Google Auth Platform" in the top
   bar.
4. **Branding**: set the app name (*Multi Quiz App*), the support email and
   the developer contact email. Save.
5. **Audience**: choose **External**. ("Internal" would only work if the
   project were owned by UST's own Google organisation.)
6. **Data Access**: make sure the scopes are just `openid`,
   `.../auth/userinfo.email` and `.../auth/userinfo.profile`. Add `openid`
   if it's missing. Don't add anything else: these basic scopes need no
   review from Google.
7. **Clients** → **Create client** → type **Web application**:
   - **Authorized JavaScript origins**: add your site's origin only, with
     no path, e.g. `https://your-project.vercel.app`. Also add
     `http://localhost:5183` for local testing.
   - **Authorized redirect URIs**: add exactly
     `https://fqxrxsqxicjmixsrfcmo.supabase.co/auth/v1/callback`
   - Click **Create**, then copy the **Client ID** and **Client secret**.
8. Back in **Audience**, click **Publish app** so its status is **In
   production**. While it says "Testing", only test users you list by hand
   can sign in.

## 2. Supabase: turn on Google sign-in (≈3 min)

At <https://supabase.com/dashboard/project/fqxrxsqxicjmixsrfcmo>:

1. **Authentication → Sign In / Providers → Google**: enable it, paste the
   **Client ID** and **Client secret**, and save.
2. **Authentication → URL Configuration**:
   - **Site URL**: `https://YOUR-SITE/`
   - **Redirect URLs**: add `https://YOUR-SITE/` and
     `http://localhost:5183/`. If you also deploy to Vercel or Netlify, add
     those addresses too.

## 3. Supabase: create the tables and the UST-only rule (≈2 min)

1. **SQL Editor → New query**: paste the whole of
   [`leaderboard.sql`](leaderboard.sql) and click **Run**. It should say
   "Success. No rows returned". It's safe to run again later.
2. **Authentication → Hooks** (it may be under *Auth Hooks*) → **Add hook →
   Before User Created** → hook type **Postgres** → schema `public`,
   function **`hook_ust_only`** → enable it and save.

This hook is the main block: any non-UST account is refused at sign-in and
never created. The tables and functions also refuse non-UST users on their
own, as a backstop.

## 4. Try it

1. Open the app, tap **Sign in** (top right of Home), and pick your
   `@ust.edu.ph` account. You should come back signed in, with your Google
   photo where the button was.
2. Finish any single quiz. The results screen posts the attempt and shows
   **Live / Today / This week / All time** with you on it.
3. Sign out from the photo menu, then sign in with a personal Gmail. You
   should come back to the app with *"Couldn't sign in: Only UST accounts
   (@ust.edu.ph) can sign in."*
4. In Supabase → **Authentication → Users**, only UST addresses should be
   listed.

If step 1 lands on Google's "Access blocked … not approved by your
organization's admin", that's UST's block from step 0.

---

## How it behaves (for reference)

- **Posting**: when you're signed in, every finished single quiz is posted
  automatically. Multi quizzes are never posted.
- **Scoring**: the board always scores Multiple Select as "Right only" (a share
  per correct pick, wrong picks cost nothing), whatever your quiz options
  say. The big number on your result still follows your own settings.
- **Ranking**: Today, This week and All time show each person's best
  attempt, by % and then the faster time. Days and weeks run on Manila time,
  and weeks start on Monday.
- **Live**: every attempt on that quiz, newest first. It refreshes every 15
  seconds while it's open.
- **Live activity**: tapping "N reviewing now" on Home shows the latest
  attempts on every quiz, refreshing the same way.
- **Hiding**: the **Show me on leaderboards** switch in the photo menu hides
  you from everyone else's boards and from Live. You still see your own
  rank.
- **Limits**: the database rejects impossible scores, attempts quicker than
  half a second per question, and more than one post per quiz every 15
  seconds. Scores are calculated in the browser, so a determined person
  could still fake one. It's a friendly study board, not an exam.
