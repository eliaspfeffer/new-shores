# Whip embedding

Import this public URL as a website link (do not upload private source or saves):

https://settler.eliaspfeffer.de/?embed=whip

Only this explicit game entry point allows `https://whip.run` as a frame ancestor.
Other origins, ordinary game links and API responses remain non-frameable.
No wildcard, CORS exception, CSRF exception or third-party session cookie is added.

The HTTPS public hostname must be used, not the private Tailscale hostname.
If Whip changes its frame hostname, verify it before extending the allowlist.

Browser third-party storage restrictions can keep embedded local saves separate
from the normal game. Account cookies intentionally remain SameSite=Strict;
use the normal game in a browser tab for account login and cloud synchronization.
Embedded play must not be represented as sharing the normal browser session.

Validation: build first, then `node tests/server/whip-embedding.mjs`. Also test a Whip
iframe in a real browser, including starting a game, and a disallowed ancestor.
