<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reputrail | Reputation operations</title>
    <style>
        :root {
            color-scheme: dark;
            --bg: #06151e;
            --bg-soft: #081e2b;
            --surface: #0e0e15;
            --surface-2: #14141f;
            --line: #29293d;
            --line-strong: #3d3d5c;
            --text: #f0f0f5;
            --muted: #a3a3c2;
            --faint: #8585ad;
            --accent: #17a9e8;
            --accent-2: #01c7fe;
            --accent-soft: rgba(23, 169, 232, .16);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            background: var(--bg);
            color: var(--text);
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            overflow-x: hidden;
        }
        main {
            display: grid;
            min-height: 100vh;
            min-width: 0;
            grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
            overflow-x: hidden;
        }
        .intro {
            display: flex;
            min-height: 100vh;
            min-width: 0;
            flex-direction: column;
            justify-content: space-between;
            padding: 44px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .mark {
            display: block;
            width: 46px;
            height: 46px;
            border-radius: 13px;
            box-shadow: 0 18px 50px rgba(0,0,0,.35);
        }
        .eyebrow {
            display: inline-flex;
            width: fit-content;
            margin-bottom: 20px;
            border: 1px solid var(--line-strong);
            border-radius: 6px;
            padding: 10px 14px;
            color: var(--accent);
            background: var(--accent-soft);
            font-weight: 800;
        }
        h1 {
            max-width: 980px;
            margin: 0;
            font-size: clamp(38px, 5.4vw, 72px);
            line-height: 1.06;
            letter-spacing: 0;
            overflow-wrap: anywhere;
        }
        h2 {
            margin: 0;
            font-size: 28px;
        }
        p {
            color: var(--muted);
            line-height: 1.7;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
        }
        .feature, .login, .identity, .note {
            border: 1px solid var(--line);
            border-radius: 8px;
        }
        .feature {
            min-height: 132px;
            padding: 18px;
            background: var(--surface);
            box-shadow: 0 18px 50px rgba(0,0,0,.25);
        }
        .feature strong {
            display: block;
            margin-bottom: 10px;
        }
        .login-wrap {
            display: flex;
            align-items: center;
            border-left: 1px solid var(--line);
            background: var(--surface);
            padding: 28px;
            min-width: 0;
        }
        .login {
            width: 100%;
            padding: 28px;
            background: var(--surface-2);
            box-shadow: 0 24px 80px rgba(0,0,0,.35);
        }
        .identity {
            display: flex;
            min-height: 96px;
            margin-top: 14px;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            padding: 0 18px;
            color: inherit;
            text-decoration: none;
            background: var(--surface);
            min-width: 0;
        }
        .identity:hover {
            border-color: var(--accent);
        }
        .role {
            border: 1px solid var(--line);
            border-radius: 6px;
            padding: 8px 12px;
            color: var(--accent);
            font-size: 12px;
            font-weight: 900;
        }
        .note {
            margin-top: 22px;
            padding: 16px;
            background: var(--accent-soft);
            color: var(--muted);
        }
        @media (max-width: 900px) {
            main { grid-template-columns: 1fr; }
            .intro { min-height: auto; padding: 28px 20px; gap: 46px; }
            .login-wrap { border-left: 0; border-top: 1px solid var(--line); padding: 20px; }
            .features { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <main>
        <section class="intro">
            <div class="brand">
                <img class="mark" src="/reputrail-mark.svg" alt="Reputrail logo">
                <div>
                    <strong>Reputrail</strong>
                    <p style="margin: 2px 0 0;">Every review. A clear route forward.</p>
                </div>
            </div>

            <div>
                <span class="eyebrow">Laravel API, OpenAI, automation pipelines</span>
                <h1>Customer recovery, designed as an operating system.</h1>
                <p style="max-width: 760px; margin-top: 28px; font-size: 19px;">
                    A Blade login surface for the Laravel side of the project. The product dashboard runs in the Next.js frontend.
                </p>
            </div>

            <div class="features">
                <div class="feature"><strong>Ingest</strong><p>Google, Facebook, and review-platform webhooks.</p></div>
                <div class="feature"><strong>Analyse</strong><p>LLM-backed sentiment, root cause, and urgency.</p></div>
                <div class="feature"><strong>Recover</strong><p>Automation paths for unhappy customers.</p></div>
            </div>
        </section>
        <section class="login-wrap">
            <div class="login">
                <p style="margin: 0 0 8px; color: var(--accent); font-weight: 800;">Secure demo access</p>
                <h2>Log in to Reputrail</h2>
                <p>Choose a seeded demo identity to enter the dashboard.</p>
                <a class="identity" href="http://localhost:3001">
                    <span><strong>Demo Operator</strong><br><span style="color: var(--muted);">operator@reputrail.local</span></span>
                    <span class="role">Ops Lead</span>
                </a>
                <a class="identity" href="http://localhost:3001">
                    <span><strong>Agency Admin</strong><br><span style="color: var(--muted);">admin@reputrail.local</span></span>
                    <span class="role">Admin</span>
                </a>
                <div class="note">
                    OpenAI is used when configured. Without keys, deterministic fallback analysis keeps the demo flow stable.
                </div>
            </div>
        </section>
    </main>
</body>
</html>
