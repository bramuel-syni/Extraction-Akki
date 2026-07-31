// UI Spec v2.2 §3.7 — Opportunity Briefs surface (fixture-census demo per AS-U2).
// Fixture data marked as illustration; the Registry read API is populated
// post-9.2b (owner-side per governance §11). Three worked examples land
// per Stage A §2.5: slice / combined / estate.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OpportunityBriefCard from './OpportunityBriefCard';

const ADVISORY_MARKER = 'Advisory: opportunity brief — not a governed response.';

// Fixture-census demo per AS-U2 sample rules. Anchors are byte-verbatim
// substrings of the Registry-read texts; grounding gate would attest at
// Registry-write time in production.
const FIXTURE_BRIEFS = [
  {
    brief_id: 'brief_fixture_slice_a',
    scope: 'slice',
    contributing_slices: ['dim_x:s1'],
    brief_text:
      'The measured slice contains 47 units at 12.5% estate share — a candidate for shape-as-objective.',
    quantitative_anchors: [
      { value: '47', registry_read_ref: 'reg-slice-a-count' },
      { value: '12.5%', registry_read_ref: 'reg-slice-a-share' },
    ],
    generated_at: '2026-07-10T00:00:00Z',
    census_ref: 'census-v1',
    stale: false,
    _advisory_marker: ADVISORY_MARKER,
  },
  {
    brief_id: 'brief_fixture_combined_ab',
    scope: 'combined',
    contributing_slices: ['dim_x:s1', 'dim_y:s3'],
    brief_text:
      'Combined slice-a and slice-b together contain 69 units — Registry-computable aggregate rendered verbatim.',
    quantitative_anchors: [
      { value: '69', registry_read_ref: 'reg-combined-a-b-count' },
    ],
    generated_at: '2026-07-10T00:00:00Z',
    census_ref: 'census-v1',
    stale: false,
    _advisory_marker: ADVISORY_MARKER,
  },
  {
    brief_id: 'brief_fixture_estate',
    scope: 'estate',
    contributing_slices: ['dim_x:s1', 'dim_x:s2', 'dim_y:s3'],
    brief_text:
      'Estate-wide census surfaces 118 measured units across three named dimensions.',
    quantitative_anchors: [
      { value: '118', registry_read_ref: 'reg-estate-count' },
    ],
    generated_at: '2026-07-08T00:00:00Z',
    census_ref: 'census-v0',
    stale: true,
    _advisory_marker: ADVISORY_MARKER,
  },
];

export default function OpportunityBriefsPage() {
  const navigate = useNavigate();
  const [briefs] = useState(FIXTURE_BRIEFS);

  const handleShapeAsObjective = (brief) => {
    // OB-R4: pre-fill reach ONLY; wizard mandatory fields untouched.
    // Reach payload matches shape_as_objective_prefill.build_prefill() shape.
    const reachPayload = {
      contributing_slices: brief.contributing_slices,
      brief_id: brief.brief_id,
    };
    try {
      sessionStorage.setItem(
        'opportunity_brief_reach_prefill',
        JSON.stringify(reachPayload),
      );
    } catch (_) {
      // sessionStorage unavailable in some test envs; navigation still occurs.
    }
    navigate('/use-data');
  };

  return (
    <div
      data-testid="opportunity-briefs-page"
      className="mx-auto max-w-4xl space-y-6 p-6"
    >
      <h1
        className="text-2xl font-semibold"
        data-testid="opportunity-briefs-page-title"
      >
        Opportunity Briefs
      </h1>
      <div
        data-testid="opportunity-briefs-fixture-notice"
        className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
      >
        Fixture-census demo per AS-U2. Registry-live briefs land post-9.2b.
      </div>
      <div className="space-y-4">
        {briefs.map((brief) => (
          <OpportunityBriefCard
            key={brief.brief_id}
            brief={brief}
            onShapeAsObjective={handleShapeAsObjective}
          />
        ))}
      </div>
    </div>
  );
}
