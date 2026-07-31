"""UI-1-A · Demo identity seeder — Owner viewable-build addendum (2026-07-31).

Owner directive verbatim:
    "seed demo identities per class where missing: master_admin, dpo,
     operator, analyst — record credentials in /app/memory/test_credentials.md"

The seeder is IDEMPOTENT: it inserts each demo user only if the email
is not already present. Passwords are the demo-marked defaults declared
here (also recorded in `test_credentials.md`). All demo emails end in
`@demo.rms.example.com` so they can be visually distinguished from
real operator accounts.

Roles map to Canon §5 six-role register (admin & external_engineer are
system-adjacent, not user-facing modules):
    master_admin  → the constitutional edge
    dpo           → the auditor's edge
    operator      → the questioner (default Use Data caller)
    analyst       → the ask_console_user role (question-only)
"""
from __future__ import annotations

from typing import List

from services.auth.identity import KeyGrant
from services.auth.user_store import create_user, get_by_email


DEMO_IDENTITIES: List[dict] = [
    {
        "email": "demo.master_admin@demo.rms.example.com",
        "password": "demo-master-admin-pw",
        "name": "Demo · Master Admin",
        "roles": ["master_admin", "admin", "operator", "dpo", "engineer"],
    },
    {
        "email": "demo.dpo@demo.rms.example.com",
        "password": "demo-dpo-pw",
        "name": "Demo · DPO",
        "roles": ["dpo", "operator"],
    },
    {
        "email": "demo.operator@demo.rms.example.com",
        "password": "demo-operator-pw",
        "name": "Demo · Operator",
        "roles": ["operator", "ask_console_user"],
    },
    {
        "email": "demo.analyst@demo.rms.example.com",
        "password": "demo-analyst-pw",
        "name": "Demo · Analyst",
        "roles": ["ask_console_user"],
    },
]


async def seed_demo_identities_if_absent() -> None:
    """Idempotently create the four Owner-mandated demo identities."""
    for spec in DEMO_IDENTITIES:
        existing = await get_by_email(spec["email"])
        if existing is not None:
            continue
        await create_user(
            email=spec["email"],
            password_plaintext=spec["password"],
            name=spec["name"],
            roles=spec["roles"],
            key_grants=[],
        )
