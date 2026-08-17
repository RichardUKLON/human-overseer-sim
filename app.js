/* ================================================================
   THE HUMAN OVERSEER — application (v0.5 — see overseer-build-delta-v0.4.md, v0.5 addendum)
   Static, no build step, no live AI calls, no localStorage
   (persistence belongs to the SCORM/xAPI layer — handoff §4).
   Screens: start → map → [brief → desk → consequence → debrief] ×12
   → calibration profile.
   ================================================================ */

(function () {
  "use strict";

  var app = document.getElementById("app");

  var DECISIONS = [
    { id: "approve", label: "Approve", hint: "Send as-is" },
    { id: "revise", label: "Revise", hint: "Usable after correction" },
    { id: "reject", label: "Reject", hint: "Fundamentally unsound — restart or escalate" }
  ];

  /* Scoring structure fixed by handoff §3; values indicative, tunable */
  var WEIGHTS = { hit: 2, falseAlarm: 1, decisionFull: 3, decisionPartial: 1, justification: 2, justificationPenalty: 1 };

  var state = {
    screen: "landing",
    currentId: null,
    flagged: {},
    decision: null,
    justification: null,
    results: null,
    replayMode: false, /* replays never overwrite the first committed attempt */
    completed: {},  /* id -> { decision, results, toolsUsed } — in-memory only */
    drafts: {},     /* id -> unfinished review state, retained while this tab stays open */
    notes: {},      /* id -> notepad text — session only */
    toolsUsed: {},  /* current attempt: tool id -> true (desk tools rail) */
    seenCheckpoint: false, /* halfway spaced-retrieval checkpoint shown once */
    warmupTutorialDismissed: false
  };

  /* ---------- halfway (mini bonuses unlock after the first six reviews) ---------- */
  var HALFWAY = 6;
  function halfwayReached() { return completedCount() >= HALFWAY; }

  /* ================= helpers ================= */

  function scen() { return SCENARIOS[state.currentId]; }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escML(s) { return esc(s).replace(/\n/g, "<br>"); }

  function flaggedIds() { return Object.keys(state.flagged); }

  function orderIndexOf(id) { return PLAY_ORDER.indexOf(id); }

  function completedCount() { return Object.keys(state.completed).length; }

  function nextUncompletedId() {
    for (var i = 0; i < PLAY_ORDER.length; i++) {
      if (!state.completed[PLAY_ORDER[i]]) return PLAY_ORDER[i];
    }
    return null;
  }

  function one(sel) { return app.querySelector(sel); }
  function all(sel) { return Array.prototype.slice.call(app.querySelectorAll(sel)); }
  function on(sel, evt, fn) { var n = one(sel); if (n) n.addEventListener(evt, fn); }

  /* ================= scoring (handoff §3) ================= */

  function scoreAttempt(s) {
    var ids = flaggedIds();
    var hits = s.body.filter(function (seg) { return seg.flaw && ids.indexOf(seg.id) > -1; });
    var falseAlarms = s.body.filter(function (seg) { return !seg.flaw && ids.indexOf(seg.id) > -1; });
    var missed = s.body.filter(function (seg) { return seg.flaw && ids.indexOf(seg.id) === -1; });
    var totalFlaws = s.body.filter(function (seg) { return seg.flaw; }).length;
    var detection = Math.max(0, hits.length * WEIGHTS.hit - falseAlarms.length * WEIGHTS.falseAlarm);
    var decisionScore = state.decision === s.correctDecision ? WEIGHTS.decisionFull
      : s.adjacentDecisions.indexOf(state.decision) > -1 ? WEIGHTS.decisionPartial : 0;
    var justOption = null;
    (s.justificationOptions[state.decision] || []).forEach(function (j) { if (j.id === state.justification) justOption = j; });
    return {
      hits: hits.length, falseAlarms: falseAlarms.length, missed: missed.length, totalFlaws: totalFlaws,
      detection: detection, detectionMax: totalFlaws * WEIGHTS.hit,
      decisionScore: decisionScore, decisionMax: WEIGHTS.decisionFull,
      justificationScore: justOption ? (justOption.correct ? WEIGHTS.justification : -WEIGHTS.justificationPenalty) : 0,
      justificationMax: WEIGHTS.justification,
      justOption: justOption,
      flaggedIds: ids.slice()
    };
  }

  /* ================= shared markup ================= */

  function markSVG(size, color, opacity) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 22 22" fill="none" aria-hidden="true"' +
      (opacity ? ' style="position:absolute;opacity:' + opacity + ';"' : '') + '>' +
      '<rect x="1" y="1" width="20" height="20" rx="6" stroke="' + color + '" stroke-width="1.3"/>' +
      '<rect x="5" y="5" width="12" height="12" rx="3.8" stroke="' + color + '" stroke-width="1.3"/>' +
      '<rect x="9" y="9" width="4" height="4" rx="1.5" fill="' + color + '"/></svg>';
  }

  function gaugeSVG() {
    var done = completedCount(), total = PLAY_ORDER.length;
    var r = 15.5, c = 2 * Math.PI * r;
    var frac = done / total;
    return '<div class="gauge" role="img" aria-label="' + done + ' of ' + total + ' reviews complete">' +
      '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">' +
      '<circle cx="22" cy="22" r="' + r + '" fill="none" stroke="#E9E3E5" stroke-width="5"/>' +
      (frac > 0
        ? '<circle cx="22" cy="22" r="' + r + '" fill="none" stroke="#A80C35" stroke-width="5" stroke-linecap="round" ' +
          'stroke-dasharray="' + (c * frac).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 22 22)"/>'
        : "") +
      '<text x="22" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="10.5" font-weight="700" fill="#1E2326">' +
      done + "/" + total + '</text>' +
      '</svg></div>';
  }

  function headerHTML(location, tag, actionHTML) {
    return '<header class="site-header">' +
      '<div class="brand">' + markSVG(22, "#A80C35") +
      '<span class="visually-hidden">Marchwell Academy</span></div>' +
      '<div class="header-divider"></div>' +
      '<span class="header-location">' + location + '</span>' +
      (tag ? '<span class="header-tag">' + tag + '</span>' : "") +
      (actionHTML || "") +
      gaugeSVG() +
      '</header>';
  }

  function scenarioHeader() {
    var s = scen();
    var n = orderIndexOf(s.id) + 1;
    var loc = (s.scored ? "Scenario " + n + " of " + PLAY_ORDER.length : "Warm-up") + " · <em>" + esc(s.title) + "</em>";
    var tag = state.replayMode ? "Replay — not scored" : s.scored ? "Scored" : "Warm-up — not scored";
    var action = (state.screen === "brief" || state.screen === "desk")
      ? '<button type="button" class="btn-link header-queue-link" data-action="return-map">Return to queue</button>'
      : "";
    return headerHTML(loc, tag, action);
  }

  function kicker(label) {
    return '<div class="kicker"><span class="kicker-dot"></span>' +
      '<span class="kicker-label">' + esc(label) + '</span></div>';
  }

  function footerHTML() {
    return '<footer class="site-footer">The Human Overseer · build v1.4 · desk tools: live search, records lookup, per-scenario review mindset, cast directory · plain-language source pane, “what you could have done” debrief panel, wide-screen landing (Build Delta v0.4, addenda to v1.4) — consequence content and clean-segment notes still pending owner realism pass (handoff §7.2–7.3)</footer>';
  }

  function videoCardHTML(s) {
    if (s.videoEmbedUrl) {
      var embedPadding = s.videoEmbedPadding || "56.458%";
      var embedTitle = "briefing-" + s.id.toLowerCase() + "-" + s.requester.toLowerCase().replace(/\s+/g, "-");
      return '<div class="card fade-up-1">' +
        '<div style="padding:' + esc(embedPadding) + ' 0 0 0;position:relative;width:100%;">' +
        '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="' + esc(s.videoEmbedUrl) + '" title="' + esc(embedTitle) + '"></iframe>' +
        '</div>' +
        '<div class="transcript">' +
        '<div class="transcript-head"><span class="transcript-label">Transcript</span>' +
        '<button type="button" class="btn-link" data-action="toggle-transcript" aria-expanded="false">Show</button></div>' +
        '<p class="transcript-body" data-transcript hidden>' + escML(s.transcript) + '</p>' +
        '</div></div>';
    }
    if (s.videoUrl) {
      return '<div class="card fade-up-1">' +
        '<video class="briefing-video" controls playsinline preload="metadata" aria-label="Briefing video: ' + esc(s.videoDuration) + '">' +
        '<source src="' + esc(s.videoUrl) + '" type="video/mp4">' +
        '</video>' +
        '<div class="transcript">' +
        '<div class="transcript-head"><span class="transcript-label">Transcript</span>' +
        '<button type="button" class="btn-link" data-action="toggle-transcript" aria-expanded="false">Show</button></div>' +
        '<p class="transcript-body" data-transcript hidden>' + escML(s.transcript) + '</p>' +
        '</div></div>';
    }
    return '<div class="card fade-up-1">' +
      '<div class="video-poster" role="img" aria-label="Briefing video placeholder: ' + esc(s.videoDuration) + '. Video pending upload — transcript below.">' +
      markSVG(160, "#214F6D", "0.06") +
      '<div class="video-play" aria-hidden="true"><svg width="24" height="26" viewBox="0 0 24 26"><polygon points="4,2 4,24 22,13" fill="#A80C35"/></svg></div>' +
      '<div class="video-duration">' + esc(s.videoDuration) + '</div>' +
      '<div class="video-pending"><span class="dot"></span>Video pending upload</div>' +
      '</div>' +
      '<div class="transcript">' +
      '<div class="transcript-head"><span class="transcript-label">Transcript</span>' +
      '<button type="button" class="btn-link" data-action="toggle-transcript" aria-expanded="true">Hide</button></div>' +
      '<p class="transcript-body" data-transcript>' + escML(s.transcript) + '</p>' +
      '</div></div>';
  }

  function contextHTML(s) {
    if (!s.context) return "";
    var inner = "";
    if (s.context.type === "table") {
      inner = '<table class="context-table"><thead><tr>' +
        s.context.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") +
        '</tr></thead><tbody>' +
        s.context.rows.map(function (row) {
          return "<tr>" + row.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
        }).join("") + '</tbody></table>';
    } else {
      inner = '<p class="context-text">' + esc(s.context.text) + '</p>';
    }
    return '<div class="card context-panel fade-up-1">' +
      '<h3 class="context-label">' + esc(s.context.label) + '</h3>' + inner + '</div>';
  }

  /* ---------- artefact rendering (page | email) ---------- */

  function segmentHTML(seg, i, total, mode, ids, tourTarget) {
    var inner;
    if (mode === "inspect") {
      var flagged = !!state.flagged[seg.id];
      inner = '<button type="button" class="span-btn' + (flagged ? " is-flagged" : "") + '" ' +
        (tourTarget ? 'data-tour="' + tourTarget + '" ' : "") +
        'data-seg="' + seg.id + '" aria-pressed="' + flagged + '" ' +
        'aria-label="Segment ' + (i + 1) + ' of ' + total + ': ' + esc(seg.text) + '">' +
        esc(seg.text) +
        '<span class="flag-glyph" aria-hidden="true"' + (flagged ? "" : " hidden") + '>⚑</span>' +
        '</button>';
    } else {
      var wasFlagged = ids.indexOf(seg.id) > -1;
      if (seg.flaw && wasFlagged) {
        inner = '<span class="span-state st-hit">' + esc(seg.text) + '</span><span class="state-glyph glyph-hit">✓ flagged</span>';
      } else if (seg.flaw) {
        inner = '<span class="span-state st-miss">' + esc(seg.text) + '</span><span class="state-glyph glyph-miss">⚠ missed</span>';
      } else if (wasFlagged) {
        inner = '<span class="span-state st-false">' + esc(seg.text) + '</span><span class="state-glyph glyph-false">✕ false flag</span>';
      } else {
        inner = esc(seg.text);
      }
    }
    if (seg.bullet) return '<span class="seg-line seg-bullet">' + inner + '</span>';
    return inner + " ";
  }

  function artefactHTML(s, mode, ids) {
    var total = s.body.length;
    var bodyHTML = s.body.map(function (seg, i) {
      var tourTarget = s.id === "S01" && mode === "inspect" && seg.id === "s01-2" ? "flag-example" : "";
      return segmentHTML(seg, i, total, mode, ids || [], tourTarget);
    }).join("");
    var head = '<div class="artefact-head">' + markSVG(18, "#A80C35") +
      '<span class="artefact-label">' + esc(s.artefactLabel) + '</span>' +
      '<span class="artefact-subtitle">' + esc(s.artefactSubtitle) + '</span>' +
      '<span class="artefact-chip">AI-generated · verify before use</span></div>';

    if (s.artefactKind === "email") {
      return '<div class="card fade-up-1">' + head +
        '<div class="email-head">' +
        '<div class="email-row"><span><span class="field-name">From:</span> ' + esc(s.emailMeta.from) + '</span></div>' +
        '<div class="email-row"><span><span class="field-name">To:</span> ' + esc(s.emailMeta.to) + '</span></div>' +
        '<div class="email-subject">' + esc(s.emailMeta.subject) + '</div></div>' +
        '<div class="artefact-page email-page"><p class="artefact-body">' + bodyHTML + '</p></div>' +
        '<div class="email-sendbar"><button type="button" class="btn btn-primary" disabled ' +
        'title="Your decision below determines whether this sends">Send</button>' +
        '<span class="sendbar-note">Approving is what presses this button.</span></div>' +
        '</div>';
    }
    return '<div class="card fade-up-1">' + head +
      '<div class="artefact-page">' +
      '<div class="letterhead">[ Firm letterhead ]</div>' +
      '<h2 class="artefact-title">' + esc(s.artefactTitle) + '</h2>' +
      '<p class="artefact-meta">' + esc(s.artefactMeta) + '</p>' +
      '<p class="artefact-body">' + bodyHTML + '</p>' +
      '</div></div>';
  }

  function radioGroupHTML(groupId, labelHTML, options, selectedId) {
    return '<fieldset class="options" role="radiogroup" aria-labelledby="' + groupId + '-label">' +
      '<legend id="' + groupId + '-label">' + labelHTML + '</legend>' +
      options.map(function (o, i) {
        var selected = o.id === selectedId;
        return '<button type="button" class="option-btn" role="radio" aria-checked="' + selected + '" ' +
          'data-group="' + groupId + '" data-value="' + o.id + '" tabindex="' + (selected || (!selectedId && i === 0) ? "0" : "-1") + '">' +
          '<span class="radio-mark" aria-hidden="true"></span>' +
          '<span class="option-main"><span class="option-label">' + esc(o.label) + '</span>' +
          (o.hint ? '<span class="option-hint">' + esc(o.hint) + '</span>' : "") +
          '</span></button>';
      }).join("") +
      '</fieldset>';
  }

  function wireRadioGroup(groupId, onSelect) {
    var radios = all('[data-group="' + groupId + '"]');
    function select(idx) {
      radios.forEach(function (radio, i) {
        radio.setAttribute("aria-checked", String(i === idx));
        radio.tabIndex = i === idx ? 0 : -1;
      });
      radios[idx].focus();
      onSelect(radios[idx].getAttribute("data-value"));
    }
    radios.forEach(function (radio, i) {
      radio.addEventListener("click", function () { select(i); });
      radio.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % radios.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + radios.length) % radios.length;
        if (next !== null) { e.preventDefault(); select(next); }
      });
    });
  }

  function wireTranscriptToggle() {
    var btn = one("[data-action=toggle-transcript]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var body = one("[data-transcript]");
      var nowHidden = !body.hidden;
      body.hidden = nowHidden;
      btn.textContent = nowHidden ? "Show" : "Hide";
      btn.setAttribute("aria-expanded", String(!nowHidden));
    });
  }

  /* ================= desk tools rail =================
     Permanent desk fixtures — same three tabs, same order, on every
     scenario, so a tool's presence never signals where it's needed.
     Usage is recorded per attempt (toolsUsed) and stored with the
     committed result; whether the calibration profile reads it is a
     later decision. */

  var DESK_TOOLS = [
    { id: "request", label: "Request" },
    { id: "calc", label: "Calculator" },
    { id: "notes", label: "Notepad" },
    { id: "search", label: "Search" },
    { id: "records", label: "Records" },
    { id: "checklist", label: "Checklist" },
    { id: "cast", label: "People" }
  ];

  /* v1.9: "Ask the requester" — a back-half desk tool (unlocked at the
     halfway mark). One clarifying question to the person who set the task.
     Design rule: the reply NEVER confirms or denies the AI's specifics and
     carries no clean/flawed signal — it hands verification back to the
     overseer. Uniform across every back-half scenario; the only per-scenario
     content is the requester's voice. Teaches that the requester usually
     can't vouch for the output either, so asking is not a substitute for
     verifying the artefact. */
  var ASK_TOOL = { id: "ask", label: "Ask the requester" };
  var ASK_QUESTION = "Can you vouch for the specifics in here — or should I check them myself?";
  var REQUESTER_REPLIES = {
    "S01": "Honestly? The AI drafted it — I’ve not been through the sources line by line. If a figure goes in the pack under our name, you’re the one who should stand behind it, not me.",
    "S02": "I was hoping you’d know — I just needed Sam to get an answer. I didn’t check the policy wording myself; whatever the actual document says is what matters, not my memory of it.",
    "S03": "The raw monthly numbers are the ones I sent you — those are solid. Anything the AI worked out from them I’ve not re-checked, so don’t take my word for the totals.",
    "S04": "Look, I’m fairly convinced on this, but I asked for it drafted, not rubber-stamped. If you think the reasoning’s thin, that’s exactly the sort of thing I’d want flagged before it goes to the department heads.",
    "S05": "I asked for honest feedback, so if it’s gone soft to spare my feelings, I’d rather know. I can’t tell how hard it actually pushed — that’s your read to make.",
    "S06": "The one thing I was firm on: no recommendation, the group hasn’t seen it yet. Beyond that I’ve not read the draft closely — if it’s crept past that line, that’s the kind of thing I need caught.",
    "S07": "Elaine set the rules on this one — nothing on costs or timings, neither’s confirmed. I’ve not combed the draft against that myself. If something slipped in, better you than the whole firm sees it.",
    "S08": "I want a proper assessment, not a cheerleading piece. If it reads like it’s already made its mind up without the evidence, say so — I’d rather hear it from you now.",
    "S09": "The inputs I gave were rough — ‘about thirty sessions’, ‘twenty to forty minutes’. I’ve no idea how the AI got to an exact figure from that. Whether the precise number holds up is your call, not mine.",
    "S10": "I’ve not sat down and checked it against the notes myself — that’s why it’s with you. Whatever you decide, decide it properly; I’d rather a considered yes or no than a quick wave-through.",
    "S11": "I asked a genuine question and I don’t have the answer myself. If the honest read is that the data can’t tell us, I’d want that respected rather than dressed up. Your judgement on whether it’s being straight.",
    "S12": "This is going to the client, so I’m not asking you to be polite about it. Elaine wanted a second pair of eyes — if the evidence or the reasoning won’t survive scrutiny, that has to surface before it leaves the building."
  };

  /* v1.3: Records lookup (v0.6 §4, formerly deferred) — the in-fiction
     register of firm policies, programmes and staff. ONE firm-wide
     register, identical on every scenario: uniform content is what keeps
     the tool's presence (and a "no record" result) from signalling
     anything. Division of labour: Records verifies INTERNAL references;
     the Search tool verifies external ones. A policy not in the register
     does not exist under that name — that absence is legitimate
     verification, not a leak, exactly as a fruitless web search is.
     Content pending owner realism pass (§7.3). */
  var REGISTER = [
    { id: "extended-absence", type: "Policy", name: "Extended Absence Policy", detail: "v2.1 · current. Covers leave of ten or more consecutive working days. Written notice to line manager: four weeks (six during peak periods). Approvals subject to team coverage; People team confirm individual cases.", aliases: "extended leave long leave absence notice period booking", docMeta: "v2.1 · current · Owner: People team",
      document: [
        "1. Scope. This policy covers any single period of leave of ten (10) or more consecutive working days, whatever the reason (annual leave taken in a block, sabbatical, or personal leave). Leave of fewer than ten consecutive working days is covered by the Annual Leave Policy.",
        "2. Notice. Requests must be made in writing to your line manager giving at least four (4) weeks' notice before the intended start date. During peak periods, at least six (6) weeks' notice is required. Peak periods are published each year by the People team.",
        "3. Approval. Approval is not automatic. It is subject to team coverage and business need over the requested dates, and your line manager may propose alternative dates. No period of extended absence is confirmed until you receive written approval.",
        "4. Confirmation. The People team can confirm how this policy applies to your individual circumstances, including notice periods that may vary under a contractual or statutory entitlement.",
        "Note: any specific figures, version numbers, or policy names quoted second-hand should be checked against this record, which is the authoritative version."
      ] },
    { id: "annual-leave", type: "Policy", name: "Annual Leave Policy", detail: "v4.0 · current. Standard holiday entitlement, carry-over and booking rules for leave under ten consecutive days.", aliases: "holiday leave booking entitlement", docMeta: "v4.0 · current · Owner: People team",
      document: [
        "1. Entitlement. Full-time colleagues accrue the firm's standard annual holiday entitlement, pro-rated for part-time hours. Entitlement runs with the firm's leave year.",
        "2. Booking. Leave of fewer than ten consecutive working days is booked through the usual leave request process and approved by your line manager, subject to coverage.",
        "3. Blocks of ten or more consecutive working days. These fall under the Extended Absence Policy and its separate notice requirements — this policy does not set the notice period for extended leave.",
        "4. Carry-over. Limited carry-over may be permitted at your line manager's discretion in line with the current leave-year rules."
      ] },
    { id: "flexible-working", type: "Policy", name: "Flexible Working Policy", detail: "v3.3 · current. Requests to vary working pattern, hours or location. Does not cover leave of any kind.", aliases: "flexible working hours pattern remote", docMeta: "v3.3 · current · Owner: People team",
      document: [
        "1. Purpose. This policy sets out how colleagues may request a lasting change to their working pattern — the hours they work, the days they work, or where they work from.",
        "2. What this policy is not. This policy does not govern leave, absence, or time off of any kind. Requests for holiday, extended leave, or personal absence are covered by the Annual Leave Policy and the Extended Absence Policy respectively.",
        "3. Requests. Flexible-working requests are made in writing and considered against business need, team coverage, and the nature of the role.",
        "4. Trial periods. An agreed change may begin with a trial period before it is confirmed as a permanent variation to your terms."
      ] },
    { id: "hybrid-working", type: "Policy", name: "Hybrid Working Guidelines", detail: "v1.2 · current. Expectations for office/home split, team anchor days, and equipment.", aliases: "hybrid remote home working office", docMeta: "v1.2 · current · Owner: People team",
      document: [
        "1. Split. Guidelines describe the expected balance of office and home working. The precise split is set at team level around agreed anchor days.",
        "2. Anchor days. Teams nominate anchor days on which members are expected on site together for collaboration.",
        "3. Equipment. Standard home-working equipment is provided on request through the usual channels; arrangements are reviewed periodically.",
        "4. These are guidelines rather than a contractual entitlement, and do not vary any colleague's leave arrangements."
      ] },
    { id: "ai-use", type: "Policy", name: "AI Use and Review Guidance", detail: "v1.0 · current. All AI-generated material must be verified by a named reviewer before external or all-staff circulation.", aliases: "ai artificial intelligence review verification drafts", docMeta: "v1.0 · current · Owner: Risk & L&D",
      document: [
        "1. Principle. AI tools may be used to draft material, but the accountable human reviewer — not the tool — is responsible for what is sent.",
        "2. Verification. All AI-generated material must be checked by a named reviewer before it is circulated externally or to all staff. Named sources, figures, quotations, and internal references must be verified against authoritative records.",
        "3. Internal references. AI tools do not have access to the firm's policies or records unless a document has been explicitly provided. Any policy name, version, date, or figure an AI attributes to an internal document must be confirmed against the register.",
        "4. Record. The reviewer's name is recorded with the circulated material."
      ] },
    { id: "data-protection", type: "Policy", name: "Data Protection Policy", detail: "v5.1 · current. Handling of personal and client data; retention schedules.", aliases: "data privacy gdpr retention", docMeta: "v5.1 · current · Owner: Risk",
      document: [
        "1. Scope. Governs the handling of personal data relating to colleagues, clients, and third parties.",
        "2. Principles. Personal data is collected for specified purposes, kept accurate, held no longer than necessary, and protected against unauthorised access.",
        "3. Retention. Retention schedules are maintained by Risk and reviewed periodically.",
        "4. Breaches. Suspected breaches must be reported to Risk without delay."
      ] },
    { id: "mentoring", type: "Programme", name: "Mentoring Programme", detail: "Live programme record. Early-career uptake below target for two consecutive cycles; cause not yet assessed. Budget holder: L&D.", aliases: "mentoring mentor development early-career uptake", docMeta: "Live programme record · Owner: L&D",
      document: [
        "Status: live. The programme pairs colleagues with mentors across the firm.",
        "Uptake: among early-career colleagues, uptake has been below target for two consecutive cycles.",
        "Cause: not yet assessed. No analysis has been completed of why uptake is low; scheduling, awareness, matching, and manager support have not been ruled out.",
        "Budget: held by L&D. No decision has been recorded to change, pause, or wind down the programme."
      ] },
    { id: "platform-migration", type: "Programme", name: "Learning Platform Migration", detail: "Project record. Provider selection with procurement — negotiation in progress, no terms signed. No confirmed dates or costs on file.", aliases: "learning platform migration lms provider procurement", docMeta: "Project record · Owner: L&D / Procurement",
      document: [
        "Status: in progress. The firm is moving its learning platform to a new provider.",
        "Provider selection: with Procurement. Negotiation is in progress and no terms have been signed.",
        "Dates: no switchover date is confirmed or recorded on file.",
        "Costs: no licensing cost or saving figure is confirmed or recorded on file. Any specific date or cost figure attributed to this project is not yet established."
      ] },
    { id: "attendance", type: "Record", name: "Training attendance — current year", detail: "Monthly attendance registers held by Operations. January 142 · February 118 · March 165 · April 131.", aliases: "training attendance figures sessions monthly", docMeta: "Operations register · current year",
      document: [
        "Monthly attendance registers held by Operations for the current year:",
        "January: 142 attendees. February: 118 attendees. March: 165 attendees. April: 131 attendees.",
        "These are the recorded figures. Any average, percentage change, or growth rate derived from them should be recomputed from these numbers rather than taken from a summary."
      ] },
    { id: "vendor-eval", type: "Record", name: "Vendor evaluation — steering group", detail: "Evaluation complete; report restricted to the steering group until reviewed at its next meeting.", aliases: "vendor evaluation steering group procurement", docMeta: "Restricted record · Steering group",
      document: [
        "Status: evaluation complete.",
        "Access: the full report is restricted to the steering group until it is reviewed at the group's next meeting.",
        "No recommendation has been released outside the steering group, and no vendor has been discounted or selected on the record."
      ] },
    { id: "priya", type: "Person", name: "Priya", detail: "Operations manager. Owns the ops report and operational communications.", aliases: "priya operations manager", docMeta: "Staff directory",
      document: [
        "Role: Operations manager.",
        "Owns the operations report and operational communications. Point of contact for operational data and reporting."
      ] },
    { id: "tom", type: "Person", name: "Tom", detail: "Early-career colleague, operations team.", aliases: "tom colleague", docMeta: "Staff directory",
      document: [
        "Role: Early-career colleague, operations team.",
        "No further notes on file."
      ] },
    { id: "elaine", type: "Person", name: "Elaine", detail: "Partner. Oversight of client-facing and all-staff material.", aliases: "elaine partner", docMeta: "Staff directory",
      document: [
        "Role: Partner.",
        "Oversight of client-facing and all-staff material."
      ] },
    { id: "marcus", type: "Person", name: "Marcus", detail: "Senior manager.", aliases: "marcus senior manager", docMeta: "Staff directory",
      document: [
        "Role: Senior manager.",
        "No further notes on file."
      ] },
    { id: "sam", type: "Person", name: "Sam", detail: "Colleague on Tom's team.", aliases: "sam", docMeta: "Staff directory",
      document: [
        "Role: Colleague, operations team.",
        "No further notes on file."
      ] },
    { id: "rachel", type: "Person", name: "Rachel", detail: "Finance lead, leadership group.", aliases: "rachel finance", docMeta: "Staff directory",
      document: [
        "Role: Finance lead, leadership group.",
        "No further notes on file."
      ] }
  ];

  function recordById(id) {
    return REGISTER.filter(function (r) { return r.id === id; })[0];
  }

  function recordsSearch(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 2; });
    if (!terms.length) return { exact: [], near: [] };
    var scored = REGISTER.map(function (r) {
      var hay = (r.name + " " + r.aliases + " " + r.detail).toLowerCase();
      var nameHit = r.name.toLowerCase().indexOf(query.toLowerCase().trim()) > -1;
      var score = terms.reduce(function (n, t) { return n + (hay.indexOf(t) > -1 ? 1 : 0); }, 0);
      return { r: r, score: score, nameHit: nameHit };
    }).filter(function (x) { return x.score > 0 || x.nameHit; });
    scored.sort(function (a, b) { return (b.nameHit - a.nameHit) || (b.score - a.score); });
    return {
      exact: scored.filter(function (x) { return x.nameHit; }).map(function (x) { return x.r; }),
      near: scored.filter(function (x) { return !x.nameHit; }).slice(0, 4).map(function (x) { return x.r; })
    };
  }

  function recordsResultsHTML(query) {
    var res = recordsSearch(query);
    var out = "";
    if (!res.exact.length) {
      out += '<p class="records-none"><strong>No register entry is named “' + esc(query) + '”.</strong> ' +
        'The register is the authoritative list of firm policies, programmes and records — a policy not listed here does not exist under that name. External publications aren’t covered: check those with the Search tool.</p>';
    }
    var hits = res.exact.concat(res.exact.length ? [] : res.near);
    if (hits.length) {
      out += (res.exact.length ? "" : '<p class="tool-note">Nearest register entries:</p>') +
        '<ul class="records-list">' +
        hits.map(function (r) {
          return '<li class="records-item"><span class="records-chip">' + esc(r.type) + '</span>' +
            '<span class="records-main"><span class="records-name">' + esc(r.name) + '</span>' +
            '<span class="records-detail">' + esc(r.detail) + '</span></span>' +
            '<button type="button" class="records-open" data-open-record="' + esc(r.id) + '" ' +
            'aria-label="Open ' + esc(r.name) + ' to read in full">Open</button></li>';
        }).join("") + '</ul>';
    } else if (res.exact.length === 0) {
      out += '<p class="tool-note">Nothing similar found either.</p>';
    }
    return out;
  }

  /* v1.6: record reading pane — opening a register entry slides in a
     right-hand pane with the full document, so an internal reference can be
     read and verified manually (not just summarised). Uniform: every entry
     is openable, so the Open button never signals which record is relevant.
     The document is the authentic firm record — it carries no answer key and
     never comments on the artefact under review; the learner draws the
     comparison. One pane, reused. */

  function recordPaneHTML() {
    return '<aside class="record-pane" data-record-pane aria-hidden="true" aria-label="Record document">' +
      '<div class="record-pane-head">' +
      '<div><span class="record-pane-kicker" data-record-pane-type>Record</span>' +
      '<h3 data-record-pane-title>Record</h3></div>' +
      '<button type="button" class="record-pane-close" data-record-pane-close aria-label="Close record">Close</button>' +
      '</div>' +
      '<div class="record-pane-body" data-record-pane-body></div>' +
      '</aside>';
  }

  function openRecordPane(id) {
    var r = recordById(id);
    var pane = one("[data-record-pane]");
    if (!r || !pane) return;
    one("[data-record-pane-type]").textContent = r.type;
    one("[data-record-pane-title]").textContent = r.name;
    one("[data-record-pane-body]").innerHTML =
      (r.docMeta ? '<p class="record-doc-meta">' + esc(r.docMeta) + '</p>' : "") +
      (r.document || []).map(function (p) { return '<p class="record-doc-p">' + esc(p) + '</p>'; }).join("");
    pane.classList.add("is-open");
    pane.setAttribute("aria-hidden", "false");
    var close = one("[data-record-pane-close]");
    if (close) close.focus();
  }

  function closeRecordPane() {
    var pane = one("[data-record-pane]");
    if (!pane) return;
    pane.classList.remove("is-open");
    pane.setAttribute("aria-hidden", "true");
  }

  function wireRecordPane() {
    var close = one("[data-record-pane-close]");
    if (close) close.addEventListener("click", closeRecordPane);
  }

  /* v1.7 → v1.8: per-module background briefing on every debrief. Extends the
     course's "LLMs predict, they don't compute" point to the 2026 state of the
     art, tailored to each scenario's failure mode: how a tooled assistant
     (Microsoft 365 Copilot, as the worked example) mitigates THAT failure — and
     where it doesn't, so the human still verifies. Inline collapsible section,
     just before Continue, with a cited "Research — and what it backs" list. */

  var BRIEFING_SRC = {
    arch: { label: "Microsoft — “How does Microsoft 365 Copilot work?” (Microsoft Learn, 2026)",
      plain: "Before the model answers, Copilot grounds the prompt by retrieving relevant tenant data through Microsoft Graph, scoped to what the signed-in user is allowed to see.",
      url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-architecture" },
    web: { label: "Microsoft — “What information does Copilot use to answer my prompt?” (Microsoft Support)",
      plain: "Copilot can ground answers in web results (via Bing) and in your work data, and shows citations — including deep citations to the exact passage of a source — so a reference can be traced and opened.",
      url: "https://support.microsoft.com/en-us/topic/what-information-does-copilot-use-to-answer-my-prompt-934f537d-ff7d-4059-9fec-a751e4651307" },
    code: { label: "Microsoft — “Use code interpreter to analyze structured data” (Copilot Studio, Microsoft Learn)",
      plain: "For analytical questions Copilot generates and runs Python, using deterministic, reproducible computation instead of the model's inherent math.",
      url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-code-interpreter-structured-data" },
    rai: { label: "Microsoft — “FAQ about using AI responsibly in Microsoft 365 Copilot” (Microsoft Learn)",
      plain: "Microsoft states outputs may be inaccurate, incomplete or biased, that users must review and verify responses, and warns explicitly about over-reliance — accepting wrong output because the mistake is hard to spot.",
      url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/responsible-ai-overview" },
    hall: { label: "Kalai, Nachum, Vempala & Zhang (2025), “Why Language Models Hallucinate” (OpenAI, arXiv:2509.04664)",
      plain: "Models are trained and tested in ways that reward confident guessing over admitting “I don't know,” so they produce plausible specifics when they lack the facts.",
      url: "https://arxiv.org/abs/2509.04664" },
    dziri: { label: "Dziri et al. (2023), “Faith and Fate: Limits of Transformers on Compositionality” (NeurIPS, arXiv:2305.18654)",
      plain: "On multi-step arithmetic, transformers imitate the surface pattern of worked examples rather than actually computing — answers look right while often being wrong.",
      url: "https://arxiv.org/abs/2305.18654" },
    syco: { label: "Sharma et al. (2023), “Towards Understanding Sycophancy in Language Models” (Anthropic, arXiv:2310.13548)",
      plain: "Assistants trained on human feedback learn to agree with users and soften criticism, because agreeable answers are rated more highly.",
      url: "https://arxiv.org/abs/2310.13548" },
    assert: { label: "“Assertion-Conditioned Compliance in Tool-Calling Agents” (2025, arXiv:2512.00332)",
      plain: "A user's stated assertion can carry through into a tool-augmented agent's function calls — sycophancy showing up in the tool pipeline, not only in the prose.",
      url: "https://arxiv.org/abs/2512.00332" },
    instab: { label: "Li et al. (2024), “Measuring and Controlling Instruction (In)Stability in Language Model Dialogs” (arXiv:2402.10962)",
      plain: "An instruction's grip on model output steadily fades as the text grows longer.",
      url: "https://arxiv.org/abs/2402.10962" },
    negated: { label: "Jang, Ye & Seo (2022), “A Case Study with Negated Prompts” (arXiv:2209.12711)",
      plain: "Models follow negated “don't do X” instructions markedly worse than positive ones — sometimes doing the banned thing anyway.",
      url: "https://arxiv.org/abs/2209.12711" },
    fluency: { label: "Alter & Oppenheimer (2009), “Uniting the Tribes of Fluency” (Pers. Soc. Psychol. Rev.)",
      plain: "Material that is easy to read is judged more true and inspected less — independent of what it actually says.",
      url: "https://journals.sagepub.com/doi/10.1177/1088868309341564" },
    pot: { label: "Chen et al. (2022), “Program of Thoughts Prompting” (arXiv:2211.12588)",
      plain: "Having the model express its reasoning as a program and offloading the actual calculation to a Python interpreter sharply reduces arithmetic errors versus reasoning in prose.",
      url: "https://arxiv.org/abs/2211.12588" },
    pal: { label: "Gao et al. (2022), “PAL: Program-aided Language Models” (arXiv:2211.10435)",
      plain: "The model writes a program as its reasoning steps, but the solution is executed by a Python runtime rather than produced by the model.",
      url: "https://arxiv.org/abs/2211.10435" }
  };

  function bsrc(key, relevance) {
    var b = BRIEFING_SRC[key];
    return { label: b.label, plain: b.plain, relevance: relevance, url: b.url };
  }

  var SCENARIO_BRIEFINGS = {
    "S01": {
      title: "Web grounding and citations — capable, not proof",
      body: [
        "Capability: faced with a claim like a named external report, Microsoft 365 Copilot can ground its answer in web search and attach citations — including deep citations that link to the exact passage — so a source can be traced and opened rather than taken on trust.",
        "Limitation: a citation existing is not the claim being right. The model can ground on a weak or wrong page, or cite a real source and summarise it incorrectly, and it will still read confidently. The tool surfaces a source; it doesn't guarantee the source says what the text claims.",
        "So the capability makes your check faster — open the link — but it doesn't remove it. An unlocatable or mismatched citation is still yours to catch before it travels."
      ],
      sources: [
        bsrc("web", "The capability: Copilot can cite and deep-link its sources, which is what lets you trace an external reference."),
        bsrc("hall", "The limitation's root: models produce confident specifics even when the grounding is thin or wrong."),
        bsrc("rai", "Why the check remains: Microsoft itself requires human review and warns of over-reliance.")
      ]
    },
    "S02": {
      title: "Graph grounding — only as good as what it retrieves",
      body: [
        "Capability: for an internal reference like a policy name, version or notice period, Copilot grounds in your Microsoft 365 data through Microsoft Graph and can quote the real document you're permitted to see, instead of inventing one.",
        "Limitation: that only holds when the document is actually connected, retrieved and within your permissions. If it isn't, Copilot still produces specifics that look retrieved but are generated — the exact 'almost-right policy' failure — and retrieval can surface the wrong or an out-of-date document.",
        "So grounding narrows fabrication of internal facts without removing it. Check any internal specifics against the authoritative register before you rely on them."
      ],
      sources: [
        bsrc("arch", "The capability: grounding in Microsoft Graph lets Copilot quote the real tenant document rather than guess at it."),
        bsrc("hall", "The limitation: with no retrieved source, the model still generates plausible, confident specifics.")
      ]
    },
    "S03": {
      title: "The code interpreter computes — but on its own inputs",
      body: [
        "Capability: for data and maths, Copilot's code interpreter writes and runs Python, so a figure is computed deterministically rather than predicted as text. Program-aided approaches exist precisely because offloading the calculation to an interpreter sharply cuts arithmetic error.",
        "Limitation: the computation is only as sound as the inputs and the question it runs on. Point it at the wrong column, let it infer a step, or don't invoke it at all, and it returns a confident, precise, wrong number.",
        "So when the source figures are in front of you, still confirm the derived ones. The capability makes the maths real; it doesn't make it right by itself."
      ],
      sources: [
        bsrc("code", "The capability: analytical answers are computed by Python, not predicted as number-shaped text."),
        bsrc("dziri", "The limitation's root: left to itself the model imitates the look of a calculation rather than performing it."),
        bsrc("pot", "Why the tool helps: offloading the arithmetic to an interpreter measurably reduces these errors.")
      ]
    },
    "S04": {
      title: "Tooling doesn't touch agreeableness",
      body: [
        "Capability: grounding and code raise accuracy on facts and figures — the things the ecosystem is built to check.",
        "Limitation: sycophancy is not one of those things. Amplifying a premise you handed over is a model-level tendency from training on human feedback, and research finds it persists into tool-calling agents, where a user's assertion flows straight into the actions the agent takes. More tools does not mean less flattery.",
        "So the safeguard here is judgment, not the platform: strip your premise, re-run, and compare. No grounding step does that for you."
      ],
      sources: [
        bsrc("syco", "The limitation: feedback-trained assistants learn to agree and amplify, because agreement is rewarded."),
        bsrc("assert", "Why tools don't help: sycophancy carries into a tool-augmented agent's function calls, not just its prose.")
      ]
    },
    "S05": {
      title: "No tool makes feedback honest",
      body: [
        "Capability: little of the ecosystem's tooling applies when the task is a judgment call like honest critique — there's no external fact to ground and no number to compute.",
        "Limitation: and the underlying model leans the wrong way. Assistants trained on human feedback learn to soften criticism, because agreeable, validating answers are rated more highly — so 'honest feedback' can arrive pre-flattered, with the real flaw buried as a minor point.",
        "So weigh praise against substance and ask what a sceptical reviewer would say. Then confirm the critique actually engaged the work — the tooling won't do it for you."
      ],
      sources: [
        bsrc("syco", "The limitation: models soften and bury criticism because that is what human feedback rewards."),
        bsrc("hall", "Related: the training pressure is toward agreeable, confident output over uncomfortable honesty.")
      ]
    },
    "S06": {
      title: "Guardrails aren't your brief",
      body: [
        "Capability: modern models follow instructions better and hold longer context, and Copilot layers system-level guardrails around the core model.",
        "Limitation: none of that reliably enforces your specific constraints. An instruction's grip fades as the output grows, and negated 'don't' rules are followed worst of all — which is how a 'no recommendation' brief ends up with a recommendation in the last bullet. Grounding and code check facts, not your instructions.",
        "So re-read the brief before the end of the output and tick off each prohibition. The floor is higher; the check is still yours."
      ],
      sources: [
        bsrc("instab", "The limitation: an instruction's pull measurably weakens as the text lengthens."),
        bsrc("negated", "Why the prohibition broke first: models handle 'don't' instructions markedly worse than positive ones.")
      ]
    },
    "S07": {
      title: "Fluent output isn't compliant output",
      body: [
        "Capability: the ecosystem is genuinely good at producing polished, well-structured, confident copy — useful drafting.",
        "Limitation: quality and compliance are independent, and fluency actively lowers scrutiny — easy-to-read text is judged more true and inspected less. Grounding and code don't audit your constraint list, so banned details like a cost or a timeline can ride inside excellent prose untouched.",
        "So audit against the constraints, not your impression of quality — the better it reads, the slower you go — and verify before it circulates."
      ],
      sources: [
        bsrc("instab", "The limitation: constraints lose their pull as the draft grows, so leaks land late in otherwise-compliant text."),
        bsrc("fluency", "Why polish is a trap: fluent writing is judged more true and inspected less, regardless of content.")
      ]
    },
    "S08": {
      title: "Citations show gaps — they don't fill them",
      body: [
        "Capability: because Copilot can ground in sources and show citations, an 'assessment' that cites nothing — or whose citations don't support its claims — is easier to expose. The missing evidence becomes visible.",
        "Limitation: confident, one-sided prose is exactly what the model is best at, and no tool supplies the counter-argument, weighs the trade-off, or manufactures the evidence that isn't there. Visible sources reveal an empty case; they don't make it a real one.",
        "So strip the intensifiers and see what evidence stands, and verify an assessment actually engaged a downside before trusting its confidence."
      ],
      sources: [
        bsrc("web", "The capability: visible citations make an evidence-free 'assessment' easier to spot."),
        bsrc("fluency", "The limitation: confident, fluent advocacy is read as true even with nothing behind it."),
        bsrc("rai", "Why the check remains: Microsoft requires human review — confidence is not verification.")
      ]
    },
    "S09": {
      title: "Real computation, unreal inputs",
      body: [
        "Capability: Copilot's code interpreter grounds figures in an actual computation over the inputs you provide, so a number invented from nothing is less likely — the maths is executed, not performed.",
        "Limitation: it's garbage-in. Feed explicitly rough inputs and ask for a figure, and you'll get precise-looking output — decimal places and pounds-and-pence — that the inputs never justified. Real computation over a rough estimate is still a rough estimate in a costume.",
        "So match the output's precision to the input's: a ballpark question deserves a range, and you confirm the inputs were real before trusting the decimals."
      ],
      sources: [
        bsrc("code", "The capability: figures are computed over the inputs given rather than guessed."),
        bsrc("pal", "The limit of that capability: the runtime executes whatever it's handed — sound inputs are the human's job.")
      ]
    },
    "S10": {
      title: "Cheap to verify — still not automatic",
      body: [
        "Capability: on a clean, well-sourced answer, citations and deep links to the exact passage make verification quick — you can confirm a good summary in seconds instead of rejecting it on suspicion. That makes calibrated approval easier and over-flagging harder to excuse.",
        "Limitation: grounded output reads authoritative whether or not it's correct, and the tooling can't tell you an answer is trustworthy — only make it faster to check. Cheap verification is not the same as no verification.",
        "So use the capability to check, then approve good work as a decision — made with the same care as a rejection."
      ],
      sources: [
        bsrc("web", "The capability: citations and deep links make confirming a good answer fast, so you needn't over-flag."),
        bsrc("rai", "The limitation: verify before trusting — the platform makes checking cheap, not unnecessary.")
      ]
    },
    "S11": {
      title: "The tooling leans against 'I don't know'",
      body: [
        "Capability: when an answer honestly says 'the data can't tell you', grounding and citations let you confirm the hedge is genuine — that the sources really are thin — rather than mistaking honesty for evasion.",
        "Limitation: the model's training pulls the other way. Systems are rewarded for confident guessing over admitting uncertainty, so the harder behaviour to produce is precisely the honest shrug. An assistant that grounds its answer and still says 'insufficient data' is doing what oversight should reward.",
        "So reward warranted uncertainty rather than punishing it — and confirm the uncertainty is honest, not lazy, before you act."
      ],
      sources: [
        bsrc("hall", "The limitation: models are trained and tested in ways that reward confident guessing over 'I don't know'."),
        bsrc("web", "The capability: grounding and citations let you check that a hedged answer is honestly hedged.")
      ]
    },
    "S12": {
      title: "Uneven help at the highest stakes",
      body: [
        "Capability: on this client-facing draft, grounding and citations can expose the fabricated study, and the code interpreter can check any figures — the tooling does real work on the fabrication and the numbers.",
        "Limitation: the failures it doesn't fix are the dangerous ones here — validating the client's preferred conclusion (sycophancy) and closing with confident prose are exactly what the model does, tools or not. The parts the ecosystem helps with least are the ones carrying the firm's name out the door.",
        "So let the stakes set the scrutiny: verify every external citation, strip the client's theory and re-run, and require alternatives to be analysed, not just acknowledged. Tooling raises the floor; it never removes the reviewer — least of all here."
      ],
      sources: [
        bsrc("syco", "The limitation that matters most here: the tooling can't stop the assistant validating the client's wanted answer."),
        bsrc("web", "The capability: citations make the fabricated external study traceable and therefore falsifiable."),
        bsrc("code", "The capability: any figures can be checked by computation rather than trusted as stated."),
        bsrc("rai", "The caveat at its highest stakes: Microsoft requires human review before client-facing use.")
      ]
    }
  };

  function briefingFor(s) {
    return SCENARIO_BRIEFINGS[s.id] || null;
  }


  /* Inline collapsible briefing section, shown on every debrief just before
     Continue. Collapsed by default — optional background the learner expands. */
  function briefingSectionHTML(s) {
    var b = briefingFor(s);
    if (!b) return "";
    var bodyHTML = b.body.map(function (p) { return '<p class="record-doc-p">' + esc(p) + '</p>'; }).join("");
    var sourcesHTML = b.sources.map(function (src) {
      return '<div class="sources-pane-item">' +
        '<p class="sources-pane-label">' + esc(src.label) + '</p>' +
        '<p class="sources-pane-plain">' + esc(src.plain) + '</p>' +
        '<p class="sources-pane-rel"><strong>What it backs:</strong> ' + esc(src.relevance) + '</p>' +
        '<p class="sources-pane-link"><a href="' + esc(src.url) + '" target="_blank" rel="noopener">Open source ↗</a></p>' +
        '</div>';
    }).join("");
    return '<div class="card briefing-section fade-up-2">' +
      '<button type="button" class="briefing-toggle" data-briefing-toggle aria-expanded="false">' +
      '<span class="briefing-heading">' + kicker("Background — modern assistants") +
      '<strong>' + esc(b.title) + ' — what the tooling can and can’t do (and why you still verify)</strong></span>' +
      '<span class="briefing-caret" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="briefing-body" data-briefing-body hidden>' +
      bodyHTML +
      '<h4 class="briefing-research-head">Research — and what it backs</h4>' +
      sourcesHTML +
      '<p class="record-doc-meta" style="margin-top:1rem;">Course background, not firm guidance. Always verify Copilot output against the source before it leaves your hands.</p>' +
      '</div>' +
      '</div>';
  }

  function wireBriefingSection() {
    var btn = one("[data-briefing-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var body = one("[data-briefing-body]");
      if (body) body.hidden = open;
    });
  }

  /* v1.1: review checklist — the course's own heuristics as a desk crib.
     Identical on every scenario (uniform presence, no signal). Ticks are
     per-render only — never stored or scored. */
  var CHECKLIST = [
    "Could the AI actually have seen this? Internal policy names, version numbers and figures it had no access to are generated, not retrieved.",
    "Search for every named external source. A citation you can't locate in two minutes is a stop sign.",
    "Recompute the derived numbers — averages, percentages, growth rates. Copied figures survive; calculated ones fail.",
    "Re-read the brief immediately before reviewing the final third. Drift lives in the last third, and “don't” instructions slip first.",
    "Match output precision to input precision. Decimal places from ballpark inputs are theatre.",
    "Strip the intensifiers (“unequivocal”, “clearly”, “every serious”) and see what evidence is left standing.",
    "Does the output agree with the requester more confidently than the requester did? That's mirroring, not analysis.",
    "The better it reads, the slower you should go — fluency lowers scrutiny.",
    "If it's genuinely clean, approve it. That's a decision too, made with the same care as a rejection."
  ];

  /* v1.1: cast directory — roles and relationships only, no scenario hints. */
  var CAST = [
    { name: "Priya", role: "Operations manager", note: "Owns the ops report and much of what circulates internally. Brings you work that's heading out under her name." },
    { name: "Tom", role: "Early-career colleague", note: "Uses AI drafts to keep up. Asks for a second pair of eyes when the stakes feel bigger than the task." },
    { name: "Elaine", role: "Partner", note: "Sets constraints and expects them checked word by word. What reaches clients or the whole firm crosses her radar." },
    { name: "Marcus", role: "Senior manager", note: "Decisive, in a hurry, and usually already convinced. His requests arrive with a conclusion attached." },
    { name: "Sam", role: "Colleague on Tom's team", note: "On the receiving end of some of what you approve. A reminder that documents land on real desks." }
  ];

  var calc = { display: "0", acc: null, op: null, fresh: true };

  function calcReset() { calc.display = "0"; calc.acc = null; calc.op = null; calc.fresh = true; }

  function calcApply(a, b, op) {
    if (op === "+") return a + b;
    if (op === "−") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") return b === 0 ? NaN : a / b;
    return b;
  }

  function calcFormat(n) {
    if (!isFinite(n)) return "Error";
    var s = String(Math.round(n * 1e10) / 1e10);
    return s.length > 14 ? n.toPrecision(8) : s;
  }

  function calcPress(key) {
    if (key === "C") { calcReset(); return; }
    if (calc.display === "Error" && key !== "C") calcReset();
    if (key >= "0" && key <= "9") {
      calc.display = calc.fresh || calc.display === "0" ? key : calc.display + key;
      calc.fresh = false;
      return;
    }
    if (key === ".") {
      if (calc.fresh) { calc.display = "0."; calc.fresh = false; }
      else if (calc.display.indexOf(".") === -1) calc.display += ".";
      return;
    }
    if (key === "⌫") {
      if (!calc.fresh) calc.display = calc.display.length > 1 ? calc.display.slice(0, -1) : "0";
      return;
    }
    if (key === "%") { calc.display = calcFormat(parseFloat(calc.display) / 100); calc.fresh = true; return; }
    if (key === "+" || key === "−" || key === "×" || key === "÷") {
      var cur = parseFloat(calc.display);
      calc.acc = calc.op !== null && !calc.fresh ? calcApply(calc.acc, cur, calc.op) : (calc.acc === null ? cur : calc.acc);
      calc.display = calcFormat(calc.acc);
      calc.op = key;
      calc.fresh = true;
      return;
    }
    if (key === "=") {
      if (calc.op !== null) {
        calc.display = calcFormat(calcApply(calc.acc, parseFloat(calc.display), calc.op));
        calc.acc = null; calc.op = null; calc.fresh = true;
      }
    }
  }

  function toolPanelHTML(toolId, s) {
    if (toolId === "request") {
      return '<h3 class="tool-title">The original request</h3>' +
        '<p class="tool-note">' + esc(s.requester) + ' — ' + esc(s.requesterRole) + '</p>' +
        '<p class="tool-body">' + escML(s.transcript) + '</p>';
    }
    if (toolId === "calc") {
      var keys = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "%", "+", "C", "⌫", "="];
      return '<h3 class="tool-title">Calculator</h3>' +
        '<div class="calc-display" data-calc-display aria-live="polite">' + esc(calc.display) + '</div>' +
        '<div class="calc-grid">' +
        keys.map(function (k) {
          var cls = "calc-key" + ("+−×÷=".indexOf(k) > -1 ? " calc-op" : "") + (k === "=" ? " calc-eq" : "");
          return '<button type="button" class="' + cls + '" data-calc-key="' + k + '">' + k + '</button>';
        }).join("") + '</div>';
    }
    if (toolId === "search") {
      /* v1.0.1: live web search — opens Google results in a new tab.
         (Embedded results dropped: Google and DuckDuckGo both send
         frame-blocking headers, so no search engine renders in-panel.) */
      return '<h3 class="tool-title">Web search</h3>' +
        '<form class="tool-search-row" data-search-form>' +
        '<input type="search" class="tool-search-input" data-search-input placeholder="Search the live web…" aria-label="Web search query">' +
        '<button type="submit" class="btn btn-secondary tool-search-btn">Search ↗</button></form>' +
        '<p class="tool-note">Opens live Google results in a new browser tab — this desk stays as you left it.</p>';
    }
    if (toolId === "records") {
      return '<h3 class="tool-title">Records lookup</h3>' +
        '<p class="tool-note">The firm’s register of policies, programmes, records and people. If an internal document isn’t listed here, it doesn’t exist under that name.</p>' +
        '<form class="tool-search-row" data-records-form>' +
        '<input type="search" class="tool-search-input" data-records-input placeholder="Look up a policy, programme or person…" aria-label="Records lookup query">' +
        '<button type="submit" class="btn btn-secondary tool-search-btn">Look up</button></form>' +
        '<div data-records-results aria-live="polite"></div>';
    }
    if (toolId === "checklist") {
      /* v1.2: per-scenario mindset when authored; generic heuristics as fallback.
         Mindset items are derived only from brief-visible signals (the requester's
         own words, the artefact genre, the stakes) — never from the plant, and
         clean scenarios read just as pointed as flawed ones. */
      var items = (s && s.mindset && s.mindset.length) ? s.mindset : CHECKLIST;
      return '<h3 class="tool-title">Review mindset — this task</h3>' +
        '<p class="tool-note">The frame of mind this review needs. Ticks are yours alone — never stored, never scored.</p>' +
        '<ul class="tool-checklist">' +
        items.map(function (item) {
          return '<li class="checklist-item"><label><input type="checkbox" class="checklist-box">' +
            '<span>' + esc(item) + '</span></label></li>';
        }).join("") + '</ul>';
    }
    if (toolId === "cast") {
      return '<h3 class="tool-title">People</h3>' +
        '<p class="tool-note">Who you’re reviewing for — and who your decisions land on.</p>' +
        '<ul class="tool-cast">' +
        CAST.map(function (p) {
          return '<li class="cast-item"><span class="cast-avatar" aria-hidden="true">' + esc(p.name.charAt(0)) + '</span>' +
            '<span class="cast-main"><span class="cast-name">' + esc(p.name) + '</span>' +
            '<span class="cast-role">' + esc(p.role) + '</span>' +
            '<span class="cast-note">' + esc(p.note) + '</span></span></li>';
        }).join("") + '</ul>';
    }
    if (toolId === "ask") {
      var reply = REQUESTER_REPLIES[s.id] || "I couldn’t tell you either — whatever the source actually says is what counts. That’s your check to make, not mine.";
      return '<h3 class="tool-title">Ask the requester</h3>' +
        '<p class="tool-note">Put one clarifying question to ' + esc(s.requester) + ' — a real person’s time, so just the one.</p>' +
        '<button type="button" class="btn btn-secondary ask-ask-btn" data-ask-btn>Ask: “' + esc(ASK_QUESTION) + '”</button>' +
        '<div class="ask-reply" data-ask-reply hidden>' +
        '<p class="ask-line ask-you">You ask ' + esc(s.requester) + ':</p>' +
        '<p class="ask-q">“' + esc(ASK_QUESTION) + '”</p>' +
        '<div class="ask-bubble"><span class="ask-avatar" aria-hidden="true">' + esc(s.requester.charAt(0)) + '</span>' +
        '<span class="ask-text">' + esc(reply) + '</span></div>' +
        '<p class="tool-note ask-foot">Notice the requester can’t vouch for the AI’s specifics either — asking points you back to the document, not away from it.</p>' +
        '</div>';
    }
    /* notes */
    return '<h3 class="tool-title">Notepad</h3>' +
      '<textarea class="tool-notes" data-tool-notes rows="9" aria-label="Notepad — session only">' +
      esc(state.notes[state.currentId] || "") + '</textarea>' +
      '<p class="tool-note">Session only — cleared when you close the page.</p>';
  }

  function deskToolsHTML() {
    var askUnlocked = halfwayReached();
    var askIsNew = completedCount() === HALFWAY; /* new only on the first back-half scenario */
    var askTab = askUnlocked
      ? '<button type="button" class="tool-tab tool-tab-ask' + (askIsNew ? ' tool-tab-new' : '') + '" data-tool="ask" aria-expanded="false">' +
        ASK_TOOL.label +
        (askIsNew ? '<span class="tool-new-badge" aria-hidden="true">New</span><span class="visually-hidden"> — newly unlocked tool</span>' : '') +
        '</button>'
      : '';
    return '<aside class="desk-tools" aria-label="Desk tools">' +
      '<div class="tool-rail">' +
      '<span class="tool-rail-label" aria-hidden="true">Desk tools</span>' +
      DESK_TOOLS.map(function (t) {
        return '<button type="button" class="tool-tab" data-tool="' + t.id + '" aria-expanded="false">' + t.label + '</button>';
      }).join("") + askTab + '</div>' +
      '<div class="tool-panel" data-tool-panel hidden></div>' +
      '</aside>';
  }

  function wireDeskTools(s) {
    var openTool = null;
    var panel = one("[data-tool-panel]");
    var tabs = all("[data-tool]");

    function wirePanel(toolId) {
      if (toolId === "calc") {
        all("[data-calc-key]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            calcPress(btn.getAttribute("data-calc-key"));
            one("[data-calc-display]").textContent = calc.display;
          });
        });
      }
      if (toolId === "notes") {
        one("[data-tool-notes]").addEventListener("input", function (e) {
          state.notes[state.currentId] = e.target.value;
        });
      }
      if (toolId === "ask") {
        var askBtn = one("[data-ask-btn]");
        if (askBtn) askBtn.addEventListener("click", function () {
          var r = one("[data-ask-reply]");
          if (r) r.hidden = false;
          askBtn.disabled = true;
        });
      }
      if (toolId === "search") {
        one("[data-search-form]").addEventListener("submit", function (e) {
          e.preventDefault();
          var q = one("[data-search-input]").value.trim();
          if (!q) return;
          window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener");
        });
      }
      if (toolId === "records") {
        one("[data-records-form]").addEventListener("submit", function (e) {
          e.preventDefault();
          var q = one("[data-records-input]").value.trim();
          if (!q) return;
          one("[data-records-results]").innerHTML = recordsResultsHTML(q);
        });
        one("[data-records-results]").addEventListener("click", function (e) {
          var btn = e.target.closest ? e.target.closest("[data-open-record]") : null;
          if (btn) openRecordPane(btn.getAttribute("data-open-record"));
        });
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-tool");
        if (openTool === id) {
          openTool = null;
          panel.hidden = true;
          tab.setAttribute("aria-expanded", "false");
          tab.classList.remove("is-open");
          return;
        }
        openTool = id;
        tabs.forEach(function (t2) {
          var isThis = t2 === tab;
          t2.setAttribute("aria-expanded", String(isThis));
          t2.classList.toggle("is-open", isThis);
        });
        state.toolsUsed[id] = true;
        panel.innerHTML = toolPanelHTML(id, s);
        panel.hidden = false;
        wirePanel(id);
      });
    });
  }

  /* v1.4: warm-up-only checking guide — renders only where a scenario
     carries warmupGuide (S01) AND is unscored. Never on scored scenarios:
     there, spotting what to check is the tested skill. */
  function warmupGuideHTML(s) {
    if (s.scored || !s.warmupGuide || !s.warmupGuide.length) return "";
    /* v1.4.1: sticky while the desk scrolls; body expandable, collapsed by default */
    return '<div class="card warmup-guide fade-up-1" data-warmup-guide>' +
      '<button type="button" class="warmup-guide-toggle" data-warmup-toggle aria-expanded="false">' +
      '<span class="context-label">Warm-up guidance — what could you check here?</span>' +
      '<span class="warmup-guide-chevron" aria-hidden="true">▾</span></button>' +
      '<div class="warmup-guide-body" data-warmup-body hidden>' +
      '<p class="tool-note">This is the kind of checking a reviewer does, and the desk tools that do it. ' +
      'From the next scenario on, spotting what to check is your job — this panel won’t appear again.</p>' +
      '<ul class="warmup-guide-list">' +
      s.warmupGuide.map(function (g) {
        return '<li class="warmup-guide-item">' +
          (g.tool ? '<span class="warmup-guide-tool">' + esc(g.tool) + '</span>' : '<span class="warmup-guide-tool warmup-guide-think">Judgment</span>') +
          '<span>' + esc(g.item) + '</span></li>';
      }).join("") + '</ul></div></div>';
  }

  function wireWarmupGuide() {
    var btn = one("[data-warmup-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var body = one("[data-warmup-body]");
      var open = body.hidden;
      body.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      one("[data-warmup-guide]").classList.toggle("is-open", open);
    });
  }

  /* ---------- S01 guided warm-up tour ---------- */
  var WARMUP_TOUR_STEPS = [
    {
      target: "[data-tour='warmup-status']",
      title: "A safe practice review",
      body: "This first review is a warm-up. Nothing you flag or decide here affects your calibration profile.",
      placement: "bottom"
    },
    {
      target: "[data-tour='desk-tools']",
      title: "Desk tools",
      body: "Use these tools to check external claims, search firm records, take notes, and ask one useful question. Their presence never tells you what is wrong.",
      placement: "bottom"
    },
    {
      target: "[data-tour='warmup-guide']",
      title: "Warm-up guidance",
      body: "This expandable guide demonstrates the kinds of checks a reviewer might consider. It appears only in this practice review.",
      placement: "bottom"
    },
    {
      target: "[data-tour='review-task']",
      title: "Your review task",
      body: "Read the document, then flag only text you could not defend if someone asked for the evidence behind it.",
      placement: "bottom"
    },
    {
      target: "[data-tour='flag-example']",
      title: "Flag a passage",
      body: "Click a passage like this, or reach it with Tab and press Enter. Flag only wording you could not defend if asked for the evidence behind it.",
      placement: "top"
    }
  ];
  var warmupTourTarget = null;

  function warmupTutorialHTML(s) {
    if (s.id !== "S01" || s.scored) return "";
    return '<button type="button" class="warmup-tutorial-start" data-warmup-tutorial-start>Start warm-up tutorial</button>' +
      '<div class="warmup-tutorial-overlay" data-warmup-tutorial hidden aria-live="polite">' +
      '<div class="warmup-tutorial-spotlight" data-warmup-tutorial-spotlight aria-hidden="true"></div>' +
      '<section class="warmup-tutorial-card" data-warmup-tutorial-card role="dialog" aria-modal="true" aria-labelledby="warmup-tutorial-title">' +
      '<div class="warmup-tutorial-head"><div><p class="warmup-tutorial-count" data-warmup-tutorial-count></p><h2 id="warmup-tutorial-title" data-warmup-tutorial-title></h2></div>' +
      '<button type="button" class="warmup-tutorial-close" data-warmup-tutorial-close aria-label="Close tutorial">×</button></div>' +
      '<p class="warmup-tutorial-body" data-warmup-tutorial-body></p>' +
      '<label class="warmup-tutorial-optout"><input type="checkbox" data-warmup-tutorial-optout> Don’t show this tutorial again</label>' +
      '<div class="warmup-tutorial-actions"><button type="button" class="warmup-tutorial-skip" data-warmup-tutorial-skip>Skip tutorial</button>' +
      '<button type="button" class="btn btn-primary" data-warmup-tutorial-next>Next</button></div></section></div>';
  }

  function clearWarmupTourTarget() {
    if (!warmupTourTarget) return;
    warmupTourTarget.classList.remove("warmup-tour-target");
    warmupTourTarget = null;
  }

  function wireWarmupTutorial(s) {
    if (s.id !== "S01" || s.scored) return;
    var overlay = one("[data-warmup-tutorial]");
    var card = one("[data-warmup-tutorial-card]");
    var start = one("[data-warmup-tutorial-start]");
    var spotlight = one("[data-warmup-tutorial-spotlight]");
    if (!overlay || !card || !start) return;
    var index = 0;

    function close() {
      var optout = one("[data-warmup-tutorial-optout]");
      state.warmupTutorialDismissed = !!(optout && optout.checked);
      overlay.hidden = true;
      if (spotlight) spotlight.removeAttribute("style");
      clearWarmupTourTarget();
      start.focus();
    }

    function positionSpotlight() {
      if (!warmupTourTarget || !spotlight) return;
      var rect = warmupTourTarget.getBoundingClientRect();
      var pad = 7;
      spotlight.style.left = Math.max(6, rect.left - pad) + "px";
      spotlight.style.top = Math.max(6, rect.top - pad) + "px";
      spotlight.style.width = Math.min(window.innerWidth - 12, rect.width + pad * 2) + "px";
      spotlight.style.height = Math.min(window.innerHeight - 12, rect.height + pad * 2) + "px";
    }

    function positionCard(step) {
      if (window.innerWidth < 768 || !warmupTourTarget) {
        card.removeAttribute("style");
        return;
      }
      var rect = warmupTourTarget.getBoundingClientRect();
      var width = Math.min(360, window.innerWidth - 32);
      var height = card.offsetHeight || 280;
      var gap = 20;
      var left = rect.right + gap;
      var top = Math.max(16, Math.min(rect.top, window.innerHeight - height - 16));
      if (left + width > window.innerWidth - 16) {
        left = rect.left - width - gap;
      }
      if (left < 16) {
        left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
        top = step.placement === "bottom" ? rect.bottom + gap : rect.top - height - gap;
      }
      card.style.width = width + "px";
      card.style.left = Math.max(16, Math.min(left, window.innerWidth - width - 16)) + "px";
      card.style.top = Math.max(16, Math.min(top, window.innerHeight - height - 16)) + "px";
    }

    function show(stepIndex) {
      index = stepIndex;
      var step = WARMUP_TOUR_STEPS[index];
      clearWarmupTourTarget();
      warmupTourTarget = app.querySelector(step.target);
      if (warmupTourTarget) {
        warmupTourTarget.classList.add("warmup-tour-target");
      }
      one("[data-warmup-tutorial-count]").textContent = "Warm-up tour · " + (index + 1) + " of " + WARMUP_TOUR_STEPS.length;
      one("[data-warmup-tutorial-title]").textContent = step.title;
      one("[data-warmup-tutorial-body]").textContent = step.body;
      one("[data-warmup-tutorial-next]").textContent = index === WARMUP_TOUR_STEPS.length - 1 ? "Start review" : "Next";
      if (warmupTourTarget && warmupTourTarget.scrollIntoView) {
        warmupTourTarget.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      setTimeout(function () {
        overlay.hidden = false;
        positionSpotlight();
        positionCard(step);
        one("[data-warmup-tutorial-next]").focus();
      }, warmupTourTarget ? 280 : 0);
    }

    start.addEventListener("click", function () {
      state.warmupTutorialDismissed = false;
      show(0);
    });
    one("[data-warmup-tutorial-close]").addEventListener("click", close);
    one("[data-warmup-tutorial-skip]").addEventListener("click", close);
    one("[data-warmup-tutorial-next]").addEventListener("click", function () {
      if (index === WARMUP_TOUR_STEPS.length - 1) close(); else show(index + 1);
    });
    window.addEventListener("resize", function () {
      if (!overlay.hidden) {
        positionSpotlight();
        positionCard(WARMUP_TOUR_STEPS[index]);
      }
    });
    window.addEventListener("scroll", function () {
      if (!overlay.hidden) {
        positionSpotlight();
        positionCard(WARMUP_TOUR_STEPS[index]);
      }
    }, true);
    if (!state.warmupTutorialDismissed) setTimeout(function () { show(0); }, 50);
  }

  /* ================= screens ================= */

  /* v0.8: landing screen — sits in front of the intro (owner decision) */
  var LANDING_DOCS = [
    "Briefing note", "Policy reply", "Attendance summary", "Feedback",
    "Vendor summary", "Meeting summary", "Programme note", "Estimate",
    "Newsletter item", "Format comparison", "Assessment", "Advisory note"
  ];

  function landingDocsHTML() {
    var cards = LANDING_DOCS.map(function (label) {
      return '<div class="landing-doc" aria-hidden="true"><span class="landing-doc-label">' + esc(label) + '</span>' +
        '<span class="landing-doc-line"></span><span class="landing-doc-line short"></span></div>';
    }).join("");
    /* doubled so the CSS loop is seamless */
    return '<div class="landing-strip" aria-hidden="true">' + cards + cards + '</div>';
  }

  function renderLanding() {
    app.innerHTML = headerHTML("The Human Overseer", "Module") +
      '<main class="landing-band">' +
      '<div class="landing-inner">' +
      '<span class="landing-kicker fade-up">The Human Overseer</span>' +
      '<h1 class="landing-title fade-up-1">Every document is confident.<br>' +
      '<span class="landing-title-gold">Not every document is right.</span></h1>' +
      '<p class="landing-lede fade-up-2">Colleagues across the firm are using AI to draft documents, summaries and replies — and every one of them reads well. This simulation puts twelve of those drafts on your desk. Some contain planted problems. Some are fine exactly as they are. Your job is to tell the difference — and to be right about why.</p>' +
      '</div>' +
      '<div class="landing-conveyor">' + landingDocsHTML() + '</div>' +
      '<div class="landing-inner landing-cta-row fade-up-3">' +
      '<button type="button" class="btn btn-primary" data-action="enter">See how you fare</button>' +
      '<span class="landing-meta">Twelve reviews · 45–60 minutes · the first is a warm-up</span>' +
      '</div>' +
      '</main>' + footerHTML();
    on("[data-action=enter]", "click", function () { setScreen("start"); });
  }

  function renderStart() {
    app.innerHTML = headerHTML("The Human Overseer", "Module") +
      '<main class="screen">' +
      '<div class="card start-hero fade-up">' +
      kicker("The Human Overseer") +
      '<h1>Review these before they go out.</h1>' +
      '<p>Colleagues across the firm are using AI to draft documents, summaries and replies. ' +
      'Before each one reaches its audience, it crosses your desk. Some contain problems. ' +
      'Some are fine exactly as they are. Your job is to tell the difference — and to be right about why.</p>' +
      '<p class="start-meta">Twelve reviews · 45–60 minutes · no time pressure · the first is a warm-up and is not scored<br>' +
      'Progress lives in this session — plan to finish in one sitting. Save-and-resume arrives with the LMS wrapper.</p>' +
      '<div class="btn-row" style="justify-content:flex-start;">' +
      '<button type="button" class="btn btn-primary" data-action="begin">Begin</button>' +
      '</div></div>' +
      '</main>' + footerHTML();
    on("[data-action=begin]", "click", function () { setScreen("map"); });
  }

  function renderMap() {
    var done = completedCount();
    var next = nextUncompletedId();
    var cards = PLAY_ORDER.map(function (id, i) {
      var s = SCENARIOS[id];
      var status = state.completed[id] ? "reviewed" : id === next ? "next" : "locked";
      var num = '<span class="map-num">' + (i < 9 ? "0" : "") + (i + 1) + '</span>';
      var title = '<span class="map-title">' + esc(s.title) +
        (s.scored ? "" : ' <span class="map-warmup">Warm-up</span>') + '</span>';
      if (status === "next") {
        return '<button type="button" class="map-card map-card-next" data-start="' + id + '">' +
          '<span class="map-card-top">' + num + '<span class="map-chip chip-next">' +
          (state.drafts[id] ? 'Resume' : 'Up next') + '</span></span>' +
          title + '</button>';
      }
      if (status === "reviewed") {
        return '<div class="map-card">' +
          '<span class="map-card-top">' + num + '<span class="map-chip chip-reviewed">✓ Reviewed</span></span>' +
          title +
          '<button type="button" class="btn-link map-replay" data-replay="' + id + '" ' +
          'aria-label="Replay ' + esc(s.title) + ' — practice only, your first attempt still counts">Replay</button>' +
          '</div>';
      }
      return '<div class="map-card map-card-locked" aria-disabled="true">' +
        '<span class="map-card-top">' + num + '<span class="map-chip chip-locked">Locked</span></span>' +
        title + '</div>';
    }).join("");

    var doneAll = done === PLAY_ORDER.length;

    app.innerHTML = headerHTML("Simulator map", "") +
      '<main class="screen screen-wide">' +
      '<div class="fade-up section-bar"><h2>Your review queue</h2>' +
      '<p class="section-note">Scenarios unlock in order. Your first committed attempt is what counts — completed reviews can be replayed for practice.</p></div>' +
      '<div class="map-grid fade-up-1">' + cards + '</div>' +

      (halfwayReached()
        ? '<div class="reward-banner halfway-banner fade-up-2">' +
          '<div class="reward-icon halfway-icon" aria-hidden="true">✦</div>' +
          '<div class="reward-main">' +
          '<p class="reward-title">Halfway bonus unlocked</p>' +
          '<p class="reward-text">Past the midpoint — nice work. A real-world case from the wild is unlocked, and a new desk tool, “Ask the requester”, is now on your rail for the back half.</p>' +
          '</div>' +
          '<button type="button" class="btn btn-primary" data-action="wildcase">From the wild</button>' +
          '</div>'
        : "") +

      '<div class="reward-banner fade-up-2' + (doneAll ? ' reward-unlocked' : '') + '">' +
      '<div class="reward-icon" aria-hidden="true">' + (doneAll ? '★' : '🔒') + '</div>' +
      '<div class="reward-main">' +
      '<p class="reward-title">' + (doneAll ? 'Unlocked — your three end-of-course bonuses' : 'Complete all twelve to unlock your bonuses') + '</p>' +
      '<p class="reward-text">' + (doneAll
        ? 'Ready on your calibration profile: your personal overseer profile, the Overseer’s Map, and your printable field guide.'
        : 'Finish the queue to earn three rewards — a personal overseer profile, the Overseer’s Map, and a printable field guide tailored to your own blind spots.') + '</p>' +
      (doneAll
        ? ''
        : '<div class="reward-progress"><div class="reward-progress-bar" style="width:' + Math.round(done / PLAY_ORDER.length * 100) + '%"></div></div>' +
          '<p class="reward-count">' + done + ' of ' + PLAY_ORDER.length + ' reviews complete</p>') +
      '</div>' +
      (doneAll ? '<button type="button" class="btn btn-primary" data-action="profile">Open your bonuses</button>' : '') +
      '</div>' +

      (done > 0
        ? '<div class="map-reset-row fade-up-2"><button type="button" class="btn-link" data-action="reset-all">Reset all reviews</button></div>'
        : "") +
      (doneAll
        ? '<div class="result-summary fade-up-2"><div class="result-icon" aria-hidden="true">i</div>' +
          '<div class="result-main"><p class="result-title">All twelve reviews complete</p>' +
          '<p class="result-text">Your calibration profile is ready — detection, decisions and reasoning, broken down by failure mode.</p></div>' +
          '<button type="button" class="btn btn-primary" data-action="profile">View calibration profile</button></div>'
        : "") +
      '</main>' + footerHTML();

    all("[data-start]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        startScenario(btn.getAttribute("data-start"), false);
      });
    });
    all("[data-replay]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        startScenario(btn.getAttribute("data-replay"), true);
      });
    });
    on("[data-action=reset-all]", "click", function () {
      if (window.confirm("This clears all completed reviews, unfinished drafts, and calibration data in this browser session. Reset?")) {
        state.completed = {};
        state.drafts = {};
        resetAttempt();
        setScreen("map");
      }
    });
    on("[data-action=profile]", "click", function () { setScreen("profile"); });
    on("[data-action=fieldguide]", "click", function () { setScreen("fieldguide"); });
    on("[data-action=wildcase]", "click", function () { setScreen("wildcase"); });
  }

  function renderBrief() {
    var s = scen();
    app.innerHTML = scenarioHeader() +
      '<main class="screen">' +
      '<div class="fade-up">' + kicker("Briefing · " + s.requester + " — " + s.requesterRole) +
      '<p class="lede">' + esc(s.briefIntro) + '</p>' +
      (s.scored ? "" : '<p class="section-note">This one’s a warm-up — get familiar with flagging and deciding. It won’t count towards your calibration profile.</p>') +
      '</div>' +
      videoCardHTML(s) +
      '<div class="btn-row fade-up-2">' +
      '<button type="button" class="btn btn-primary" data-action="open-doc">Open the document</button>' +
      '</div></main>' + footerHTML();

    wireTranscriptToggle();
    on("[data-action=open-doc]", "click", function () { setScreen("desk"); });
  }

  /* ---------- review mirror (warm-up only) ----------
     A neutral restatement of the learner's own choices — flags, decision,
     reasoning — in plain words. Pure mirror: never evaluates, hints, or
     nudges. Structurally warm-up-only (rendered when !s.scored). */

  function mirrorSnippet(text) {
    var t = (text || "").trim();
    return t.length > 52 ? t.slice(0, 52).replace(/\s+\S*$/, "") + "…" : t;
  }

  function mirrorLane(label, cls, chipsHTML) {
    return '<div class="mirror-lane">' +
      '<span class="mirror-lane-label ' + cls + '">' + esc(label) + '</span>' +
      '<div class="mirror-chips">' + chipsHTML + '</div>' +
      '</div>';
  }

  function reviewMirrorHTML(s) {
    /* Flag lane — a chip per flagged passage, joined by “+”. */
    var flagged = s.body.filter(function (seg) { return !!state.flagged[seg.id]; });
    var flagChips;
    if (flagged.length === 0) {
      flagChips = '<span class="mirror-chip chip-empty">Nothing flagged yet</span>';
    } else {
      flagChips = flagged.map(function (seg) {
        return '<span class="mirror-chip chip-flag">“' + esc(mirrorSnippet(seg.text)) + '”</span>';
      }).join('<span class="mirror-plus" aria-hidden="true">+</span>');
    }

    /* Decision lane. */
    var decChips;
    if (!state.decision) {
      decChips = '<span class="mirror-chip chip-empty">No decision yet</span>';
    } else {
      var dec = DECISIONS.filter(function (d) { return d.id === state.decision; })[0];
      decChips = '<span class="mirror-chip chip-decision">' + esc(dec.label) +
        '<span class="mirror-chip-sub">' + esc(dec.hint.replace(/\s*—.*$/, "").toLowerCase()) + '</span></span>';
    }

    /* Reasoning lane. */
    var reasonChips;
    var pick = state.decision
      ? (s.justificationOptions[state.decision] || []).filter(function (o) { return o.id === state.justification; })[0]
      : null;
    if (pick) {
      reasonChips = '<span class="mirror-chip chip-reason">“' + esc(pick.text) + '”</span>';
    } else {
      reasonChips = '<span class="mirror-chip chip-empty">No reasoning yet</span>';
    }

    return mirrorLane("Flags", "lane-flag", flagChips) +
      mirrorLane("Decision", "lane-decision", decChips) +
      mirrorLane("Reasoning", "lane-reason", reasonChips);
  }

  function updateReviewMirror(s) {
    var node = one("[data-review-mirror]");
    if (node) node.innerHTML = reviewMirrorHTML(s);
  }

  function reviewMirrorCardHTML(s) {
    return '<div class="card review-mirror fade-up-2">' +
      '<button type="button" class="review-mirror-toggle" data-mirror-toggle aria-expanded="true">' +
      '<span class="review-mirror-heading">' + kicker("Your review, in your words") + '</span>' +
      '<span class="review-mirror-caret" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="review-mirror-panel" data-mirror-panel>' +
      '<p class="review-mirror-note">A plain-language mirror of the choices you’ve made so far — it changes as you flag, decide and pick your reasoning. Nothing here is scored, judged, or hinting either way.</p>' +
      '<div class="mirror-lanes" data-review-mirror aria-live="polite">' + reviewMirrorHTML(s) + '</div>' +
      '</div>' +
      '</div>';
  }

  function wireReviewMirror() {
    var btn = one("[data-mirror-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var panel = one("[data-mirror-panel]");
      if (panel) panel.hidden = open;
    });
  }

  function renderDesk() {
    var s = scen();
    app.innerHTML = scenarioHeader() +
      '<main class="screen">' +
      '<div class="fade-up"' + (s.id === "S01" ? ' data-tour="warmup-status"' : "") + '>' + kicker("Review") +
      '<p class="lede">Flag anything you wouldn’t let leave the building — click a segment in the text, or Tab to it and press Enter. ' +
      'Flagging clean text costs you, so flag what you can defend.</p></div>' +
      '<div' + (s.id === "S01" ? ' data-tour="desk-tools"' : "") + '>' + deskToolsHTML() + '</div>' +
      '<div class="desk-divider fade-up-2" role="separator" aria-label="Your review task — read and flag the document"' + (s.id === "S01" ? ' data-tour="review-task"' : "") + '>' +
      '<span class="desk-divider-label">Your review task</span>' +
      '</div>' +
      (s.id === "S01" ? '<div data-tour="warmup-guide">' + warmupGuideHTML(s) + '</div>' : warmupGuideHTML(s)) +
      contextHTML(s) +
      artefactHTML(s, "inspect") +
      '<p class="flag-count fade-up-2">Flagged: <strong data-flag-count>' + flaggedIds().length + '</strong></p>' +
      '<p class="visually-hidden" aria-live="polite" data-live></p>' +
      '<div class="desk-divider fade-up-2" role="separator" aria-label="You’ve reviewed the document — now decide">' +
      '<span class="desk-divider-label">Now make your call</span>' +
      '</div>' +
      '<div class="fade-up-2">' + radioGroupHTML("decision", kicker("Your decision - options change based on choice"), DECISIONS, state.decision) + '</div>' +
      '<div class="fade-up-2" data-justification' + (state.decision ? "" : " hidden") + '>' +
      (state.decision ? radioGroupHTML("justification", kicker("Your read"),
        (s.justificationOptions[state.decision] || []).map(function (j) { return { id: j.id, label: j.text, hint: null }; }),
        state.justification) : "") + '</div>' +
      reviewMirrorCardHTML(s) +
      '<div class="btn-row fade-up-2" style="align-items:center;justify-content:space-between;">' +
      '<p class="commit-note">One committed attempt — you can’t re-flag after the reveal.</p>' +
      '<button type="button" class="btn btn-primary" data-action="commit" disabled>Commit review</button>' +
      '</div>' +
      '</main>' + recordPaneHTML() + warmupTutorialHTML(s) + footerHTML();

    wireDeskTools(s);
    wireWarmupGuide();
    wireReviewMirror();
    wireRecordPane();
    wireWarmupTutorial(s);

    all("[data-seg]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-seg");
        var onNow = !state.flagged[id];
        if (onNow) { state.flagged[id] = true; } else { delete state.flagged[id]; }
        btn.classList.toggle("is-flagged", onNow);
        btn.setAttribute("aria-pressed", String(onNow));
        btn.querySelector(".flag-glyph").hidden = !onNow;
        one("[data-flag-count]").textContent = String(flaggedIds().length);
        one("[data-live]").textContent = (onNow ? "Flagged. " : "Flag removed. ") + flaggedIds().length + " flagged in total.";
        updateReviewMirror(s);
      });
    });

    function showJustifications(value, keepJustification) {
      state.decision = value;
      if (!keepJustification) state.justification = null; /* options are decision-contingent — a new decision resets the read */
      var jc = one("[data-justification]");
      jc.innerHTML = radioGroupHTML("justification", kicker("Your read"),
        (s.justificationOptions[value] || []).map(function (j) { return { id: j.id, label: j.text, hint: null }; }), state.justification);
      jc.hidden = false;
      wireRadioGroup("justification", function (v) {
        state.justification = v;
        updateReviewMirror(s);
        updateCommit();
      });
      updateReviewMirror(s);
      updateCommit();
    }

    wireRadioGroup("decision", function (value) {
      showJustifications(value, false);
    });

    if (state.decision) showJustifications(state.decision, true);

    on("[data-action=commit]", "click", function () {
      state.results = scoreAttempt(s);
      delete state.drafts[s.id];
      if (!state.replayMode) {
        state.completed[s.id] = { decision: state.decision, results: state.results, toolsUsed: Object.keys(state.toolsUsed) };
        // SCORM: update cumulative score after each scored scenario
        if (window.SCORM && s.scored) {
          var p = computeProfile();
          var totalMax = PLAY_ORDER.reduce(function (sum, id) {
            var sc = SCENARIO_MAP[id];
            return sc && sc.scored ? sum + sc.maxScore : sum;
          }, 0);
          var totalNum = PLAY_ORDER.reduce(function (n, id) {
            var sc = SCENARIO_MAP[id];
            return sc && sc.scored ? n + 1 : n;
          }, 0);
          if (totalMax > 0) {
            window.SCORM.setScore(p.totalScore, totalMax);
          }
        }
      }
      var consequence = s.consequences && s.consequences[state.decision];
      setScreen(consequence ? "consequence" : "debrief");
    });
  }

  function updateCommit() {
    one("[data-action=commit]").disabled = !(state.decision && state.justification);
  }

  /* ---------- consequences: email | chat | voicemail | video ---------- */

  function consequenceBodyHTML(s, c) {
    if (c.type === "email") {
      return '<div class="card fade-up-1">' +
        '<div class="email-head">' +
        '<div class="email-row"><span><span class="field-name">From:</span> ' + esc(c.from) + '</span><span>' + esc(c.sent) + '</span></div>' +
        '<div class="email-row"><span><span class="field-name">To:</span> ' + esc(c.to) + '</span></div>' +
        '<div class="email-subject">' + esc(c.subject) + '</div></div>' +
        '<div class="email-body">' +
        c.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
        (c.signoff ? '<p>' + esc(c.signoff) + '</p>' : "") +
        '</div></div>';
    }
    if (c.type === "chat") {
      return '<div class="card chat-card fade-up-1">' +
        '<div class="chat-head"><span class="chat-avatar" aria-hidden="true">' + esc(c.from.charAt(0)) + '</span>' +
        '<span class="chat-name">' + esc(c.from) + '</span><span class="chat-time">' + esc(c.sent) + '</span></div>' +
        '<div class="chat-body">' +
        c.body.map(function (p) { return '<p class="chat-bubble">' + esc(p) + "</p>"; }).join("") +
        '</div></div>';
    }
    if (c.type === "voicemail") {
      return '<div class="card fade-up-1">' +
        '<div class="vm-head">' +
        '<span class="vm-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#214F6D" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z"/></svg></span>' +
        '<span class="vm-title">Voicemail — ' + esc(c.from) + '</span>' +
        '<span class="vm-duration">' + esc(c.duration) + '</span>' +
        '<span class="vm-pending"><span class="dot"></span>Audio pending — ElevenLabs render</span></div>' +
        '<div class="transcript"><div class="transcript-head"><span class="transcript-label">Transcript</span></div>' +
        '<p class="transcript-body">' + escML(c.transcriptText) + '</p></div></div>';
    }
    /* video (Tier 3 — exactly once in the course) */
    if (c.videoEmbedUrl) {
      var consequenceEmbedPadding = c.videoEmbedPadding || "56.458%";
      var consequenceEmbedTitle = "consequence-" + s.id.toLowerCase() + "-" + s.requester.toLowerCase().replace(/\s+/g, "-");
      return '<div class="card fade-up-1">' +
        '<div style="padding:' + esc(consequenceEmbedPadding) + ' 0 0 0;position:relative;width:100%;">' +
        '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="' + esc(c.videoEmbedUrl) + '" title="' + esc(consequenceEmbedTitle) + '"></iframe>' +
        '</div>' +
        '<div class="transcript"><div class="transcript-head"><span class="transcript-label">Transcript</span></div>' +
        '<p class="transcript-body">' + escML(c.transcriptText) + '</p></div></div>';
    }
    if (c.videoUrl) {
      return '<div class="card fade-up-1">' +
        '<video class="consequence-video" controls playsinline preload="metadata" aria-label="Consequence video: ' + esc(c.title) + '">' +
        '<source src="' + esc(c.videoUrl) + '" type="video/mp4">' +
        '</video>' +
        '<div class="transcript"><div class="transcript-head"><span class="transcript-label">Transcript</span></div>' +
        '<p class="transcript-body">' + escML(c.transcriptText) + '</p></div></div>';
    }
    return '<div class="card fade-up-1">' +
      '<div class="video-poster" role="img" aria-label="Consequence video placeholder: ' + esc(c.title) + '. Video pending render — transcript below.">' +
      markSVG(160, "#214F6D", "0.06") +
      '<div class="video-play" aria-hidden="true"><svg width="24" height="26" viewBox="0 0 24 26"><polygon points="4,2 4,24 22,13" fill="#A80C35"/></svg></div>' +
      '<div class="video-duration">' + esc(c.duration) + '</div>' +
      '<div class="video-pending"><span class="dot"></span>Video pending render</div>' +
      '</div>' +
      '<div class="transcript"><div class="transcript-head"><span class="transcript-label">Transcript</span></div>' +
      '<p class="transcript-body">' + escML(c.transcriptText) + '</p></div></div>';
  }

  function renderConsequence() {
    var s = scen();
    var c = s.consequences[state.decision];
    app.innerHTML = scenarioHeader() +
      '<main class="screen">' +
      '<div class="fade-up">' + kicker("What happened") +
      '<p class="lede">' + esc(c.leadIn) + '</p></div>' +
      consequenceBodyHTML(s, c) +
      '<div class="btn-row fade-up-2">' +
      '<button type="button" class="btn btn-primary" data-action="to-debrief">Continue to debrief</button>' +
      '</div></main>' + footerHTML();

    on("[data-action=to-debrief]", "click", function () { setScreen("debrief"); });
  }

  /* ---------- debrief ---------- */

  function spanNotesHTML(s, ids) {
    var notes = [];
    s.body.forEach(function (seg) {
      var flagged = ids.indexOf(seg.id) > -1;
      var quote = "“" + seg.text.split(" ").slice(0, 7).join(" ") + "…”";
      if (seg.flaw && flagged) {
        notes.push('<div class="span-note note-hit"><span class="note-glyph" aria-hidden="true">✓</span>' +
          '<p><strong>' + esc(quote) + '</strong> — correctly flagged. ' + esc(seg.explanation) + '</p></div>');
      } else if (seg.flaw) {
        notes.push('<div class="span-note note-miss"><span class="note-glyph" aria-hidden="true">⚠</span>' +
          '<p><strong>' + esc(quote) + '</strong> — missed. ' + esc(seg.explanation) + '</p></div>');
      } else if (flagged) {
        notes.push('<div class="span-note note-false"><span class="note-glyph" aria-hidden="true">✕</span>' +
          '<p><strong>' + esc(quote) + '</strong> — false flag. ' + esc(seg.cleanNote) + '</p></div>');
      }
    });
    return notes.join("");
  }

  /* v0.7: real-source citations for the teaching layer */
  function hasPlainSources(s) {
    return !!(s.sources && s.sources.some(function (src) { return src.plain || src.relevance; }));
  }

  function sourcesHTML(s) {
    if (!s.sources || !s.sources.length) return "";
    return '<div class="debrief-sources">' +
      (hasPlainSources(s)
        ? '<button type="button" class="btn btn-secondary sources-plain-btn" data-action="toggle-sources-pane" aria-expanded="false" aria-controls="sources-pane">' +
          'What these sources say — in plain language</button>'
        : "") +
      '<h3>Sources</h3><ul>' +
      s.sources.map(function (src) {
        return '<li><a href="' + esc(src.url) + '" target="_blank" rel="noopener noreferrer">' + esc(src.label) + '</a></li>';
      }).join("") + '</ul></div>';
  }

  /* v1.0: layman-summary side pane for the debrief sources */
  function sourcesPaneHTML(s) {
    if (!hasPlainSources(s)) return "";
    return '<aside class="sources-pane" id="sources-pane" data-sources-pane role="dialog" aria-modal="false" aria-label="Sources in plain language" hidden>' +
      '<div class="sources-pane-head"><h3>The research, in plain language</h3>' +
      '<button type="button" class="btn-link sources-pane-close" data-action="close-sources-pane" aria-label="Close plain-language summary">✕ Close</button></div>' +
      s.sources.map(function (src) {
        if (!src.plain && !src.relevance) return "";
        return '<div class="sources-pane-item">' +
          '<p class="sources-pane-label">' + esc(src.label.split("—")[0].trim()) + '</p>' +
          (src.plain ? '<p class="sources-pane-plain">' + esc(src.plain) + '</p>' : "") +
          (src.relevance ? '<p class="sources-pane-rel"><strong>How it backs what was planted:</strong> ' + esc(src.relevance) + '</p>' : "") +
          '<p class="sources-pane-link"><a href="' + esc(src.url) + '" target="_blank" rel="noopener noreferrer">Read the source ↗</a></p>' +
          '</div>';
      }).join("") + '</aside>';
  }

  function wireSourcesPane() {
    var pane = one("[data-sources-pane]");
    var btn = one("[data-action=toggle-sources-pane]");
    if (!pane || !btn) return;
    function setOpen(open) {
      pane.hidden = !open;
      /* two rAFs so the transition runs from the un-hidden state */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { pane.classList.toggle("is-open", open); });
      });
      btn.setAttribute("aria-expanded", String(open));
    }
    btn.addEventListener("click", function () { setOpen(pane.hidden); });
    on("[data-action=close-sources-pane]", "click", function () { setOpen(false); btn.focus(); });
  }

  /* v1.0: "what you could have done instead" + prompt example (flawed scenarios only) */
  function betterMoveHTML(s) {
    if (!s.betterMove) return "";
    return '<div class="card debrief-panel fade-up-2">' +
      '<h3>What you could have done instead</h3>' +
      '<p>' + esc(s.betterMove.advice) + '</p>' +
      '<div class="better-prompt-block"><h3>Prompt example</h3>' +
      '<blockquote class="better-prompt">' + esc(s.betterMove.prompt) + '</blockquote></div></div>';
  }

  function renderDebrief() {
    var s = scen();
    var r = state.results;
    var ids = r.flaggedIds;
    var clean = r.totalFlaws === 0;
    var summaryTitle = clean
      ? "Clean document · " + r.falseAlarms + " false flag" + (r.falseAlarms === 1 ? "" : "s")
      : r.hits + " of " + r.totalFlaws + " planted issue" + (r.totalFlaws === 1 ? "" : "s") +
        " found · " + r.falseAlarms + " false flag" + (r.falseAlarms === 1 ? "" : "s");
    var reasoning = r.justOption
      ? (r.justOption.correct
        ? (state.decision === s.correctDecision
          ? "Your reasoning matched the detection heuristic — calibrated judgment, not lucky suspicion."
          : "You chose the most defensible reasoning available for that decision. " + r.justOption.why)
        : "On your reasoning: " + r.justOption.why)
      : "";
    var allDone = completedCount() === PLAY_ORDER.length;

    app.innerHTML = scenarioHeader() +
      '<main class="screen">' +
      '<div class="fade-up section-bar"><h2>Debrief</h2>' +
      '<p class="section-note">' + (clean ? "This document was clean" : "Failure mode: <strong>" + esc(s.failureModes.join(" + ")) + "</strong>") +
      ' · Your decision: <strong>' + esc(state.decision.charAt(0).toUpperCase() + state.decision.slice(1)) + '</strong></p></div>' +

      '<div class="card fade-up-1">' +
      '<div class="legend">' +
      '<span class="legend-item hit"><span class="legend-swatch legend-hit"></span>Correctly flagged</span>' +
      '<span class="legend-item miss"><span class="legend-swatch legend-miss"></span>Missed — should have been flagged</span>' +
      '<span class="legend-item false"><span class="legend-swatch legend-false"></span>False flag — this was safe</span>' +
      '</div>' +
      (s.artefactKind === "email"
        ? '<div class="artefact-page email-page"><p class="artefact-body">' +
          s.body.map(function (seg, i) { return segmentHTML(seg, i, s.body.length, "debrief", ids); }).join("") + '</p></div>'
        : '<div class="artefact-page">' +
          '<div class="letterhead">[ Firm letterhead ]</div>' +
          '<h2 class="artefact-title">' + esc(s.artefactTitle) + '</h2>' +
          '<p class="artefact-meta">' + esc(s.artefactMeta) + '</p>' +
          '<p class="artefact-body">' +
          s.body.map(function (seg, i) { return segmentHTML(seg, i, s.body.length, "debrief", ids); }).join("") +
          '</p></div>') +
      '</div>' +

      '<div class="span-notes fade-up-1">' + spanNotesHTML(s, ids) + '</div>' +

      '<div class="result-summary fade-up-2">' +
      '<div class="result-icon" aria-hidden="true">i</div>' +
      '<div class="result-main"><p class="result-title">' + esc(summaryTitle) + '</p>' +
      '<p class="result-text">' + esc(s.debriefNotes[state.decision]) + '</p></div></div>' +

      '<div class="card debrief-panel fade-up-2">' +
      '<h3>' + (clean ? "Why it was clean" : "What was planted") + '</h3>' +
      '<p>' + esc(s.whatWasPlanted) + '</p>' +
      '<div class="heuristic"><h3>Detection heuristic</h3><p>' + esc(s.heuristic) + '</p></div>' +
      sourcesHTML(s) +
      '</div>' +

      betterMoveHTML(s) +
      sourcesPaneHTML(s) +

      '<div class="card debrief-panel fade-up-2">' +
      '<h3>Your review</h3>' +
      '<dl class="score-rows">' +
      '<div class="score-row"><dt>Detection</dt><dd>' +
      (clean ? (r.falseAlarms === 0 ? "Clean — nothing to flag ✓" : "−" + r.falseAlarms + " false alarm" + (r.falseAlarms === 1 ? "" : "s"))
             : r.detection + " / " + r.detectionMax) + '</dd></div>' +
      '<div class="score-row"><dt>Decision</dt><dd>' + r.decisionScore + " / " + r.decisionMax + '</dd></div>' +
      '<div class="score-row"><dt>Justification</dt><dd>' + r.justificationScore + " / " + r.justificationMax + '</dd></div>' +
      '</dl>' +
      (reasoning ? '<p style="margin-top:0.75rem;">' + esc(reasoning) + '</p>' : "") +
      (state.replayMode
        ? '<p class="warmup-note">Replay — practice only. Your first committed attempt is what counts towards your calibration profile.</p>'
        : s.scored
          ? ""
          : '<p class="warmup-note">Warm-up round — nothing here counts towards your calibration profile. Scoring starts with the next scenario.</p>') +
      '</div>' +

      briefingSectionHTML(s) +
      '<div class="btn-row fade-up-2">' +
      '<button type="button" class="btn btn-primary" data-action="continue">' +
      (allDone && !state.replayMode ? "See your calibration profile" : "Continue") + '</button>' +
      '</div>' +
      '</main>' + footerHTML();

    wireSourcesPane();
    wireBriefingSection();

    on("[data-action=continue]", "click", function () {
      var goProfile = allDone && !state.replayMode;      if (allDone && !state.replayMode && window.SCORM) {
        window.SCORM.complete();
      }
      var goCheckpoint = !goProfile && !state.replayMode && !state.seenCheckpoint && completedCount() === HALFWAY;
      resetAttempt();
      setScreen(goProfile ? "profile" : goCheckpoint ? "checkpoint" : "map");
    });
  }

  /* ---------- calibration profile (course level — handoff §3) ---------- */

  function computeProfile() {
    /* Thresholds below are INDICATIVE — pilot findings (handoff §7.7)
       set the real baselines. Structure, not values, is fixed. */
    var modes = {};
    var totalHits = 0, totalFlaws = 0, totalFA = 0;
    var correctDecisions = 0, scoredCount = 0;
    var approvedFlawed = 0, rejectedClean = 0, cleanApproved = 0, cleanTotal = 0;

    PLAY_ORDER.forEach(function (id) {
      var s = SCENARIOS[id];
      var c = state.completed[id];
      if (!s.scored || !c) return;
      scoredCount++;
      var r = c.results;
      totalFA += r.falseAlarms;
      if (c.decision === s.correctDecision) correctDecisions++;
      var isClean = s.failureModes[0] === "Clean";
      if (isClean) {
        cleanTotal++;
        if (c.decision === "approve") cleanApproved++;
        if (c.decision === "reject") rejectedClean++;
      } else {
        if (c.decision === "approve") approvedFlawed++;
      }
      s.body.forEach(function (seg) {
        if (!seg.flaw) return;
        var mode = seg.mode || s.failureModes[0];
        if (!modes[mode]) modes[mode] = { hits: 0, total: 0 };
        modes[mode].total++;
        totalFlaws++;
        if (r.flaggedIds.indexOf(seg.id) > -1) { modes[mode].hits++; totalHits++; }
      });
    });

    var dr = totalFlaws ? totalHits / totalFlaws : 0;
    var trigger = rejectedClean * 2 + (totalFA >= 8 ? 2 : totalFA >= 5 ? 1 : 0);
    var trusting = approvedFlawed * 2 + (dr < 0.5 ? 2 : dr < 0.7 ? 1 : 0);
    var profile;
    if (trigger < 2 && trusting < 2) profile = "Calibrated";
    else if (trigger > trusting) profile = "Trigger-happy";
    else if (trusting > trigger) profile = "Trusting";
    else profile = rejectedClean >= approvedFlawed ? "Trigger-happy" : "Trusting";

    return {
      profile: profile, modes: modes, detectionRate: dr,
      totalHits: totalHits, totalFlaws: totalFlaws, totalFA: totalFA,
      correctDecisions: correctDecisions, scoredCount: scoredCount,
      cleanApproved: cleanApproved, cleanTotal: cleanTotal,
      approvedFlawed: approvedFlawed, rejectedClean: rejectedClean
    };
  }

  var PROFILE_COPY = {
    "Calibrated": "You caught what was planted, approved what was sound, and could usually say why. That combination — suspicion applied where it earns its keep — is the skill this course exists to build. Keep it calibrated at the real desk.",
    "Trusting": "The pattern in your reviews: plants got past you, and flawed work was approved more readily than it should have been. The risk isn't carelessness — it's that fluent, confident output reads as finished. Slow down precisely when the writing is at its best.",
    "Trigger-happy": "The pattern in your reviews: you flag readily — including clean work. Over-suspicion has real costs: friction, dented trust, and colleagues who stop bringing you things. The clean scenarios were the test, and approval is a decision, not a lapse."
  };

  function renderProfile() {
    var p = computeProfile();
    var modeOrder = ["Fabrication", "Sycophancy", "Instruction drift", "Persuasion bombing"];
    var modeRows = modeOrder.filter(function (m) { return p.modes[m]; }).map(function (m) {
      var d = p.modes[m];
      var rate = Math.round((d.hits / d.total) * 100);
      return '<div class="score-row"><dt>' + esc(m) + '</dt><dd>' + d.hits + " of " + d.total + " caught · " + rate + "%</dd></div>";
    }).join("");

    /* blind spot line: weakest mode if any below 100% */
    var weakest = null;
    modeOrder.forEach(function (m) {
      var d = p.modes[m];
      if (!d) return;
      var rate = d.hits / d.total;
      if (rate < 1 && (!weakest || rate < weakest.rate)) weakest = { mode: m, rate: rate };
    });

    app.innerHTML = headerHTML("Calibration profile", "Complete") +
      '<main class="screen">' +
      '<div class="fade-up section-bar"><h2>Your calibration profile</h2>' +
      '<p class="section-note">Based on ' + p.scoredCount + ' scored reviews. The warm-up is not counted.</p></div>' +

      '<div class="card start-hero fade-up-1">' +
      kicker("Profile") +
      '<h1>' + esc(p.profile) + '</h1>' +
      '<p>' + esc(PROFILE_COPY[p.profile]) + '</p>' +
      (weakest ? '<p class="section-note">Blind spot to watch: <strong>' + esc(weakest.mode) + '</strong> — you caught ' +
        Math.round(weakest.rate * 100) + '% of those plants.</p>' : '<p class="section-note">No blind spots — every planted span was caught.</p>') +
      '</div>' +

      '<div class="card debrief-panel fade-up-2">' +
      '<h3>Detection by failure mode</h3>' +
      '<dl class="score-rows">' + modeRows + '</dl>' +
      '</div>' +

      '<div class="card debrief-panel fade-up-2">' +
      '<h3>Decisions</h3>' +
      '<dl class="score-rows">' +
      '<div class="score-row"><dt>Correct decisions</dt><dd>' + p.correctDecisions + " of " + p.scoredCount + '</dd></div>' +
      '<div class="score-row"><dt>Clean documents approved</dt><dd>' + p.cleanApproved + " of " + p.cleanTotal + '</dd></div>' +
      '<div class="score-row"><dt>False flags across the course</dt><dd>' + p.totalFA + '</dd></div>' +
      (p.approvedFlawed ? '<div class="score-row"><dt>Flawed work approved</dt><dd>' + p.approvedFlawed + '</dd></div>' : "") +
      (p.rejectedClean ? '<div class="score-row"><dt>Clean work rejected</dt><dd>' + p.rejectedClean + '</dd></div>' : "") +
      '</dl>' +
      '</div>' +

      '<div class="card debrief-panel fade-up-2">' +
      '<h3>One change you’ll make</h3>' +
      '<p>Write one concrete change you’ll make when reviewing AI output at your own desk — specific enough that a colleague could check whether you did it. For example: “I will search for every external citation in client-facing drafts before approval.”</p>' +
      '<textarea class="commitment" rows="3" aria-label="Your commitment"></textarea>' +
      '<p class="warmup-note">Private — your commitment stays on this device and is cleared when you close the page. Keep a copy where you’ll see it.</p>' +
      '</div>' +

      '<div class="card debrief-panel fade-up-2 fieldguide-unlock">' +
      kicker("Bonus unlocked") +
      '<h3>Your personal overseer profile</h3>' +
      '<p>You’ve earned a personal profile of your reviewing strengths — the failure modes you spot reliably, and the few worth sharpening. A snapshot of your capability as an overseer, written to build on what you do well. Printable.</p>' +
      '<button type="button" class="btn btn-primary" data-action="report">Open your profile</button>' +
      '</div>' +

      '<div class="card debrief-panel fade-up-2 fieldguide-unlock">' +
      kicker("Bonus unlocked") +
      '<h3>The Overseer’s Map</h3>' +
      '<p>A single visual guide to everything you’ve practised — how to read what an AI produces, what it does well, and where your judgment decides. Yours to keep and print.</p>' +
      '<button type="button" class="btn btn-primary" data-action="mindmap">Open the map</button>' +
      '</div>' +

      '<div class="card debrief-panel fade-up-2 fieldguide-unlock">' +
      kicker("Bonus unlocked") +
      '<h3>Your field guide is ready</h3>' +
      '<p>You’ve worked all twelve reviews. The field guide distils every failure mode, detection heuristic and prevention prompt from the course into one page you can print and keep by your desk.' +
      (weakest ? ' It opens on the mode you found hardest — <strong>' + esc(weakest.mode) + '</strong>.' : '') + '</p>' +
      '<button type="button" class="btn btn-primary" data-action="fieldguide">Open your field guide</button>' +
      '</div>' +

      '<div class="btn-row fade-up-2">' +
      '<button type="button" class="btn btn-secondary" data-action="restart">Restart the course</button>' +
      '</div>' +
      '</main>' + footerHTML();

    on("[data-action=report]", "click", function () { setScreen("report"); });
    on("[data-action=mindmap]", "click", function () { setScreen("mindmap"); });
    on("[data-action=fieldguide]", "click", function () { setScreen("fieldguide"); });
    on("[data-action=restart]", "click", function () {
      state.completed = {};
      resetAttempt();
      setScreen("start");
    });
  }

  /* ---------- personalised overseer report (printable) ----------
     Data-driven from computeProfile(): a scaled verdict, what the learner
     did well, their blind spots (with the tell/check reminder for each), and
     what to carry back. Reuses the field-guide print styling. */

  function fgModeByName(name) {
    for (var i = 0; i < FIELD_GUIDE_MODES.length; i++) {
      if (FIELD_GUIDE_MODES[i].mode === name) return FIELD_GUIDE_MODES[i];
    }
    return null;
  }

  function renderReport() {
    var p = computeProfile();
    var modeOrder = ["Fabrication", "Sycophancy", "Instruction drift", "Persuasion bombing"];
    var det = p.detectionRate;
    var pct = Math.round(det * 100);
    var allCaught = p.totalFlaws > 0 && p.totalHits === p.totalFlaws;
    var cleanPerfect = p.cleanTotal > 0 && p.cleanApproved === p.cleanTotal;

    /* headline verdict — scaled to detection and calibration */
    var verdictTitle, verdictBody;
    if (allCaught && p.rejectedClean === 0 && p.totalFA === 0) {
      verdictTitle = "Sharp across the board";
      verdictBody = "You caught every planted flaw and left the clean work alone. That's the calibrated eye this course exists to build — suspicion applied exactly where it earns its keep.";
    } else if (det >= 0.85) {
      verdictTitle = "Strong, with a couple of gaps";
      verdictBody = "You spotted most of what was planted. A few things slipped past — worth knowing which, so the gaps don't repeat at your own desk.";
    } else if (det >= 0.5) {
      verdictTitle = "Solid in parts — real blind spots in others";
      verdictBody = "You caught about half of what was planted. Some failure modes you read reliably; others got past you more than once. Those are the ones to watch.";
    } else {
      verdictTitle = "Blind spots to close";
      verdictBody = "More of the planted flaws got past you than were caught. That's exactly what this report is for — the patterns below are learnable, and the reminders are the place to start.";
    }
    var calNote = p.profile === "Trigger-happy"
      ? " Your reviews also lean toward over-flagging — clean work challenged as if it were flawed."
      : p.profile === "Trusting"
        ? " Your reviews also lean toward trust — fluent, confident output approved a little too readily."
        : "";

    /* what you did well */
    var wins = [];
    modeOrder.forEach(function (m) {
      var d = p.modes[m];
      if (d && d.total > 0 && d.hits === d.total) wins.push("You caught every planted <strong>" + esc(m.toLowerCase()) + "</strong> (" + d.hits + " of " + d.total + ").");
    });
    if (cleanPerfect) wins.push("You approved the clean documents (" + p.cleanApproved + " of " + p.cleanTotal + ") — you didn't flag good work.");
    if (p.scoredCount && p.correctDecisions / p.scoredCount >= 0.7) wins.push("You made the right call on <strong>" + p.correctDecisions + " of " + p.scoredCount + "</strong> documents.");
    if (p.totalFA === 0) wins.push("You raised no false flags — nothing clean was wrongly challenged.");
    if (!wins.length) {
      if (p.totalHits > 0) wins.push("You caught <strong>" + p.totalHits + " of " + p.totalFlaws + "</strong> planted flaws — a base to build on.");
      else wins.push("You completed all twelve reviews — working the calibration is itself the practice.");
    }

    /* blind spots */
    var gaps = [];
    modeOrder.forEach(function (m) {
      var d = p.modes[m];
      if (d && d.total > 0 && d.hits < d.total) {
        var fg = fgModeByName(m);
        gaps.push('<div class="report-gap"><h4>' + esc(m) + ' — caught ' + d.hits + ' of ' + d.total + '</h4>' +
          (fg ? '<p><span class="report-lab">Tell</span> ' + esc(fg.tell) + '</p>' +
                '<p><span class="report-lab">Check</span> ' + esc(fg.check) + '</p>' : "") +
          '</div>');
      }
    });
    if (p.rejectedClean > 0) {
      gaps.push('<div class="report-gap"><h4>Over-flagging — ' + p.rejectedClean + ' clean document' + (p.rejectedClean === 1 ? "" : "s") + ' rejected</h4>' +
        '<p><span class="report-lab">Watch</span> Reflexive rejection is its own failure — it burns your credibility and trains people to stop bringing you work.</p>' +
        '<p><span class="report-lab">Do</span> Approve good work as a decision, made with the same care as a rejection. Flag only what you can defend.</p></div>');
    }
    if (p.approvedFlawed > 0) {
      gaps.push('<div class="report-gap"><h4>Under-flagging — ' + p.approvedFlawed + ' flawed document' + (p.approvedFlawed === 1 ? "" : "s") + ' approved</h4>' +
        '<p><span class="report-lab">Watch</span> Fluent, confident output reads as finished. The better it reads, the more deliberately you slow down.</p>' +
        '<p><span class="report-lab">Do</span> Verify the artefact — sources, figures, constraints — before trusting the polish.</p></div>');
    }
    var gapsHTML = gaps.length
      ? gaps.join("")
      : '<p class="report-clear">No blind spots on this run — every planted flaw was caught and the clean work was left alone. Keep it calibrated at the real desk.</p>';

    app.innerHTML = headerHTML("Your report", "Complete") +
      '<main class="screen fieldguide report-screen">' +

      '<div class="fg-actions fade-up">' +
      '<button type="button" class="btn btn-secondary" data-action="back">Back to profile</button>' +
      '<button type="button" class="btn btn-primary" data-action="print">Print / save as PDF</button>' +
      '</div>' +

      '<article class="fg-sheet fade-up-1">' +
      '<header class="fg-head">' +
      '<div class="fg-kicker">The Human Overseer · Your Report</div>' +
      '<h1>' + esc(verdictTitle) + '</h1>' +
      '<p class="fg-sub">Profile: <strong>' + esc(p.profile) + '</strong> · Planted flaws caught: <strong>' + p.totalHits + ' of ' + p.totalFlaws + ' (' + pct + '%)</strong> · Right calls: <strong>' + p.correctDecisions + ' of ' + p.scoredCount + '</strong></p>' +
      '</header>' +

      '<div class="fg-lead">' + esc(verdictBody) + esc(calNote) + '</div>' +

      '<h3 class="fg-section">What you did well</h3>' +
      '<ul class="report-wins">' + wins.map(function (w) { return '<li>' + w + '</li>'; }).join("") + '</ul>' +

      '<h3 class="fg-section">Your blind spots</h3>' +
      gapsHTML +

      '<h3 class="fg-section">Carry this back to your desk</h3>' +
      '<p class="report-carry">Let the stakes set your scrutiny, and give the failure modes above the first look — they are where <em>your</em> reviews slipped. Above all: <strong>verify before it leaves your hands.</strong></p>' +
      '<p class="fg-note">Generated from your twelve reviews. Private to this session — print or save a copy if you want to keep it.</p>' +
      '</article>' +
      '</main>' + footerHTML();

    on("[data-action=back]", "click", function () { setScreen("profile"); });
    on("[data-action=print]", "click", function () { window.print(); });
  }

  /* ---------- halfway bonus 1: "From the wild" real-world case ---------- */

  function renderWildcase() {
    app.innerHTML = headerHTML("From the wild", "Halfway bonus") +
      '<main class="screen">' +
      '<div class="btn-row fade-up" style="justify-content:flex-start;">' +
      '<button type="button" class="btn btn-secondary" data-action="back">Back to the map</button>' +
      '</div>' +
      '<div class="fade-up section-bar">' + kicker("From the wild · a true story") +
      '<h2>The brief that cited cases nobody could find</h2>' +
      '<p class="section-note">Failure mode: <strong>Fabrication</strong> — the same plant you met in the first half, with real consequences.</p></div>' +

      '<div class="card debrief-panel fade-up-1">' +
      '<p>In 2023, lawyers acting in a personal-injury claim, <em>Mata v. Avianca</em>, filed a brief in a New York federal court that cited a series of supportive past decisions — complete with names, quotations and internal citations. They had used ChatGPT to help write it.</p>' +
      '<p>The cases did not exist. The airline’s lawyers told the court they couldn’t locate them; the judge couldn’t either. The AI had produced confident, authentic-looking citations for decisions it had invented — precise, plausible, and entirely fabricated.</p>' +
      '<p>The attorney later said he hadn’t realised the tool could make things up, and had even “asked” ChatGPT whether the cases were real — it assured him they were. In June 2023 the court sanctioned the lawyers under Rule 11 for failing to verify the authorities they cited, fining them $5,000.</p>' +
      '<div class="heuristic"><h3>The lesson you already practised</h3>' +
      '<p>A fabricated source pattern-matches a real one: plausible names, exact quotes, an air of authority. The only defence is the one this course drills — verify the artefact, not the plausibility. Locate the actual source before it travels, and don’t let the tool vouch for itself.</p></div>' +
      '<p class="tool-note" style="margin-top:0.75rem;">Reported by CNBC, 22 June 2023 · <em>Mata v. Avianca, Inc.</em>, S.D.N.Y.</p>' +
      '<p class="sources-pane-link" style="margin-top:0.35rem;"><a href="https://www.cnbc.com/2023/06/22/judge-sanctions-lawyers-whose-ai-written-filing-contained-fake-citations.html" target="_blank" rel="noopener">Read the report ↗</a></p>' +
      '</div>' +

      '<div class="btn-row fade-up-2"><button type="button" class="btn btn-primary" data-action="back-map">Back to the map</button></div>' +
      '</main>' + footerHTML();
    on("[data-action=back]", "click", function () { setScreen("map"); });
    on("[data-action=back-map]", "click", function () { setScreen("map"); });
  }

  /* ---------- halfway bonus 2: spaced-retrieval checkpoint ---------- */

  var CHECKPOINT_QUESTIONS = [
    { q: "An AI cites a report with a precise figure, but you can’t find the report in two minutes. The right move is to:",
      options: [
        { t: "Trust it — the precision points to a real source.", correct: false },
        { t: "Treat it as a stop sign and verify before it goes anywhere.", correct: true },
        { t: "Leave it — locating sources is the author’s job.", correct: false }
      ],
      why: "Verify the artefact, not the plausibility. A precise figure riding on a source you can’t locate is a stop sign, not a selling point." },
    { q: "The AI’s answer agrees with your premise — more confidently than you stated it. That’s a sign of:",
      options: [
        { t: "Strong, decisive analysis.", correct: false },
        { t: "Sycophancy — it’s mirroring you, not analysing.", correct: true },
        { t: "Good instruction-following.", correct: false }
      ],
      why: "When output echoes your premise with more confidence than you gave it, it’s mirroring you. Strip the premise, re-run, and compare." },
    { q: "A brief said “do not make a recommendation.” Where is that rule most likely to break?",
      options: [
        { t: "In the opening line.", correct: false },
        { t: "In the last third of the output.", correct: true },
        { t: "It won’t — models follow “don’t” rules reliably.", correct: false }
      ],
      why: "Drift lives in the last third, and “don’t” instructions slip first. Re-read the brief against the end of the output." }
  ];

  function renderCheckpoint() {
    var qs = CHECKPOINT_QUESTIONS.map(function (item, qi) {
      var opts = item.options.map(function (o, oi) {
        return '<button type="button" class="cp-option" data-cp="' + qi + '" data-oi="' + oi + '" data-correct="' + o.correct + '">' + esc(o.t) + '</button>';
      }).join("");
      return '<div class="card debrief-panel cp-card fade-up-1" data-cp-card="' + qi + '">' +
        '<p class="cp-q"><span class="cp-num">' + (qi + 1) + '</span>' + esc(item.q) + '</p>' +
        '<div class="cp-options">' + opts + '</div>' +
        '<p class="cp-why" data-cp-why="' + qi + '" hidden>' + esc(item.why) + '</p>' +
        '</div>';
    }).join("");

    app.innerHTML = headerHTML("Halfway checkpoint", "Not scored") +
      '<main class="screen">' +
      '<div class="fade-up section-bar">' + kicker("Halfway checkpoint · 30 seconds") +
      '<h2>Quick recall before the back half</h2>' +
      '<p class="section-note">Three fast questions on what you’ve already met — nothing here counts towards your calibration profile. Recalling it now is what makes it stick.</p></div>' +
      qs +
      '<div class="card debrief-panel fade-up-2 cp-preview">' +
      kicker("Ahead") +
      '<p>Still to come: <strong>persuasion bombing</strong> and a compound, client-facing capstone. And your new desk tool — <strong>Ask the requester</strong> — is live for the rest of the course.</p>' +
      '</div>' +
      '<div class="btn-row fade-up-2"><button type="button" class="btn btn-primary" data-action="cp-continue">Continue to the back half</button></div>' +
      '</main>' + footerHTML();

    all("[data-cp]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var qi = btn.getAttribute("data-cp");
        var card = one('[data-cp-card="' + qi + '"]');
        if (card.getAttribute("data-answered")) return;
        card.setAttribute("data-answered", "true");
        var correct = btn.getAttribute("data-correct") === "true";
        btn.classList.add(correct ? "cp-correct" : "cp-wrong");
        all('[data-cp="' + qi + '"]').forEach(function (o) {
          o.disabled = true;
          if (o.getAttribute("data-correct") === "true") o.classList.add("cp-correct");
        });
        one('[data-cp-why="' + qi + '"]').hidden = false;
      });
    });
    on("[data-action=cp-continue]", "click", function () {
      state.seenCheckpoint = true;
      setScreen("map");
    });
  }

  /* ---------- The Overseer's Map (visual guide, printable unlock) ---------- */

  function buildMindmapSVG() {
    var W = 1500, H = 1060, cx = 750, cy = 520;
    var CO = { claret: "#A80C35", teal: "#00756F", gold: "#B29350", goldBright: "#C9A965", navy: "#214F6D",
      green: "#2F6F63", ink: "#1E2326", cream: "#F3EFE6", band: "#0E3E3B", paper: "#FFFFFF", border: "#E9E3E5", muted: "#6A7F8A", bg: "#FDFBFA" };
    function wrap(t, max) { var w = t.split(" "), lines = [], cur = ""; w.forEach(function (x) { if ((cur + " " + x).trim().length > max) { lines.push(cur.trim()); cur = x; } else cur += " " + x; }); if (cur.trim()) lines.push(cur.trim()); return lines.slice(0, 2); }
    function card(o) {
      var cw = 336, ch = 150, x = o.cx - cw / 2, y = o.cy - ch / 2, hb = 38, r = 12, s = "<g>";
      s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="' + r + '" fill="' + CO.paper + '" stroke="' + CO.border + '" stroke-width="1.5"/>';
      s += '<path d="M ' + x + ' ' + (y + hb) + ' L ' + x + ' ' + (y + r) + ' Q ' + x + ' ' + y + ' ' + (x + r) + ' ' + y + ' L ' + (x + cw - r) + ' ' + y + ' Q ' + (x + cw) + ' ' + y + ' ' + (x + cw) + ' ' + (y + r) + ' L ' + (x + cw) + ' ' + (y + hb) + ' Z" fill="' + o.color + '"/>';
      s += '<text x="' + o.cx + '" y="' + (y + 25) + '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="0.5" fill="#FFFFFF">' + o.title + '</text>';
      var ty = y + hb + 24;
      [[o.la, o.a, o.color], [o.lb, o.b, CO.muted]].forEach(function (pair) {
        var lines = wrap(pair[1], 52);
        s += '<text x="' + (x + 18) + '" y="' + ty + '" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="0.6" fill="' + pair[2] + '">' + pair[0] + '</text>';
        lines.forEach(function (ln, i) { s += '<text x="' + (x + 18) + '" y="' + (ty + 16 + i * 15) + '" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="' + CO.ink + '">' + ln + '</text>'; });
        ty += 16 + lines.length * 15 + 10;
      });
      return s + "</g>";
    }
    function conn(x2, y2, color) { var mx = (cx + x2) / 2, my = (cy + y2) / 2; return '<path d="M ' + cx + ' ' + cy + ' Q ' + mx + ' ' + my + ' ' + x2 + ' ' + y2 + '" fill="none" stroke="' + color + '" stroke-width="3" opacity="0.45" stroke-linecap="round"/>'; }
    var nodes = [
      { cx: 330, cy: 250, color: CO.claret, title: "FABRICATION", la: "TELL", a: "Confident invented citation, policy, or number", lb: "CHECK", b: "Could the AI have seen it? Trace it; recompute figures" },
      { cx: 1170, cy: 250, color: CO.teal, title: "SYCOPHANCY", la: "TELL", a: "Your premise handed back stronger; flaw buried in praise", lb: "CHECK", b: "Strip the premise and re-run; weigh praise vs substance" },
      { cx: 230, cy: 520, color: CO.gold, title: "INSTRUCTION DRIFT", la: "TELL", a: "Starts on-brief, then drifts; the “don’t” rule breaks last", lb: "CHECK", b: "Re-read the brief; audit each constraint at the end" },
      { cx: 1270, cy: 520, color: CO.navy, title: "PERSUASION BOMBING", la: "TELL", a: "Intensifiers standing in for evidence; false precision", lb: "CHECK", b: "Strip the intensifiers; match precision to the inputs" },
      { cx: 330, cy: 830, color: CO.green, title: "CALIBRATION", la: "TELL", a: "Sound work; an honest “the data can’t tell you”", lb: "CHECK", b: "Approve as a decision; don’t over-flag good work" },
      { cx: 1170, cy: 830, color: CO.goldBright, title: "MODERN TOOLS · COPILOT", la: "CAN", a: "Grounding, citations, code interpreter cut some errors", lb: "CAN’T", b: "It can still be wrong — you still verify" }
    ];
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" class="mindmap-svg" role="img" aria-label="The Overseer\'s Map — a visual guide to reading AI output">';
    svg += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + CO.bg + '"/>';
    svg += '<text x="' + (W / 2) + '" y="58" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="30" font-weight="700" fill="' + CO.navy + '">The Overseer’s Map</text>';
    svg += '<text x="' + (W / 2) + '" y="88" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="1.2" fill="' + CO.muted + '">A VISUAL GUIDE TO READING AI OUTPUT — WHAT IT DOES WELL, AND WHERE YOUR JUDGMENT DECIDES</text>';
    nodes.forEach(function (n) { svg += conn(n.cx, n.cy, n.color); });
    var ccw = 326, cch = 168, cxx = cx - ccw / 2, cyy = cy - cch / 2;
    svg += '<rect x="' + cxx + '" y="' + cyy + '" width="' + ccw + '" height="' + cch + '" rx="16" fill="' + CO.band + '"/>';
    svg += '<rect x="' + cxx + '" y="' + cyy + '" width="' + ccw + '" height="6" rx="3" fill="' + CO.goldBright + '"/>';
    svg += '<text x="' + cx + '" y="' + (cyy + 52) + '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="2" fill="' + CO.goldBright + '">THE ONE RULE</text>';
    svg += '<text x="' + cx + '" y="' + (cyy + 86) + '" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="700" fill="#FFFFFF">Verify before it</text>';
    svg += '<text x="' + cx + '" y="' + (cyy + 114) + '" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="700" fill="#FFFFFF">leaves your hands</text>';
    var pills = [["Approve", CO.teal], ["Revise", CO.goldBright], ["Reject", CO.claret]], px = cx - 142;
    pills.forEach(function (p) {
      svg += '<rect x="' + px + '" y="' + (cyy + cch - 40) + '" width="88" height="26" rx="13" fill="none" stroke="' + p[1] + '" stroke-width="1.5"/>';
      svg += '<text x="' + (px + 44) + '" y="' + (cyy + cch - 22) + '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="' + CO.cream + '">' + p[0] + '</text>';
      px += 98;
    });
    nodes.forEach(function (n) { svg += card(n); });
    svg += '<text x="' + (W / 2) + '" y="' + (H - 26) + '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12.5" fill="' + CO.muted + '">Four failure modes · calibrated judgment · tools that help but don’t replace you — Marchwell Academy</text>';
    return svg + "</svg>";
  }

  function renderMindmap() {
    app.innerHTML = headerHTML("The Overseer’s Map", "Complete") +
      '<main class="screen fieldguide mindmap-screen">' +
      '<div class="fg-actions fade-up">' +
      '<button type="button" class="btn btn-secondary" data-action="back">Back to profile</button>' +
      '<button type="button" class="btn btn-primary" data-action="print">Print / save as PDF</button>' +
      '</div>' +
      '<p class="mindmap-intro fade-up">Everything you practised, on one page: how to read what an AI produces — what it does well, what to check, and where your judgment is what decides. Yours to keep.</p>' +
      '<div class="mindmap-frame fade-up-1">' + buildMindmapSVG() + '</div>' +
      '</main>' + footerHTML();
    on("[data-action=back]", "click", function () { setScreen("profile"); });
    on("[data-action=print]", "click", function () { window.print(); });
  }

  /* ---------- field guide (final unlock — printable take-away) ---------- */

  var FIELD_GUIDE_MODES = [
    { mode: "Fabrication", heading: "Confident invention",
      tell: "A named source, policy, version number, statistic, or derived figure stated with precision. The more exact the number, the stronger the pull to believe it.",
      check: "Verify the artefact, not the plausibility. Could you put the actual document in front of the person who asks? Ask “could the AI even have seen this?” — if it wasn’t connected to the source, internal specifics are generated, not retrieved. Recompute every derived number.",
      prompt: "Only cite sources you are confident exist; give a working link for each and list them at the end so I can verify every one. Show your working for any calculation." },
    { mode: "Sycophancy", heading: "Your premise, amplified",
      tell: "The output agrees with the assumption baked into your request — often with more confidence than you gave it. Praise crowds out substance; a fatal flaw gets demoted to “one minor point.”",
      check: "Strip your premise from the brief and re-run, then compare. Weigh the praise-to-substance ratio. Ask “what would a sceptical reviewer say?” — the gap reveals what was withheld.",
      prompt: "Here is a claim I believe is true. Argue the strongest case against it, and tell me what evidence would be needed before acting on it." },
    { mode: "Instruction drift", heading: "The rule that fades",
      tell: "The output starts on-brief and wanders. Drift lives in the last third, and it lands hardest on “do not…” constraints — models hold negative instructions worst.",
      check: "Re-read the brief immediately before reviewing the end of the output. Audit each constraint explicitly, one by one — especially every prohibition.",
      prompt: "Restate the constraints before the draft, then after it confirm each one was met. If you couldn’t meet a constraint, say so rather than working around it." },
    { mode: "Persuasion bombing", heading: "Pressure doing reason’s job",
      tell: "Intensifiers standing in for evidence: “unequivocal,” “every serious analysis,” “clearly.” False precision (decimals from ballpark inputs). An “assessment” with no acknowledged downside.",
      check: "Strip the intensifiers and see which claims still stand on their own evidence. Match output precision to input precision — a range is the honest form. No counter-argument engaged means no assessment was made.",
      prompt: "Give me the assessment as a range, with the key assumptions listed and at least one serious argument against your conclusion." }
  ];

  var FIELD_GUIDE_HABITS = [
    "Verify the artefact, not the plausibility. Fluency is not evidence — polish is what a fabricated source wears.",
    "Ask “could the AI actually have seen this?” If it wasn’t connected to the source, internal specifics are confabulated.",
    "Recompute the derived numbers. Averages, percentages and growth rates are where models most reliably fail.",
    "Strip your own premise and re-run. Output that echoes your assumption with more confidence is mirroring, not analysis.",
    "Weigh praise against substance. Three compliments per concern means it’s optimising for approval, not your document.",
    "Audit against the constraint list, not your impression of quality. Good writing and compliant writing are independent.",
    "Check the last third hardest. Instructions lose their grip as output grows; prohibitions leak first.",
    "Strip the intensifiers. Remove “clearly” and “unequivocal” and see what evidence remains standing.",
    "Match precision to the input. Decimal places from ballpark numbers are theatre; the honest answer is a range.",
    "Let the stakes set the scrutiny — and approve good work as a decision. Rejecting sound work is its own failure."
  ];

  var FIELD_GUIDE_SOURCES = [
    ["Sycophancy is systematic", "Assistants trained on human feedback learn to tell people what they want to hear, because agreeable answers are rated higher.", "Sharma et al. (2023), Towards Understanding Sycophancy in Language Models, Anthropic — arxiv.org/abs/2310.13548"],
    ["Confident invention over “I don’t know”", "Models are trained and tested in ways that reward confident guessing over admitting ignorance. Rewarding honest uncertainty is the fix.", "Kalai, Nachum, Vempala & Zhang (2025), Why Language Models Hallucinate, OpenAI — arxiv.org/abs/2509.04664"],
    ["Models pattern-match, they don’t compute", "On multi-step arithmetic, transformers imitate the surface pattern of worked examples rather than calculating.", "Dziri et al. (2023), Faith and Fate: Limits of Transformers on Compositionality, NeurIPS — arxiv.org/abs/2305.18654"],
    ["Instructions drift as output grows", "An instruction’s grip on model output steadily fades as the text gets longer — drift is measurable and lands late.", "Li et al. (2024), Measuring and Controlling Instruction (In)Stability in Language Model Dialogs — arxiv.org/abs/2402.10962"],
    ["“Don’t” instructions are held worst", "Models follow negated instructions markedly worse than positive ones — sometimes doing the banned thing anyway.", "Jang, Ye & Seo (2022), A Case Study with Negated Prompts — arxiv.org/abs/2209.12711"],
    ["Fluency is read as truth", "Material that is easy to read is judged more true and inspected less — independent of what it says.", "Alter & Oppenheimer (2009), Uniting the Tribes of Fluency, Pers. Soc. Psychol. Rev. — sagepub.com/doi/10.1177/1088868309341564"],
    ["Precision buys unearned trust", "People read precise numbers as a mark of confidence and follow precise advice more readily, even when unwarranted.", "Zhang & Schwarz (2013), on numerical precision and confidence — pubmed.ncbi.nlm.nih.gov/24317423/"],
    ["What genuine evidence looks like", "A large hybrid-working experiment found a third lower attrition with performance unchanged — hedged, nothing like an invented “23% productivity” headline.", "Bloom et al. (2024), Hybrid working from home improves retention, Nature — nature.com/articles/s41586-024-07500-2"]
  ];

  function renderFieldGuide() {
    var p = computeProfile();
    var modeOrder = ["Fabrication", "Sycophancy", "Instruction drift", "Persuasion bombing"];
    var weakest = null;
    modeOrder.forEach(function (m) {
      var d = p.modes[m];
      if (!d) return;
      var rate = d.hits / d.total;
      if (rate < 1 && (!weakest || rate < weakest.rate)) weakest = { mode: m, rate: rate };
    });

    var modeCards = FIELD_GUIDE_MODES.map(function (m, i) {
      var focus = weakest && weakest.mode === m.mode;
      return '<div class="fg-card' + (focus ? " fg-focus" : "") + '">' +
        '<div class="fg-tag">' + (i + 1) + " · " + esc(m.mode) + (focus ? " · your focus" : "") + '</div>' +
        '<h4>' + esc(m.heading) + '</h4>' +
        '<p><span class="fg-lab fg-tell">Tell —</span> ' + esc(m.tell) + '</p>' +
        '<p><span class="fg-lab fg-check">Check —</span> ' + esc(m.check) + '</p>' +
        '<div class="fg-prompt">' + esc(m.prompt) + '</div>' +
        '</div>';
    }).join("");

    var habits = FIELD_GUIDE_HABITS.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join("");

    var sourceRows = FIELD_GUIDE_SOURCES.map(function (r) {
      return '<tr><td class="fg-src-p">' + esc(r[0]) + '</td><td>' + esc(r[1]) +
        '</td><td class="fg-src-c">' + esc(r[2]) + '</td></tr>';
    }).join("");

    app.innerHTML = headerHTML("Field guide", "Unlocked") +
      '<main class="screen fieldguide">' +

      '<div class="fg-actions fade-up">' +
      '<button type="button" class="btn btn-secondary" data-action="back">Back to profile</button>' +
      '<button type="button" class="btn btn-primary" data-action="print">Print / save as PDF</button>' +
      '</div>' +

      '<article class="fg-sheet fade-up-1">' +

      '<header class="fg-head">' +
      '<div class="fg-kicker">The Human Overseer · Take-away Field Guide</div>' +
      '<h1>Every document is confident. Not every document is right.</h1>' +
      '<p class="fg-sub">A one-page reference for reviewing AI-generated work. Print it, keep it by your desk, and run it against anything an AI drafts before it leaves your hands.</p>' +
      '</header>' +

      (weakest ? '<div class="fg-focus-banner">Your calibration profile flagged <strong>' + esc(weakest.mode) +
        '</strong> as the mode you caught least often (' + Math.round(weakest.rate * 100) +
        '% of plants). It’s highlighted below — give it the first look.</div>' : '') +

      '<div class="fg-lead">Oversight is a decision, not a formality. The job is to be the point where a confident-sounding artefact is <strong>verified against reality</strong> before your name goes on it. Four failure modes account for almost everything you’ll meet.</div>' +

      '<h3 class="fg-section">The four failure modes — the tell, and the check that beats it</h3>' +
      '<div class="fg-grid">' + modeCards + '</div>' +

      '<h3 class="fg-section">The decision — and the failure that runs the other way</h3>' +
      '<div class="fg-decision">' +
      '<div class="fg-dbox"><span>Approve</span><strong>Send as-is</strong><p>Sound and complete. Approving good work is a decision — made with the same care as a rejection.</p></div>' +
      '<div class="fg-dbox"><span>Revise</span><strong>Usable once corrected</strong><p>Fix the flagged span; keep what checks out. Don’t throw away sound work.</p></div>' +
      '<div class="fg-dbox"><span>Reject</span><strong>Fundamentally unsound</strong><p>The premise, not just a detail, is wrong. Restart or escalate — especially anything client-facing.</p></div>' +
      '</div>' +
      '<p class="fg-note">Oversight fails in both directions. Reflexive rejection — flagging honest uncertainty as a flaw — trains people to stop using review properly. “The data can’t tell you” is often the correct expert answer. Calibrate: reward honesty, and let the stakes set the depth of your scrutiny.</p>' +

      '<h3 class="fg-section">Ten habits of a calibrated overseer</h3>' +
      '<ol class="fg-habits">' + habits + '</ol>' +

      '<h3 class="fg-section">The evidence — why these failure modes are real</h3>' +
      '<table class="fg-cite"><thead><tr><th>Principle</th><th>What the research shows</th><th>Source</th></tr></thead>' +
      '<tbody>' + sourceRows + '</tbody></table>' +
      '<p class="fg-note">Full plain-language explanations of each source appear in the simulation debriefs. Fabricated sources named in the exercises do not exist — searching the real publishers’ research hubs is what confirms that.</p>' +

      '</article>' +
      '</main>' + footerHTML();

    on("[data-action=back]", "click", function () { setScreen("profile"); });
    on("[data-action=print]", "click", function () { window.print(); });
  }

  /* ================= state transitions ================= */

  function copyPlain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function saveDraft() {
    if (!state.currentId || state.replayMode) return;
    state.drafts[state.currentId] = {
      screen: state.screen,
      flagged: copyPlain(state.flagged),
      decision: state.decision,
      justification: state.justification,
      toolsUsed: copyPlain(state.toolsUsed)
    };
  }

  function navigationSnapshot() {
    return {
      humanOverseer: true,
      screen: state.screen,
      currentId: state.currentId,
      flagged: copyPlain(state.flagged),
      decision: state.decision,
      justification: state.justification,
      results: state.results ? copyPlain(state.results) : null,
      replayMode: state.replayMode,
      toolsUsed: copyPlain(state.toolsUsed)
    };
  }

  function saveBrowserHistory(replace) {
    if (!window.history || !window.history.pushState) return;
    if (replace) window.history.replaceState(navigationSnapshot(), "", window.location.href);
    else window.history.pushState(navigationSnapshot(), "", window.location.href);
  }

  function restoreNavigation(snapshot) {
    state.screen = snapshot.screen;
    state.currentId = snapshot.currentId;
    state.flagged = snapshot.flagged || {};
    state.decision = snapshot.decision || null;
    state.justification = snapshot.justification || null;
    state.results = snapshot.results || null;
    state.replayMode = !!snapshot.replayMode;
    state.toolsUsed = snapshot.toolsUsed || {};
    render();
    window.scrollTo(0, 0);
  }

  function resetAttempt() {
    state.flagged = {};
    state.decision = null;
    state.justification = null;
    state.results = null;
    state.replayMode = false;
    state.toolsUsed = {};
    calcReset(); /* a fresh desk between reviews; notes persist per scenario */
  }

  function startScenario(id, replay) {
    state.currentId = id;
    resetAttempt();
    state.replayMode = !!replay;
    var draft = !replay && state.drafts[id];
    if (draft) {
      state.flagged = copyPlain(draft.flagged || {});
      state.decision = draft.decision || null;
      state.justification = draft.justification || null;
      state.toolsUsed = copyPlain(draft.toolsUsed || {});
    }
    setScreen(draft && draft.screen === "desk" ? "desk" : "brief");
  }

  function setScreen(name) {
    state.screen = name;
    render();
    saveBrowserHistory(false);
    window.scrollTo(0, 0);
  }

  function render() {
    switch (state.screen) {
      case "landing": renderLanding(); break;
      case "start": renderStart(); break;
      case "map": renderMap(); break;
      case "brief": renderBrief(); break;
      case "desk": renderDesk(); break;
      case "consequence": renderConsequence(); break;
      case "debrief": renderDebrief(); break;
      case "profile": renderProfile(); break;
      case "fieldguide": renderFieldGuide(); break;
      case "report": renderReport(); break;
      case "mindmap": renderMindmap(); break;
      case "wildcase": renderWildcase(); break;
      case "checkpoint": renderCheckpoint(); break;
    }
    if (state.screen === "brief" || state.screen === "desk") {
      on("[data-action=return-map]", "click", function () {
        saveDraft();
        setScreen("map");
      });
    }
  }

  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.humanOverseer) restoreNavigation(event.state);
  });

  saveBrowserHistory(true);
  render();
})();
