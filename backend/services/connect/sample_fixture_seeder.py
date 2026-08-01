"""Connect sample fixture seeder · Canon §4.1 (Owner UI-1-C dispatch 2026-08-02).

Owner directive verbatim:
    "1a — 4 sample sources per identity, one per state (connected /
     in progress / awaiting credentials / failed), SAMPLE-badged, so the
     full state grammar is exercisable. The failed-state sample must
     carry an honest plain-language failure reason (never a bare
     'failed')."

Also seeds two declared Class-D registries so the setup declaration
surface renders live rows against the /govern/registries seam.

Idempotent per identity.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from core import db
from services.connect import sources_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


async def seed_connect_sample_fixtures_if_absent(operator_email_and_id: List[dict]) -> None:
    """Seed 4 sample sources per identity + 2 declared registries · idempotent."""
    for op in operator_email_and_id:
        uid = op["user_id"]
        suffix = uid[-12:]
        # Fixture rows (source_id · state · protocol · cadence · rights · pii)
        fixtures = [
            {
                "source_id": f"src-sample-conn-{suffix}",
                "name": "Q1 partner licensing feed (SAMPLE)",
                "protocol": "postgres",
                "cadence": "daily_09",
                "state": sources_store.STATE_CONNECTED,
                "rights_declared": "internal_plus_partner",
                "pii_posture": "pseudonymize",
                "last_sync_iso": _now_iso(),
                "added_by": op["email"],
                "signed_off_by": op["email"],
                "signed_off_at_iso": _now_iso(),
                "credentials_holder": "instance vault · secure_string",
                "fields_confirmed": 6,
                "fields_total": 8,
                "fields_need_attention": [
                    {
                        "field_id": "customer_email_addr",
                        "question_plain": "Should this column be pseudonymized or redacted before use?",
                        "resolution_control": "posture_selector",
                        "options": ["pseudonymize", "redact"],
                    },
                    {
                        "field_id": "order_total_gbp",
                        "question_plain": "Which currency unit does this field carry — GBP or the derived USD?",
                        "resolution_control": "unit_selector",
                        "options": ["GBP", "USD_derived"],
                    },
                ],
                "is_sample": True,
            },
            {
                "source_id": f"src-sample-inprog-{suffix}",
                "name": "Retention corpus (SAMPLE)",
                "protocol": "s3",
                "cadence": "hourly",
                "state": sources_store.STATE_IN_PROGRESS,
                "rights_declared": "internal_only",
                "pii_posture": "filter",
                "last_sync_iso": _now_iso(),
                "added_by": op["email"],
                "credentials_holder": "instance vault · secure_string",
                "fields_confirmed": 4,
                "fields_total": 12,
                "fields_need_attention": [
                    {
                        "field_id": "session_end_time",
                        "question_plain": "Is this timestamp UTC or the source-local wall clock?",
                        "resolution_control": "text",
                    },
                ],
                "in_progress_note": "12,438 of 41,890 rows ingested · retry-on-timeout enabled",
                "is_sample": True,
            },
            {
                "source_id": f"src-sample-await-{suffix}",
                "name": "Broker export SFTP (SAMPLE)",
                "protocol": "sftp",
                "cadence": "weekly_mon",
                "state": sources_store.STATE_AWAITING_CREDENTIALS,
                "rights_declared": "internal_plus_partner",
                "pii_posture": "pseudonymize",
                "added_by": op["email"],
                "credentials_holder": "instance vault · pending master_admin issue",
                "fields_confirmed": 0,
                "fields_total": 0,
                "fields_need_attention": [],
                "awaiting_note": "Awaiting the master_admin to issue SFTP host credentials.",
                "is_sample": True,
            },
            {
                "source_id": f"src-sample-failed-{suffix}",
                "name": "Legacy article warehouse (SAMPLE)",
                "protocol": "http_json",
                "cadence": "daily_00",
                "state": sources_store.STATE_FAILED,
                "rights_declared": "internal_only",
                "pii_posture": "redact",
                "added_by": op["email"],
                "credentials_holder": "instance vault · valid",
                # Honest plain-language failure reason (Owner directive
                # verbatim: 'never a bare "failed"').
                "failure_reason_plain": (
                    "TLS handshake failed with the warehouse endpoint at 03:11 UTC. "
                    "The endpoint returned a self-signed certificate that no longer "
                    "matches our trust store. Ask the master_admin to install the "
                    "current warehouse certificate, then retry."
                ),
                "failure_first_seen_iso": _now_iso(),
                "failure_last_retry_iso": _now_iso(),
                "fields_confirmed": 8,
                "fields_total": 8,
                "fields_need_attention": [],
                "is_sample": True,
            },
        ]
        for f in fixtures:
            already = await sources_store.get_source(f["source_id"])
            if already is None:
                await sources_store.insert_source(f)

    # Declared Class-D registries at Connect setup · seed idempotently.
    # These declare the registry NAME + schema class. The actual contents
    # are versioned via /govern/registries (Canon §7.4). The Connect home
    # chip links into the Govern registry surface.
    coll_dr = db.get_collection(sources_store.DECLARED_REGISTRIES_COLLECTION)
    for r in (
        {
            "registry_name": "sanctioned_partners",
            "schema_class": "pseudonymize",
            "note": "SAMPLE · partner rebate governance",
            "is_sample": True,
        },
        {
            "registry_name": "restricted_terms",
            "schema_class": "filter",
            "note": "SAMPLE · language moderation floor",
            "is_sample": True,
        },
    ):
        exists = await coll_dr.find_one({"registry_name": r["registry_name"]})
        if exists is None:
            r["declared_at_iso"] = _now_iso()
            await coll_dr.insert_one(r)
