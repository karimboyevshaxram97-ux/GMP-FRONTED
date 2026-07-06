# Social Login Setup (Kakao · Naver · Google)

The GMP API handles the whole OAuth flow. The frontend only redirects the
browser to `{API}/auth/{provider}`; the API redirects back to
`{FRONTEND}/auth/callback` with tokens. You register **the API's callback
URL** (port 3007 in dev) at each provider — never the frontend URL.

All keys go into **`GPM-SERVER/.env.local`** (see the "Social Login" section
in `GPM-SERVER/.env.example`). A provider with an empty `*_CLIENT_ID` is
automatically disabled — its button shows an error instead of crashing.

Redirect URIs to whitelist at every provider:

| Environment | Redirect URI |
|---|---|
| Local dev | `http://localhost:3007/auth/{provider}/callback` |
| Production | `https://api.your-domain.com/auth/{provider}/callback` |

(`{provider}` = `kakao`, `naver`, or `google`. In production also set
`API_URL=https://api.your-domain.com` and `FRONTEND_URL=https://your-domain.com`
in `.env.local` so the callback and final redirect URLs are built correctly.)

---

## 1. Kakao — [developers.kakao.com](https://developers.kakao.com)

1. Log in and open **내 애플리케이션 (My Applications)** → **애플리케이션 추가하기 (Add an application)**. Enter the app name (GMP) and company name, then create.
2. Open the app → **앱 설정 > 요약 정보 (Summary)**: copy the **REST API 키** — this is your `KAKAO_CLIENT_ID`.
3. **앱 설정 > 플랫폼 (Platform)** → **Web 플랫폼 등록**: add site domains
   `http://localhost:3000` and your production frontend domain.
4. **제품 설정 > 카카오 로그인 (Kakao Login)**: toggle **활성화 (Activate)** ON.
5. Same page, **Redirect URI 등록**: add
   `http://localhost:3007/auth/kakao/callback` and the production API callback.
6. **제품 설정 > 카카오 로그인 > 동의항목 (Consent items)**: set **닉네임 (nickname)** and **프로필 사진 (profile image)** to "필수 동의 (required)", and **카카오계정(이메일) (email)** to "선택 동의 (optional)" — email requires business verification for "required".
7. (Optional but recommended) **제품 설정 > 카카오 로그인 > 보안 (Security)**: enable **Client Secret**, copy the generated code into `KAKAO_CLIENT_SECRET`, and set its state to "사용함 (enabled)". If you skip this, leave `KAKAO_CLIENT_SECRET` empty.

```env
KAKAO_CLIENT_ID=<REST API 키>
KAKAO_CLIENT_SECRET=<보안 탭의 Client Secret, optional>
```

## 2. Naver — [developers.naver.com](https://developers.naver.com)

1. Log in and go to **Application > 애플리케이션 등록 (Register application)**.
2. **애플리케이션 이름**: GMP. **사용 API**: select **네이버 로그인 (Naver Login)**.
3. In the permissions (제공 정보 선택) check **이메일 주소 (email)**, **이름 (name)**, **프로필 사진 (profile image)** — nickname optional.
4. **로그인 오픈 API 서비스 환경**: choose **PC 웹 (PC Web)**.
   - **서비스 URL**: `http://localhost:3000` (dev) / your production frontend URL.
   - **네이버 로그인 Callback URL**: `http://localhost:3007/auth/naver/callback` — add the production API callback here too (up to 5 allowed).
5. After saving, the app page shows **Client ID** and **Client Secret**.

```env
NAVER_CLIENT_ID=<Client ID>
NAVER_CLIENT_SECRET=<Client Secret>
```

Note: while the app is in "개발 중 (In development)" status only registered
test accounts can log in. Add testers under **멤버관리**, or apply for
**검수 요청 (review)** to open it to everyone.

## 3. Google — [console.cloud.google.com](https://console.cloud.google.com)

1. Create (or select) a project.
2. **APIs & Services > OAuth consent screen** (now "Google Auth Platform > Branding"):
   - User type: **External** → Create.
   - Fill app name (GMP), support email, developer email. Save.
   - Scopes: add `.../auth/userinfo.email` and `.../auth/userinfo.profile` (non-sensitive).
   - While "Testing", add your Google account under **Test users**. Publish the app when going to production.
3. **APIs & Services > Credentials** → **+ Create credentials > OAuth client ID**:
   - Application type: **Web application**, name: GMP Web.
   - **Authorized JavaScript origins**: `http://localhost:3000`, `http://localhost:3007`, and production frontend + API origins.
   - **Authorized redirect URIs**: `http://localhost:3007/auth/google/callback` and the production API callback.
4. Copy the **Client ID** and **Client secret** from the created credential.

```env
GOOGLE_CLIENT_ID=<Client ID, ends with .apps.googleusercontent.com>
GOOGLE_CLIENT_SECRET=<Client secret>
```

## 4. Final `.env.local` checklist (GPM-SERVER)

```env
# URLs (defaults shown; override in production)
API_URL=http://localhost:3007
FRONTEND_URL=http://localhost:3000
OAUTH_STATE_SECRET=<random 64-char hex; falls back to JWT_SECRET if empty>

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...   # only if enabled in Kakao console
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```

Restart the API after editing (`npm run start:dev` picks it up on restart).

## 5. Quick test

1. Start API (`GPM-SERVER`: `npm run start:dev`) and frontend (`GMP-FRONTED`: `npm run dev`).
2. Open `http://localhost:3000/account/join` → the three social buttons sit under the sign-in form.
3. Click one: you should land on the provider's consent page, and after consent be redirected through `/auth/callback` straight into the site, logged in (avatar in the header).
4. A provider without keys shows a localized "this login method is currently unavailable" error on the join page instead.
