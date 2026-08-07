# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Kabar, please report it responsibly:

1. **Do NOT open a public GitHub issue.**
2. Use [GitHub's private vulnerability reporting](https://github.com/akylbek04/kabar/security/advisories/new) or email the maintainer directly.
3. Include: description of the vulnerability, steps to reproduce, and potential impact.

We will acknowledge receipt within 48 hours and provide a fix timeline within 7 days.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | ✅        |

## Security Best Practices

- Never commit `.env` files — use `.env.example` as a template.
- `JWT_SECRET` must be explicitly set; the app will not start without it.
- SVG uploads are blocked to prevent stored XSS.
- Auth endpoints are rate-limited (20 requests per 15 minutes).
