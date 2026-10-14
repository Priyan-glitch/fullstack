# Custom Caddy build for the Stable Roomies API gateway.
#
# The stock caddy:2 image cannot validate JWTs, so the ggicci/caddy-jwt module is
# compiled in with xcaddy. Caddy's official builder image ships xcaddy already.
#
# Versions are pinned rather than using the floating `2` tag because caddy-jwt
# v1.1.1 requires Caddy >= 2.10.1 and Go >= 1.25 — an older tag would fail to
# build with an opaque error.
FROM caddy:2.11.7-builder AS builder

RUN xcaddy build \
    --with github.com/ggicci/caddy-jwt@v1.1.1

FROM caddy:2.11.7

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
