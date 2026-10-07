# Security policy

Report vulnerabilities privately through GitHub: open the **Security** tab of
https://github.com/daniilganiev/telegram-dev and choose **Report a vulnerability**. Please don't
open a public issue for security problems.

You'll get a reply within 7 days. Confirmed issues are fixed in a new version and noted in
CHANGELOG.md.

In scope: the hook scripts in `scripts/`, and any skill, command or agent that could lead Claude
to leak a secret, send a transaction or run code the user didn't ask for.
