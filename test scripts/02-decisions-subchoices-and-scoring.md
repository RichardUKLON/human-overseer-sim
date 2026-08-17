# 02 — Decisions, sub-choices, and scoring

You are testing decision logic and scoring in **The Human Overseer** eLearning course.

## Goal

Confirm that every Approve, Revise, and Reject route accepts a reasoning sub-choice, scores it correctly, and gives feedback that matches the learner's actions.

## Coverage

The course contains 12 scenarios. Each has 3 main decisions and 3 reasoning sub-choices per decision: 108 decision-and-reasoning combinations. Do not attempt every possible flag combination. Use the flag sets below.

## Required flag sets

- No segments flagged.
- Only planted flawed segments flagged.
- One clean segment flagged in error.
- All segments flagged.

For clean scenarios, use no flags, one false flag, and all segments flagged.

## Test procedure

1. For each scenario, choose Approve, Revise, and Reject in separate fresh attempts.
2. For each decision, select all three reasoning sub-choices in separate fresh attempts.
3. For each route, record whether commit becomes available only after both a decision and sub-choice are selected.
4. Confirm detection, decision, and justification scores match the review made.
5. Confirm the feedback identifies the selected reasoning and does not describe a different choice.
6. Confirm adjacent decisions receive partial credit only where authored.
7. Confirm false flags reduce the detection result and clean scenarios never report invented flaws.
8. Test S01 as an unscored warm-up. Confirm it does not affect the final profile or SCORM score.

## Report format

Create one row per tested route: scenario, flags used, decision, sub-choice position, expected score, observed score, feedback summary, pass/fail, and evidence. Separate scoring defects from wording defects.
