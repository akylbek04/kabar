# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real-time one-on-one and group chat with Socket.io
- Supergroup chat type with topic-based message threading
- WebRTC voice and video calls (peer-to-peer signaling)
- File and image uploads via Multer
- JWT authentication with HTTP-only cookies
- Online presence tracking and broadcasting
- User profile management with avatar uploads
- CI pipeline with typecheck, lint, build, and test stages
- Contributor Covenant Code of Conduct
- Contributing guide, security policy, and issue/PR templates
- Dependabot for automated dependency updates

### Security
- Helmet middleware for HTTP security headers
- Rate limiting on auth endpoints (20 req/15min)
- SVG upload blocking to prevent stored XSS
- Password minimum 8 characters enforced server-side
