# Security Policy

## Reporting

Do not open a public GitHub issue for a security report. Two channels, in order of preference:

1. **GitHub private vulnerability reporting**, from this repository's Security tab.
2. **Email `security@simtabi.com`**, if you would rather not use GitHub.

Acknowledgement within 48 hours.

## Scope for this package

`@ichava/js-ui-kernel` ships plain TypeScript with no runtime dependencies. The surface worth
reporting is any function that turns untrusted input (a server-supplied translation, a colour
value, a catalog payload) into markup, a CSS value or a storage key without validating it, and
the drift-check script, which fetches files over the network in CI.
