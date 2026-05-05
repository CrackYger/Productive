# Supabase Setup

1. Create a Supabase project and copy the project URL plus anon key into `.env`.
2. Run the SQL migration in `supabase/migrations/20260505090000_productive_core.sql`.
3. In Supabase Dashboard, open Authentication -> Email Templates -> Magic Link.
4. Replace the magic-link body with an OTP body that includes `{{ .Token }}`.

Example email body:

```html
<h2>Productive Login-Code</h2>
<p>Dein 6-stelliger Code lautet: {{ .Token }}</p>
```

The app calls `signInWithOtp` and then `verifyOtp` with type `email`, so users can register and log in by entering the 6-digit email code inside the app.
