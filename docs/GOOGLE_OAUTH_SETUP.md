# Google OAuth — Hangar One + Demo

The login UI in the auth branch now calls Supabase Auth with provider `google`. Google sign-in will not work until OAuth credentials and redirect URLs are configured for **each backend project**.

## 1. Create a Google OAuth Web Client

In Google Cloud Console, create an OAuth client with application type **Web application**.

Add these Authorized JavaScript origins:

- `https://hangar-one-console.lovable.app`
- `https://hangar-one-demo-laboratorio.lovable.app`

Add these Authorized redirect URIs:

- `https://jtbnibpomxqhfnjgpwqi.supabase.co/auth/v1/callback` (Hangar One Console backend)
- `https://eqjzxhsucjijgkpawihn.supabase.co/auth/v1/callback` (H1 Demo backend)

Save the client ID and client secret. Do not commit them into source code.

## 2. Add GitHub Actions secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add:

- `SUPABASE_ACCESS_TOKEN`: a Supabase access token with permission to update Auth configuration for both projects.
- `GOOGLE_OAUTH_CLIENT_ID`: the OAuth client ID from Google.
- `GOOGLE_OAUTH_CLIENT_SECRET`: the OAuth client secret from Google.

Never place these values in this file, application code, or a commit.

## 3. Configure both Auth providers

Open **Actions → Configure Google OAuth — Hangar One + Demo → Run workflow**. The workflow attempts to enable the Google provider on both project refs using the secrets above. If the management API rejects a project, configure that project's Google provider from the authorized dashboard and do not paste secrets into chat.

For password recovery, each project's Auth URL configuration must also allow its own published URL and any preview URLs that should be supported. The recovery flow redirects to `/?recovery=true`.

## Important

The UI change is currently in branch `h1-demo-password-recovery` and its draft PR. The Lovable-hosted Main and Demo projects are not confirmed as GitHub-linked deployments, so merging this PR alone does not guarantee that either published site receives the code. Deploy/sync the code to each project after review.
