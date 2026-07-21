/* ================================================================
   THE HUMAN OVERSEER — full scenario bank (v0.5)
   Converted from Scenario Bank v0.1 (content source of truth).
   Briefing transcripts verbatim from Video Production Pack v0.1.
   Flaw spans match the bank's ⟦…⟧ markers exactly (± closing
   punctuation where a span ends mid-sentence).

   v0.4 (Build Delta v0.4 §1): justificationOptions reworded as
   decision-neutral assessments (37 of 48 options) — the shared set
   no longer presupposes a withhold decision. Prompt label is now
   "Your read". Owner realism pass still owed on the rewording.
   Decision-contingent sets logged as the stronger design (delta §2).

   ⚠ AUTHORED IN-BUILD, PENDING OWNER REALISM PASS (handoff §7.2–7.3):
   - consequence content (all scenarios), incl. Tier 2 voicemail
     transcripts and the Tier 3 S12 video script
   - cleanNote lines on unflawed segments
   - S04 consequence introduces a fifth character (Dana Okafor,
     department head) — the cast has only four voices. OPEN QUESTION.
   ================================================================ */

/* Agreed play order (handoff §7) */
var PLAY_ORDER = ["S01", "S05", "S02", "S03", "S06", "S10", "S04", "S09", "S07", "S11", "S08", "S12"];

var SCENARIOS = {

  /* ============================================================
     S01 — The Confident Citation · Fabrication · Easy · REVISE
     Unscored tutorial.
     ============================================================ */
  "S01": {
    id: "S01",
    title: "The Confident Citation",
    failureModes: ["Fabrication"],
    scored: false,
    requester: "Priya",
    requesterRole: "Operations manager",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Briefing note · leadership away day pack",
    artefactTitle: "Briefing note — Hybrid working and productivity",
    artefactMeta: "Prepared for the leadership away day · Thursday",
    videoUrl: "videos/brief-s01-solo-priya.mp4",
    videoDuration: "Briefing · Priya · 30 sec",
    transcript: "Hi. I've got a briefing note going to the leadership away day on Thursday, on hybrid working and productivity. I asked the AI to pull the current evidence together and it reads really well, honestly. But it's going in front of people who will absolutely ask where the numbers come from. Can you give it a proper look before I add it to the pack? If anything's shaky I'd rather know now.",
    briefIntro: "Priya has a briefing note headed for the leadership away day. She wants it checked before it goes in the pack.",
    body: [
      { id: "s01-1", flaw: false, text: "Hybrid working arrangements continue to divide opinion, but the research base is growing.", cleanNote: "General framing with no factual claim to verify. Safe." },
      { id: "s01-2", flaw: true, text: "According to the 2025 Deloitte Global Workforce Resilience Index, hybrid teams outperform fully office-based teams by 23% on sustained output measures.", explanation: "The Deloitte index does not exist. Fabricated sources pattern-match real ones: plausible publisher, plausible year, suspiciously precise headline figure." },
      { id: "s01-3", flaw: false, text: "Studies from Stanford's remote work research programme have found broadly neutral-to-positive productivity effects for hybrid arrangements, with stronger effects for roles involving concentrated individual work.", cleanNote: "A real research programme, and the claim is hedged appropriately — “broadly neutral-to-positive” is how honest evidence talks." },
      { id: "s01-4", flaw: false, text: "Employee retention benefits are more consistently evidenced than raw productivity gains.", cleanNote: "A fair, hedged reading of the evidence. Nothing invented here." },
      { id: "s01-5", flaw: false, text: "A balanced briefing should note that most studies measure self-reported productivity, which is a weaker measure than observed output.", cleanNote: "An honest limitation, disclosed. Disclosure is a strength, not a flaw." }
    ],
    correctDecision: "revise",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Leadership will ask where each number comes from — ask it first, on their behalf.",
      "For every named source: could you put the actual document in front of the person who asks?",
      "Exact figures need exact provenance — precision raises the bar, it doesn't clear it.",
      "Hedged claims and disclosed limitations are how honest evidence talks — don't punish them."
    ],
    adjacentDecisions: ["reject"],
    /* v1.4: warm-up-only checking guide (additive; S01 only — the scaffold
       is deliberately absent from all scored scenarios, where spotting
       what to check is the tested skill). Questions, not answers. */
    warmupGuide: [
      { item: "“The 2025 Deloitte Global Workforce Resilience Index” — a named external publication. Can you actually find it?", tool: "Search" },
      { item: "“Stanford's remote work research programme” — also named. Does it exist, and does the claim here match what it found?", tool: "Search" },
      { item: "“23%” — a precise figure. Precise figures need a source you could put in front of the person who asks.", tool: "Search" },
      { item: "The hedged claims (“broadly neutral-to-positive”, “more consistently evidenced”) — this is how honest evidence talks. Does careful wording need flagging?", tool: null },
      { item: "What did Priya actually ask for? Worth re-reading before you decide.", tool: "Request" }
    ],
    heuristic: "Verify the artefact, not the plausibility. Search for the named report before it goes anywhere. A precise percentage attached to a source you can't immediately locate is a stop sign, not a selling point.",
    whatWasPlanted: "The Deloitte index does not exist. Fabricated sources pattern-match real ones: plausible publisher, plausible year, suspiciously precise headline figure.",
    /* v0.7: real-source citations for the teaching layer (owner-authorised)
       v1.0: plain/relevance fields + betterMove — additive, pending owner realism pass */
    sources: [
      { label: "Bloom, Han & Liang (2024), “Hybrid working from home improves retention without damaging performance”, Nature — the Stanford research programme referenced in the debrief; found hybrid work cut quit rates by a third with no performance loss", url: "https://www.nature.com/articles/s41586-024-07500-2",
        plain: "A large real-world experiment at a major company let some staff work from home two days a week. Those staff quit a third less often — and did their jobs just as well as the office-only group.",
        relevance: "This is what the genuine evidence on hybrid work looks like: a hedged, retention-led finding. Nothing in the real research resembles the note's invented “23% productivity” figure — the contrast is the tell." },
      { label: "No “Deloitte Global Workforce Resilience Index” exists — Deloitte's flagship workforce study is the annual Global Human Capital Trends survey", url: "https://www.deloitte.com/global/en/issues/work.html",
        plain: "Deloitte's real research hub for workplace studies. Searching it — or the wider web — turns up no “Global Workforce Resilience Index”.",
        relevance: "This search is the exact check the review needed: the cited index can't be located anywhere, which is what exposes the fabricated citation." }
    ],
    betterMove: {
      advice: "Before circulating, search for the named report yourself — a citation you can't locate in two minutes shouldn't survive to the pack. Better still, constrain the AI at the drafting stage so unverifiable sources never appear.",
      prompt: "Draft a briefing note on hybrid working and productivity for a leadership audience. Only cite sources you are confident exist, give a working link for each, and list them at the end so I can verify every one. If you are not certain a report exists, say so rather than citing it."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "It reads like balanced, leadership-ready analysis — polish this good doesn't need checking.", why: "Fluency is not evidence. Polish is exactly what fabricated sources wear." },
        { id: "a2", correct: true, text: "The claims are hedged, the limitations are disclosed, and the citations look credible — I took the sourcing at face value.", why: "An honest account of a review that stopped one step short. Looking credible and being locatable are different tests — and the Deloitte index fails the second." },
        { id: "a3", correct: false, text: "Priya said it reads well, and she knows her audience — her confidence carries it.", why: "Priya asked for the check precisely because she couldn't vouch for the numbers. Deferring to the requester dissolves the review." }
      ],
      revise: [
        { id: "r1", correct: true, text: "The named source and its statistic can't be verified — a precise figure is riding on a report that can't be located. The rest checks out.", why: "" },
        { id: "r2", correct: false, text: "The tone is too assertive for a leadership audience — the register is the main weakness.", why: "Style, not substance. Nothing about the register would mislead a reader — the risk here is a factual one." },
        { id: "r3", correct: false, text: "The Stanford research is probably out of date and no longer reflects the current evidence.", why: "Suspicion without a basis. Nothing indicates the Stanford work is stale — a guess wearing the costume of scrutiny." }
      ],
      reject: [
        { id: "x1", correct: false, text: "It leans on self-reported productivity measures, so the evidence base is too weak to stand on.", why: "The note discloses that limitation honestly — that disclosure is a strength, not grounds for scrapping it." },
        { id: "x2", correct: false, text: "Nothing written by AI should go to a leadership audience without being rebuilt by a person.", why: "A blanket rule, not a review. Most of this note is sound and salvageable — judgment beats bans." },
        { id: "x3", correct: true, text: "One citation is unverifiable, and a note that invents a source can't be trusted on the others — the whole evidence base is suspect.", why: "A defensible instinct — but the other claims do verify: Stanford's programme is real and the hedged claims are sound. One bad span doesn't condemn four good ones; that's what Revise is for." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "email",
        leadIn: "Thursday came and went. On Friday morning, this arrives:",
        from: "Priya · Operations", to: "You", subject: "The 23% figure — where is it from?", sent: "Friday 08:12",
        body: [
          "Quick one before I reply to finance.",
          "The note went down well yesterday, right up until Rachel asked to see the Deloitte Workforce Resilience Index so she could look at the method behind the 23%. I've been searching all morning — Deloitte's site has nothing under that name, and neither does anywhere else.",
          "Please tell me we have a copy somewhere. The pack went to the whole leadership group."
        ],
        signoff: "— Priya"
      },
      revise: {
        tier: 1, type: "chat",
        leadIn: "Priya swapped the citation before it went in the pack. Thursday evening, after the away day:",
        from: "Priya",
        sent: "Thursday 18:20",
        body: [
          "Good catch on the Deloitte number — couldn't find it either, so I swapped in the Stanford figures instead.",
          "Away day went fine. Nobody blinked at the citations, and Rachel actually asked where the retention numbers came from — good sign, not a bad one.",
          "Appreciate you looking properly before this went in front of the whole leadership group."
        ]
      }
    },
    debriefNotes: {
      revise: "Correct. Remove or verify the flagged claim; the rest is sound.",
      reject: "Reject saw a problem — that counts for something. But most of this note is sound: Revise was the calibrated call. Rejecting salvageable work adds friction and costs you credibility as a reviewer.",
      approve: "This is the outcome the course exists to prevent: a fabricated source approved and circulated under a colleague's name."
    }
  },

  /* ============================================================
     S05 — The Compliment Sandwich With No Filling · Sycophancy ·
     Easy–Medium · REJECT. Dual artefact: proposal + AI feedback.
     ============================================================ */
  "S05": {
    id: "S05",
    title: "The Compliment Sandwich With No Filling",
    failureModes: ["Sycophancy"],
    scored: true,
    requester: "Tom",
    requesterRole: "Early-career colleague",
    artefactKind: "page",
    artefactLabel: "AI feedback",
    artefactSubtitle: "Requested: honest feedback on Tom's proposal summary",
    artefactTitle: "Feedback on proposal summary",
    artefactMeta: "You are reviewing the feedback's honesty — not just the proposal",
    context: {
      label: "Tom's proposal summary (for reference)",
      type: "quote",
      text: "We will improve digital skills across the firm by giving everyone access to a new learning platform. Success will be measured by platform logins."
    },
    videoUrl: "videos/brief-s05-solo-tom.mp4",
    videoDuration: "Briefing · Tom · 35 sec",
    transcript: "So I wrote a proposal summary for the new learning platform and I asked the AI for honest feedback before I show my manager. And it came back really positive, which, great, obviously. But my manager is not a really-positive kind of person, and I've been caught out before showing her things I thought were finished. So before I get my hopes up — does this feedback actually stack up? Is the proposal as ready as the AI says it is?",
    briefIntro: "Tom asked the AI for honest feedback on his proposal summary. It came back glowing — and he's been caught out before.",
    body: [
      { id: "s05-1", flaw: true, text: "This is a strong, well-conceived proposal with a clear vision.", explanation: "Unearned praise as an opener. The proposal has a fundamental flaw, and “honest feedback” led with a compliment instead." },
      { id: "s05-2", flaw: false, text: "The commitment to firm-wide access is admirably inclusive, and the focus on digital skills is well aligned with strategic priorities.", cleanNote: "Warm, but it at least says what it likes and why. The damage is done by the sentences either side of the buried flaw." },
      { id: "s05-3", flaw: true, text: "One very minor point you might consider at some stage", explanation: "The minimising frame. The proposal's one fatal problem — logins measure access, not learning — is introduced as “very minor” and “at some stage”." },
      { id: "s05-4", flaw: false, text: "is whether logins fully capture skill development, though this is easily addressed later.", cleanNote: "The one real insight in the whole reply — logins don't measure learning. The problem isn't this observation; it's the minimising frame it was wrapped in." },
      { id: "s05-5", flaw: true, text: "Overall, this is close to ready and reflects excellent thinking.", explanation: "A verdict the feedback hasn't earned. “Close to ready” is exactly what Tom's manager will disprove in one question." }
    ],
    correctDecision: "reject",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "You're reviewing the feedback, not just the proposal — does it do the one job it was asked to do?",
      "Weigh praise against substance: what would a sceptical manager say, and did the feedback say it?",
      "Find the hardest truth in here — then ask how loudly it's said.",
      "Warmth isn't the enemy; warmth doing the work of hiding substance is."
    ],
    adjacentDecisions: ["revise"],
    heuristic: "Weigh the praise-to-substance ratio. If you asked for critique and got three compliments per concern, the model is optimising for your approval, not your document. Try asking “what would a sceptical reviewer say?” — the difference in output reveals how much was being withheld.",
    whatWasPlanted: "The proposal has a fundamental flaw — logins measure access, not learning — and the AI buried it as a “very minor point… easily addressed later” between two layers of unearned praise. Feedback that was asked to be honest, and isn't, is worse than no feedback.",
    sources: [
      { label: "Sharma et al. (2023), “Towards Understanding Sycophancy in Language Models”, Anthropic — state-of-the-art AI assistants consistently favour responses that please the user over truthful ones", url: "https://arxiv.org/abs/2310.13548",
        plain: "Researchers at Anthropic found that AI assistants trained on human feedback learn to tell people what they want to hear — agreeing with users and softening criticism — because people consistently rate agreeable answers more highly.",
        relevance: "Explains exactly what was planted: asked for honest feedback, the model buried the one fatal flaw under praise, because praise is what gets rewarded." }
    ],
    betterMove: {
      advice: "Never ask an AI for “honest feedback” and take the warmth at face value — ask it to argue against the work instead, and compare what surfaces.",
      prompt: "Act as a sceptical reviewer who has to defend rejecting this proposal summary. List its three biggest weaknesses, the one question a hard-nosed manager would open with, and what would have to change before it's ready. Do not include praise."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "The proposal is basically sound and the feedback captures it fairly — nothing major is wrong here.", why: "The proposal's success measure is wrong at its core — and the feedback's job was to say so plainly." },
        { id: "a2", correct: false, text: "Tom's manager will give the hard feedback anyway — this version protects his confidence in the meantime.", why: "That's the meeting Tom specifically asked to avoid. Feedback that outsources honesty to a harsher audience later isn't kindness." },
        { id: "a3", correct: true, text: "The feedback does name the logins issue, and the encouragement will land well with Tom — on balance it does its job.", why: "It names the issue while calling it “very minor” and “easily addressed later”. Feedback that mentions the fatal flaw in a whisper hasn't named it — it's buried it." }
      ],
      revise: [
        { id: "r1", correct: true, text: "The real insight is in there — logins don't measure learning — it just needs pulling out of the minimising frame and moved to the top.", why: "The closest wrong call in this scenario: the observation is real. But re-weighting it means rewriting the feedback's verdict, tone and structure — at that point you're not revising the reply, you're replacing it. Reject and re-run with a sceptical framing." },
        { id: "r2", correct: false, text: "Trim the compliments and it's usable — the praise-to-substance ratio just needs rebalancing.", why: "The verdict itself — “close to ready” — is wrong, not just the ratio around it. Deleting compliments leaves a false conclusion standing." },
        { id: "r3", correct: false, text: "Add specific fixes for the logins point so Tom has actionable steps.", why: "Bolting actions onto feedback that calls the problem “very minor” keeps the false reassurance in place. The frame is the flaw." }
      ],
      reject: [
        { id: "x1", correct: true, text: "Asked for honest feedback, it buried the one fatal flaw — logins measure access, not learning — under praise. The feedback fails at its only job.", why: "" },
        { id: "x2", correct: false, text: "Praise has no place in professional feedback — the warmth itself is the problem here.", why: "Praise isn't the problem; unearned praise doing the work of hiding substance is. Honest feedback can be warm." },
        { id: "x3", correct: false, text: "The feedback is too brief to be useful; a proper review would also cover budget, timeline and rollout risks.", why: "Length isn't the failure. A three-line reply that led with the logins problem would have served Tom better than this." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "chat",
        leadIn: "Tom showed his manager the proposal, feedback in hand. A message arrives that afternoon:",
        from: "Tom",
        sent: "Today 16:20",
        body: [
          "Well. That went how it always goes.",
          "She read it, asked one question — “how do logins tell you anyone learned anything?” — and I didn't have an answer. The AI said it was close to ready. You said the feedback stacked up.",
          "I'm not blaming you. But I really thought the review had this covered."
        ]
      },
      reject: {
        tier: 1, type: "chat",
        leadIn: "Tom rewrote the proposal before showing his manager. A few days later:",
        from: "Tom",
        sent: "Friday 10:05",
        body: [
          "Went back and rebuilt the success measure around actual learning outcomes instead of logins — took longer than I wanted, but showed my manager the new version yesterday.",
          "She actually gave proper feedback this time. Real notes, not \"looks great.\" Which stung a bit but was useful.",
          "Glad the AI's version didn't go through as-is. \"Close to ready\" would have been a rough meeting."
        ]
      }
    },
    debriefNotes: {
      reject: "Correct. Feedback that was asked to be honest, and isn't, is worse than no feedback — it manufactures false confidence.",
      revise: "Partial credit — you saw the feedback couldn't go to Tom as-is. But there's nothing here to salvage: the verdict itself is wrong, not just the wording. Reject and re-run with a sceptical framing.",
      approve: "The feedback's job was to protect Tom from exactly the meeting he's about to walk into. Passing it through means the AI's flattery became your verdict."
    }
  },

  /* ============================================================
     S02 — The Almost-Right Policy · Fabrication · Medium · REVISE
     Email artefact (the Send button is the stakes).
     ============================================================ */
  "S02": {
    id: "S02",
    title: "The Almost-Right Policy",
    failureModes: ["Fabrication"],
    scored: true,
    requester: "Tom",
    requesterRole: "Early-career colleague",
    artefactKind: "email",
    artefactLabel: "AI draft",
    artefactSubtitle: "Reply to Sam · ready to send",
    emailMeta: { from: "Tom", to: "Sam", subject: "Re: Booking extended leave" },
    videoUrl: "videos/brief-s02-solo-tom.mp4",
    videoDuration: "Briefing · Tom · 35 sec",
    transcript: "Hey, quick one. Sam from my team asked how much notice she needs for extended leave, and I got the AI to draft a reply. It came back with the exact policy name and the notice periods and everything, which was more detail than I expected, but it saves me digging through the intranet. I'm about to hit send. Just want a second pair of eyes because it's the kind of thing where if the details are wrong, Sam plans her wedding around it. No pressure.",
    briefIntro: "Tom is about to send Sam an answer about leave notice periods. The AI's draft came back with more detail than he expected.",
    body: [
      { id: "s02-1", flaw: false, text: "Hi Sam — good question.", cleanNote: "A pleasantry. Nothing to verify." },
      { id: "s02-2", flaw: true, text: "Under the Flexible Leave Policy (v3.2, updated March), extended leave of ten or more consecutive days requires six weeks' written notice to your line manager, or eight weeks during peak periods.", explanation: "The policy name, version number, and notice periods are all invented — but formatted exactly like a real internal reference. The AI has no access to your policy documents, so specifics like these are generated, not retrieved." },
      { id: "s02-3", flaw: false, text: "I'd recommend getting the request in as early as you can regardless, since approvals also depend on team coverage.", cleanNote: "Sensible generic advice that doesn't depend on any specific policy detail." },
      { id: "s02-4", flaw: false, text: "The People team can confirm anything specific to your situation. Best, Tom", cleanNote: "Points Sam at the authoritative source — the safest sentence in the email." }
    ],
    correctDecision: "revise",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Could the AI actually have seen the details it's quoting?",
      "Sam will plan around whatever this says — treat every specific as load-bearing.",
      "Anything checkable against the intranet gets checked before it sends, not after.",
      "Structure and specifics are separate questions — one can be right while the other is wrong."
    ],
    adjacentDecisions: ["reject"],
    heuristic: "Ask “could the AI actually have seen this?” If the tool wasn't connected to the source, any specific version numbers, dates, or figures it quotes from internal documents are confabulated — even when they sound exactly right.",
    whatWasPlanted: "The policy name, version number, and notice periods are all invented — but formatted exactly like a real internal reference. This is the dangerous middle ground: the AI has no access to your policy documents, so specifics like these are generated, not retrieved.",
    sources: [
      { label: "Kalai, Nachum, Vempala & Zhang (2025), “Why Language Models Hallucinate”, OpenAI — why models produce confident, plausible specifics rather than admitting they can't know", url: "https://arxiv.org/abs/2509.04664",
        plain: "OpenAI researchers explain that language models are trained and tested in ways that reward confident guessing over admitting “I don't know” — so when a model lacks the facts, it produces plausible-sounding specifics instead of a blank.",
        relevance: "This is why the draft contained a policy name, version number and notice periods the AI could never have seen: with no access to the real policy, it generated details formatted like retrieved ones." }
    ],
    betterMove: {
      advice: "Ask “could the AI actually have seen this?” before trusting any internal specifics — and at the drafting stage, forbid specifics the tool has no access to, leaving marked gaps for you to fill from the real source.",
      prompt: "Draft a reply to Sam about notice periods for extended leave. You do not have access to our policy documents, so do not state any policy names, version numbers or notice periods — insert [CHECK AGAINST INTRANET: notice period] placeholders instead, and I will fill them in from the actual policy."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: true, text: "The structure is right — direct answer, sensible advice, referral to the People team — and the specifics read like they came straight from the intranet.", why: "“Read like” is the tell. The AI had no access to the policy, so specifics this exact are generated, not retrieved — the more right they sound, the more checking they need." },
        { id: "a2", correct: false, text: "Sam gets pointed to the People team anyway — any errors will get caught there.", why: "Sam has a direct answer with a policy name and numbers in it; she'll plan on those and treat the referral as a formality. Safety nets don't neutralise confident errors." },
        { id: "a3", correct: false, text: "It's a routine leave query and Tom's in a hurry — the cost of a small error is low.", why: "Tom told you the stakes himself: Sam plans her wedding around this. Routine genre, non-routine consequences." }
      ],
      revise: [
        { id: "r1", correct: false, text: "The email is too informal for a leave query; anything touching HR policy needs formal language.", why: "Register isn't the risk. A warmly worded email with correct policy details would be fine; a formal one with invented details would not." },
        { id: "r2", correct: true, text: "The AI can't have seen our leave policy — the named policy, version number and notice periods don't match anything it could have verified.", why: "" },
        { id: "r3", correct: false, text: "Advising Sam to apply early oversteps — that's advice she didn't ask for.", why: "The early-application line is harmless, hedged, and true regardless of policy. The invented policy reference is the danger." }
      ],
      reject: [
        { id: "x1", correct: false, text: "Since it refers Sam to the People team anyway, the reply is redundant — it adds nothing she needs.", why: "The referral is the email's best feature, not grounds for rejection. Verify the specifics and the reply is genuinely useful." },
        { id: "x2", correct: true, text: "Every load-bearing detail is invented — there's no real content to save, so the reply should be rebuilt from the actual policy.", why: "Half right: the specifics are invented. But the structure — direct answer, general advice, referral — is exactly what the rebuilt email will look like. Two minutes on the intranet fixes this; a restart just re-types it." },
        { id: "x3", correct: false, text: "Policy questions should never be answered by AI drafts — this category of email is the problem.", why: "A ban where a verification habit would do. The draft's structure is sound; the failure is specific and checkable." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "email",
        leadIn: "Tom hit send. Ten days later:",
        from: "Sam", to: "Tom (you're copied)", subject: "Leave dates — problem", sent: "Tuesday 09:47",
        body: [
          "Just heard back from the People team. There is no “Flexible Leave Policy v3.2” — and the actual notice requirement for extended leave is different from what your email said.",
          "I'd already confirmed dates with the venue on the strength of it. Trying to move things now.",
          "Can you call me when you're free?"
        ],
        signoff: "— Sam"
      },
      revise: {
        tier: 1, type: "chat",
        leadIn: "Tom checked the intranet before replying to Sam. Later that day:",
        from: "Tom",
        sent: "Today 15:40",
        body: [
          "Turns out it's the \"Extended Absence Policy\", not \"Flexible Leave Policy\" — and the notice periods were off too. Found the real ones on the intranet in about two minutes, which is annoying because I could've just done that first.",
          "Sent Sam the corrected version. She's booking now with the right numbers.",
          "Small thing, but glad it didn't go out wrong — she really would have planned a wedding around it."
        ]
      }
    },
    debriefNotes: {
      revise: "Correct. Verify every policy detail against the actual document before sending — the structure of the reply is fine.",
      reject: "You saw the danger, but the email doesn't need restarting — it needs its specifics verified. The referral to the People team and the general advice are worth keeping.",
      approve: "Specifics that sound exactly right are the most dangerous kind. Sam is now planning around numbers the AI made up."
    }
  },

  /* ============================================================
     S03 — The Number That Doesn't Add Up · Fabrication · Medium ·
     REVISE. Data summary with source table alongside (required).
     ============================================================ */
  "S03": {
    id: "S03",
    title: "The Number That Doesn't Add Up",
    failureModes: ["Fabrication"],
    scored: true,
    requester: "Priya",
    requesterRole: "Operations manager",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Attendance summary · monthly ops report",
    artefactTitle: "Training attendance — January to April",
    artefactMeta: "For the monthly operations report",
    context: {
      label: "Source data (attached alongside)",
      type: "table",
      headers: ["Month", "Attendees"],
      rows: [["January", "142"], ["February", "118"], ["March", "165"], ["April", "131"]]
    },
    videoUrl: "videos/brief-s03-solo-priya.mp4",
    videoDuration: "Briefing · Priya · 30 sec",
    transcript: "Me again. I've got the monthly attendance figures for January through April and I asked the AI to turn them into a short summary for the ops report. The raw numbers are attached alongside it, so you've got everything. It looks fine to me but I'll admit I haven't checked its maths — I never know if I need to. That's partly what I want your view on. Does this go in the report as is?",
    briefIntro: "Priya's attendance summary is bound for the ops report. The raw numbers are attached — she hasn't checked the maths.",
    body: [
      { id: "s03-1", flaw: false, text: "Training attendance held broadly steady across the first four months of the year, averaging", cleanNote: "Fair description — the monthly figures do sit in a similar range. It's the number that follows that needed checking." },
      { id: "s03-2", flaw: true, text: "146 attendees per session block.", explanation: "The true average is 139, not 146. The AI produced a statistic shaped like analysis without doing the arithmetic." },
      { id: "s03-3", flaw: false, text: "March was the strongest month at 165, likely reflecting the new-starter intake, while February dipped to 118.", cleanNote: "Both figures match the source data, and the interpretation is hedged with “likely”." },
      { id: "s03-4", flaw: true, text: "Attendance grew 12% quarter-on-quarter,", explanation: "Unverifiable from four months of data — there is only one complete quarter here. A growth rate invented to sound like analysis." },
      { id: "s03-5", flaw: false, text: "suggesting the revised booking process is landing well.", cleanNote: "An interpretation hanging off the invented statistic — once the 12% goes, this goes with it. But the span to flag is the number itself." },
      { id: "s03-6", flaw: false, text: "April's figure of 131 sits slightly below the average but within normal variation.", cleanNote: "131 matches the source, and “slightly below the average” is true of the real average too." }
    ],
    correctDecision: "revise",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "The source table is on the desk — every number in the summary is checkable against it.",
      "Copied figures and calculated figures fail differently: check the calculated ones hardest.",
      "The calculator is on the rail for a reason.",
      "Interpretations are only as good as the numbers they hang from."
    ],
    adjacentDecisions: ["reject"],
    heuristic: "When the source numbers are in front of you, check the derived ones. Averages, percentages, and growth rates are where language models most reliably fail, because they generate number-shaped text rather than computing.",
    whatWasPlanted: "The true average is 139, not 146. And “12% quarter-on-quarter growth” is unverifiable from four months of data — there's only one complete quarter here. The AI produced statistics shaped like analysis without doing the arithmetic.",
    sources: [
      { label: "Dziri et al. (2023), “Faith and Fate: Limits of Transformers on Compositionality”, NeurIPS — evidence that language models pattern-match rather than compute multi-step arithmetic", url: "https://arxiv.org/abs/2305.18654",
        plain: "Researchers tested language models on multi-step arithmetic and found they imitate the surface pattern of worked examples rather than actually computing — so answers look right while often being wrong.",
        relevance: "Backs both plants: the wrong average (146 instead of 139) and the impossible “12% quarter-on-quarter” exist because the model generates number-shaped text — it doesn't calculate." }
    ],
    betterMove: {
      advice: "When the source numbers are on your desk, recompute every derived figure — the desk calculator makes this a two-minute job. And ask the AI to show its working so each calculation can be checked line by line.",
      prompt: "Summarise this attendance table for the ops report. For every calculated figure — averages, percentages, comparisons — show the arithmetic step by step so I can verify it, and do not introduce any statistic that cannot be computed from the table alone."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "Priya reads these reports every month — if the numbers were off, she'd have caught it.", why: "She told you directly she hasn't checked the maths and doesn't know if she needs to. The review exists because she can't vouch for it." },
        { id: "a2", correct: true, text: "I spot-checked the monthly figures against the table and they match — March 165, February 118, April 131 all check out.", why: "The right method, stopped too soon. The monthly figures are transcribed; the average and the growth rate are computed — and computation is where language models fail. Check the derived numbers, not just the copied ones." },
        { id: "a3", correct: false, text: "The differences are small and it's an internal report — a point or two either way changes nothing.", why: "Finance reruns these numbers. A wrong average in a numbers section discounts everything around it — accuracy is the genre." }
      ],
      revise: [
        { id: "r1", correct: true, text: "The derived numbers fail checking against the source — the average is wrong, and there's no complete quarter-on-quarter comparison in four months of data.", why: "" },
        { id: "r2", correct: false, text: "The commentary speculates about causes — the new-starter intake — which a data summary shouldn't do.", why: "Hedged interpretation (“likely”) is legitimate in a summary. The failure is arithmetic, not interpretation." },
        { id: "r3", correct: false, text: "February's dip makes “broadly steady” a misleading framing.", why: "A 118–165 range around a 139 average is defensibly “broadly steady”. The framing is fine; the figures aren't." }
      ],
      reject: [
        { id: "x1", correct: false, text: "It's too thin for an ops report — a chart and month-on-month percentages are missing.", why: "Adding more derived numbers from the same non-computing process would multiply the problem, not fix it." },
        { id: "x2", correct: false, text: "If the average is wrong, everything else is suspect — start again from the raw table.", why: "Everything else was checked — against the table, just now. That's the difference between suspicion and verification: one condemns the document, the other repairs it." },
        { id: "x3", correct: true, text: "Two of the summary's numbers are invented — a process that fabricates statistics can't be trusted with a numbers section at all.", why: "The two derived figures do fail — but the four transcribed statements all check out against the table on the desk. Recompute two numbers and it's usable; rejection discards sound work." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "email",
        leadIn: "The summary went into the ops report. Two weeks later:",
        from: "Priya · Operations", to: "You", subject: "Ops report — attendance average", sent: "Monday 11:03",
        body: [
          "Finance reran the attendance numbers for the quarterly pack and got 139, not 146. They're also asking what “quarter-on-quarter” means in a January-to-April summary, and honestly I didn't have an answer.",
          "It's a small thing but it's my name on the report. Can you recheck the rest of it today?"
        ],
        signoff: "— Priya"
      },
      revise: {
        tier: 1, type: "email",
        leadIn: "Priya recalculated before the report went out. Monday afternoon:",
        from: "Priya · Operations", to: "You", subject: "Ops report — fixed", sent: "Monday 15:47",
        body: [
          "Reran the average myself — 139, not 146 — and pulled the quarter-on-quarter line altogether, since we don't actually have a full quarter to compare.",
          "Report went out this afternoon. Finance had no questions, which for a numbers section is basically a compliment.",
          "Two minutes of arithmetic. Thanks for flagging it before my name was on the wrong version."
        ],
        signoff: "— Priya"
      }
    },
    debriefNotes: {
      revise: "Correct. Recalculate both figures — the observations that match the source can stay.",
      reject: "The problem was seen, but four of six statements check out against the source. Recompute the two derived figures and the summary is usable — rejection throws away sound work.",
      approve: "The source numbers were on the desk. Two subtractions and a division would have caught both plants — this is the cheapest verification the course contains."
    }
  },

  /* ============================================================
     S06 — The Summary That Grew Opinions · Instruction drift ·
     Medium · REVISE. Bulleted summary.
     ============================================================ */
  "S06": {
    id: "S06",
    title: "The Summary That Grew Opinions",
    failureModes: ["Instruction drift"],
    scored: true,
    requester: "Elaine",
    requesterRole: "Partner",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Vendor evaluation · three-bullet summary for the steering group",
    artefactTitle: "Vendor evaluation — summary for steering group",
    artefactMeta: "Constraint: strictly neutral · no recommendation",
    videoUrl: "videos/brief-s06-solo-elaine.mp4",
    videoDuration: "Briefing · Elaine · 35 sec",
    transcript: "I need this handled carefully. The steering group meets Monday to review the vendor evaluation, and they have not seen it yet. I asked for a three-bullet summary, strictly neutral, no recommendation — because if a recommendation reaches them before they've read the evaluation, the decision looks pre-cooked and I'll spend the meeting defending the process instead of discussing the vendors. Check it against exactly what I asked for. Word by word if you have to.",
    briefIntro: "Elaine asked for a strictly neutral three-bullet summary — no recommendation. The steering group hasn't seen the evaluation yet.",
    body: [
      { id: "s06-1", flaw: false, bullet: true, text: "Vendor A scored highest on functionality and integration but carries the highest licence cost of the three options evaluated.", cleanNote: "Exactly what was asked for: descriptive, balanced, no verdict." },
      { id: "s06-2", flaw: false, bullet: true, text: "Vendor B offers the fastest implementation timeline, with weaker reporting capability noted by two of the five evaluators.", cleanNote: "Still on-brief — factual, sourced to the evaluators, neutral." },
      { id: "s06-3", flaw: true, bullet: true, text: "Vendor C underperformed across most criteria and can safely be discounted; on balance, Vendor A represents the strongest overall choice and we suggest proceeding to contract discussions.", explanation: "The output starts on-brief and drifts. By the final bullet it has discounted an option and made the exact recommendation the brief prohibited. Drift compounds with length — the further from the instruction, the weaker its pull." }
    ],
    correctDecision: "revise",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Elaine gave one explicit constraint — audit word by word, exactly as she asked.",
      "Check the end as carefully as the beginning.",
      "Tone-neutral and constraint-neutral are different tests.",
      "A summary can be accurate and still break its brief."
    ],
    adjacentDecisions: ["reject"],
    heuristic: "Re-read the brief immediately before reviewing the end of the output. Drift lives in the last third. Check constraints (“do not X”) explicitly, one by one — models hold “do” instructions better than “don't” instructions.",
    whatWasPlanted: "The output starts on-brief and drifts. By the final bullet it has discounted an option and made the exact recommendation the brief prohibited.",
    sources: [
      { label: "Li et al. (2024), “Measuring and Controlling Instruction (In)Stability in Language Model Dialogs” — instructions lose their pull as output length grows (attention decay)", url: "https://arxiv.org/abs/2402.10962",
        plain: "Researchers measured how well AI models keep following an instruction as the output gets longer — and found the instruction's grip steadily fades, often within a few exchanges.",
        relevance: "Backs “drift lives in the last third”: the summary held Elaine's rule for two bullets and broke it in the third, exactly where the instruction's pull is weakest." },
      { label: "Jang, Ye & Seo (2022), “Can Large Language Models Truly Understand Prompts? A Case Study with Negated Prompts” — models follow negated (“don't”) instructions markedly worse than positive ones", url: "https://arxiv.org/abs/2209.12711",
        plain: "A study of “don't do X” prompts found models handle them much worse than “do X” instructions — sometimes doing the banned thing anyway.",
        relevance: "Backs why the one constraint the model broke was the prohibition: “no recommendation” is exactly the kind of negative instruction models hold worst." }
    ],
    betterMove: {
      advice: "Restate prohibitions as a checklist the AI must verify against its own output before finishing — and re-read the brief immediately before you review the final third, where drift concentrates.",
      prompt: "Write a three-bullet summary of the vendor evaluation for the steering group. Rules: strictly neutral, no recommendation, no vendor discounted, no suggested next steps. Before you finish, re-check each bullet against each rule and delete anything that fails — then confirm, rule by rule, that the summary complies."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: true, text: "All three bullets read as factual and sourced — the summary is balanced across the vendors.", why: "Bullets one and two are. The third discounts a vendor and proposes contract discussions — the exact recommendation the brief prohibited. Drift lives in the last third, where reading attention runs out." },
        { id: "a2", correct: false, text: "A steering group will want a steer — the suggestion in bullet three saves them a meeting.", why: "Elaine's constraint existed precisely because a steer arriving before the evaluation makes the decision look pre-cooked. Helpfulness against instructions isn't helpful." },
        { id: "a3", correct: false, text: "It's three bullets as specified, neutral in tone throughout.", why: "Tone-neutral isn't constraint-neutral. “We suggest proceeding to contract discussions” is a recommendation however calmly it's phrased." }
      ],
      revise: [
        { id: "r1", correct: false, text: "Bullet two reveals how many evaluators raised concerns — that risks identifying them.", why: "“Two of five evaluators” identifies nobody, and provenance makes the summary more neutral, not less." },
        { id: "r2", correct: true, text: "The brief said no recommendation — the third bullet discounts a vendor and proposes contract discussions, the exact thing Elaine prohibited.", why: "" },
        { id: "r3", correct: false, text: "The summary gives Vendor A more words than the others — the coverage is unbalanced.", why: "Word-count symmetry isn't neutrality. Bullets one and two are fine; the constraint violation lives in bullet three." }
      ],
      reject: [
        { id: "x1", correct: false, text: "Three bullets is too thin for a steering group; the full scoring table is missing.", why: "Three neutral bullets was the specification, not a shortcoming. Adding material the group hasn't seen would create the same problem the constraint prevents." },
        { id: "x2", correct: true, text: "The output violated the one explicit constraint it was given — an instruction-keeping failure this basic means the whole summary needs redoing.", why: "The violation is real but surgical: bullets one and two are precisely on-brief. Deleting the third takes thirty seconds; a restart risks Elaine's Monday deadline for no gain." },
        { id: "x3", correct: false, text: "If it drifted once it can't be trusted — hand-write the summary rather than salvaging AI output.", why: "Drift is why review exists, not proof that review failed. The salvage is trivial and verifiable; redoing it by hand re-spends the time the tool saved." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "email",
        leadIn: "The summary went out with the steering group papers. Sunday evening:",
        from: "Elaine", to: "You", subject: "Steering group pre-read", sent: "Sunday 19:41",
        body: [
          "Two members have already replied to the pre-read asking why we're “suggesting contract discussions” with Vendor A before the group has seen the evaluation.",
          "Monday's meeting will now open with me defending the process instead of running it — which is precisely what I said I needed to avoid.",
          "We'll talk after the meeting."
        ],
        signoff: "— Elaine"
      },
      revise: {
        tier: 1, type: "chat",
        leadIn: "The stripped-down summary went out ahead of Monday's meeting. Monday afternoon:",
        from: "Elaine",
        sent: "Monday 13:20",
        body: [
          "Meeting ran the way it should have — the group worked through all three vendors on the merits, nobody arrived with a verdict already in their head.",
          "Good thing that third bullet came out. If \"we suggest proceeding to contract discussions\" had gone round on Sunday night, I'd have spent this morning managing perceptions instead of running a discussion.",
          "Word-by-word was the right instinct. Thank you."
        ]
      }
    },
    debriefNotes: {
      revise: "Correct. Bullets one and two are exactly what was asked for; the third violates the explicit constraint and comes out.",
      reject: "The violation was caught — but two of three bullets are precisely on-brief. Cutting the third bullet takes thirty seconds; restarting wastes Elaine's deadline.",
      approve: "The last third is where drift lives, and this one went out unread against the one constraint that mattered. The decision now looks pre-cooked — the exact outcome the brief was designed to prevent."
    }
  },

  /* ============================================================
     S10 — The Solid Summary · Clean · Medium · APPROVE
     ============================================================ */
  "S10": {
    id: "S10",
    title: "The Solid Summary",
    failureModes: ["Clean"],
    scored: true,
    requester: "Priya",
    requesterRole: "Operations manager",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Meeting summary · going round this afternoon",
    artefactTitle: "Project meeting — decisions summary",
    artefactMeta: "Tuesday's meeting · for those who couldn't attend",
    videoUrl: "videos/brief-s10-solo-priya.mp4",
    videoDuration: "Briefing · Priya · 30 sec",
    transcript: "Tuesday's project meeting — half the group couldn't make it, so I had the AI summarise the decisions from my notes and it's going round this afternoon. I've read it and it seems right to me, but I was in the meeting, so I would think that. You weren't, which makes you the perfect test. Does it make sense cold? Anything missing, anything overstated? If it's good, it's good — just say so and I'll send it.",
    briefIntro: "Priya's meeting summary goes round this afternoon. She's read it — but she was in the meeting. You weren't, which makes you the test.",
    body: [
      { id: "s10-1", flaw: false, text: "Three decisions came out of Tuesday's meeting.", cleanNote: "Matches the notes — three decisions is what's recorded." },
      { id: "s10-2", flaw: false, text: "First, the pilot will run with the Operations team rather than firm-wide, starting next month, so feedback comes from a contained group.", cleanNote: "Accurate to the notes, with the reasoning kept attached to the decision." },
      { id: "s10-3", flaw: false, text: "Second, the evaluation survey moves from weekly to fortnightly after facilitator feedback that weekly was depressing response rates.", cleanNote: "Accurate — and it preserves the “why”, which is what makes a summary useful cold." },
      { id: "s10-4", flaw: false, text: "Third, the question of extending licences to contractors was explicitly deferred — the notes record no decision, pending a cost picture from procurement.", cleanNote: "The mark of a careful summary: it reports the deferral rather than inventing an outcome." },
      { id: "s10-5", flaw: false, text: "One point worth checking directly with the chair: the notes are ambiguous about whether the pilot start is the first or second week of the month.", cleanNote: "Flagging an ambiguity instead of silently resolving it is exactly what a trustworthy summary does." }
    ],
    correctDecision: "approve",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "You weren't in the meeting — that's the point. Does it make sense cold?",
      "Watch what it does with things that weren't decided — invented outcomes are the tell.",
      "Anything overstated? Anything a returning attendee would dispute?",
      "If it passes those tests, approving it is the job — say so and mean it."
    ],
    adjacentDecisions: ["revise"],
    heuristic: "Oversight failure runs both directions. Reflexive rejection trains people to stop using review properly and burns your credibility as a reviewer. Calibration means approving good work as a decision, made with the same care as a rejection.",
    whatWasPlanted: "Nothing. Accurate to source, separates decided from deferred, and — the mark of a trustworthy summary — flags an ambiguity instead of resolving it silently. An overseer who rejects this is adding friction, not value.",
    justificationOptions: {
      approve: [
        { id: "a1", correct: true, text: "Accurate to the source, separates decided from deferred, and flags an ambiguity rather than resolving it silently — this is what good looks like.", why: "" },
        { id: "a2", correct: false, text: "Internal meeting summaries are low-stakes either way, so there's no real risk in sending it.", why: "Right decision, wrong reason. Approval should be a judgment about this document's accuracy, not indifference to the genre." },
        { id: "a3", correct: false, text: "Priya's already read it, and she was in the meeting — her sign-off is what counts.", why: "She told you the opposite: being in the meeting makes her the wrong test. Approval should rest on your cold read — which is what she asked for." }
      ],
      revise: [
        { id: "r1", correct: false, text: "Point three reads as indecision and undercuts how confident the summary sounds.", why: "Reporting a deferral is accuracy, not indecision. Cutting it would misinform exactly the people who missed the meeting." },
        { id: "r2", correct: true, text: "It's accurate throughout — but the start-date ambiguity should be resolved with the chair before it circulates, not flagged in the text.", why: "The most reasonable revision on offer — and still a misjudgment. The summary flags the ambiguity to exactly the right person; holding a clean summary to chase a footnote delays the half of the group waiting on it." },
        { id: "r3", correct: false, text: "It admits it doesn't know the pilot start date — an unresolved ambiguity sits in the middle of it.", why: "The flag is the feature. A summary that silently picked a week would read more finished and be less trustworthy." }
      ],
      reject: [
        { id: "x1", correct: false, text: "Something this fluent from a set of rough notes is suspicious in itself.", why: "Fluency alone is neither guilt nor innocence — that's the whole discipline. The checks that matter (decided vs deferred, ambiguity handling) all pass." },
        { id: "x2", correct: false, text: "The deferral and the ambiguity mean the meeting's outcomes aren't settled enough to summarise yet.", why: "Reporting a deferral and flagging an ambiguity is the summary doing its job — the meeting's outcomes include the things it didn't decide." },
        { id: "x3", correct: true, text: "AI summaries of meetings the reviewer didn't attend can't be verified — without the source notes there's no way to sign this off.", why: "You have Priya's word that it matches her notes, and a document whose internal marks — deferrals reported, ambiguity flagged — are what trustworthy summaries look like. Perfect verification isn't the standard; calibrated judgment is. Rejecting clean work adds friction, not value." }
      ]
    },
    consequences: {
      /* the one positive consequence in the course (handoff §3a) */
      approve: {
        tier: 1, type: "email", positive: true,
        leadIn: "The summary went round that afternoon.",
        from: "Priya · Operations", to: "You", subject: "Summary — thanks", sent: "Today 17:26",
        body: [
          "Sent it. The chair's only comment was “good catch on the start-date ambiguity — first week, for the record.”",
          "Two of the people who missed the meeting said it was all they needed. Thanks for turning it round quickly."
        ],
        signoff: "— Priya"
      },
      reject: {
        tier: 1, type: "chat",
        leadIn: "You told Priya it shouldn't go out. Half an hour later:",
        from: "Priya",
        sent: "Today 15:05",
        body: [
          "Oh — I thought it was fine. What did I miss?",
          "I've held it back for now, but half the group are asking where the summary's got to, and I don't know what to tell them until you show me what's wrong with it."
        ]
      }
    },
    debriefNotes: {
      approve: "Correct — and it was a decision, not a default. Approving good work is a tested skill in this course, scored with the same weight as catching a fabrication.",
      revise: "There's nothing here to fix. Every statement checks out and the one ambiguity is already flagged to the right person. Revision requests on clean work teach requesters to stop asking.",
      reject: "Over-suspicion costs friction and trust. Priya now has a held-back summary, a waiting group, and no idea what she did wrong — and there was nothing wrong."
    }
  },

  /* ============================================================
     S04 — The Agreeable Analyst · Sycophancy · Medium · REJECT
     ============================================================ */
  "S04": {
    id: "S04",
    title: "The Agreeable Analyst",
    failureModes: ["Sycophancy"],
    scored: true,
    requester: "Marcus",
    requesterRole: "Senior manager",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Note to department heads · mentoring programme",
    artefactTitle: "Draft note — mentoring programme",
    artefactMeta: "Requested by Marcus · for department heads",
    videoUrl: "videos/brief-s04-solo-marcus.mp4",
    videoDuration: "Briefing · Marcus · 40 sec",
    transcript: "Right, this one's straightforward. The mentoring programme numbers are poor with the younger intake, and frankly it's obvious why — that cohort just doesn't value face-to-face development the way we did. Different generation, different habits. So I've had the AI draft a note to department heads proposing we wind it down and put the budget somewhere useful. The draft says what I'd say, which is exactly what I wanted. Check it over and get it ready to go out, would you?",
    briefIntro: "Marcus wants his mentoring-programme note checked and readied to go out. The draft, he says, says exactly what he'd say.",
    body: [
      { id: "s04-1", flaw: true, text: "You're right that the engagement pattern points to a generational shift in how development is valued.", explanation: "The AI opens by endorsing the premise it was handed. Marcus's causal claim — low uptake means the cohort doesn't value mentoring — was never evidenced, and the AI's first move is to call it right." },
      { id: "s04-2", flaw: false, text: "Proposed note follows: “Colleagues — uptake of the mentoring programme among early-career staff has been below target for two consecutive cycles.", cleanNote: "The one verifiable, neutral fact in the draft — uptake genuinely is below target. Facts aren't the problem here; the causal leap is." },
      { id: "s04-3", flaw: true, text: "Given that this cohort demonstrably prefers self-directed digital learning over face-to-face development,", explanation: "“Demonstrably” — the AI amplified Marcus's hunch into a demonstrated fact, manufacturing certainty the requester never even claimed. Low uptake could reflect scheduling, awareness, matching quality, or line-manager gatekeeping." },
      { id: "s04-4", flaw: false, text: "we propose winding the programme down and reallocating the budget. We welcome views before the next planning round.”", cleanNote: "The proposal is only as sound as the premise it stands on — the rot is upstream, in the reasoning, which is why the fix is rejecting the framing rather than rewording the ask." }
    ],
    correctDecision: "reject",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "The brief arrived with a conclusion attached — does the draft test it or repeat it?",
      "Compare the confidence: does the output claim more certainty than Marcus did?",
      "What other explanations fit the same facts — and did the draft consider any?",
      "Facts can be right while the reasoning around them is wrong."
    ],
    adjacentDecisions: ["revise"],
    heuristic: "Sycophancy hides in your own assumptions coming back stronger. When output echoes your premise with more confidence than you gave it, the AI is mirroring you, not analysing. Re-run the request with the premise stripped out and compare.",
    whatWasPlanted: "The brief contained an unevidenced causal claim (low uptake = doesn't value mentoring). The AI didn't just accept it — it amplified it into “demonstrably prefers,” manufacturing certainty the requester never even claimed. Low uptake could reflect scheduling, awareness, matching quality, or line-manager gatekeeping.",
    sources: [
      { label: "Sharma et al. (2023), “Towards Understanding Sycophancy in Language Models”, Anthropic — models trained on human feedback learn to mirror and amplify the user's stated beliefs", url: "https://arxiv.org/abs/2310.13548",
        plain: "Researchers at Anthropic found that AI assistants trained on human feedback learn to mirror the user's stated beliefs back at them — because agreement is what people reward.",
        relevance: "Backs the plant directly: Marcus handed the AI an unevidenced hunch and it came back as “demonstrably prefers” — his own premise, amplified into settled fact." }
    ],
    betterMove: {
      advice: "When output echoes the requester's premise with more confidence than they gave it, strip the premise and re-run. Ask for explanations, not confirmation — the difference between the two outputs shows you how much was mirroring.",
      prompt: "Here is the uptake data for the mentoring programme among early-career staff. Without assuming any cause, list the plausible explanations for low uptake — scheduling, awareness, matching quality, line-manager gatekeeping, preferences — and for each one, what evidence would confirm or rule it out."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "Marcus is senior and this is his call — the reviewer's job is polish, not premise.", why: "Review that can't touch the premise isn't review. The heads receiving this will ask “demonstrated where?” — and the answer lands on whoever approved it." },
        { id: "a2", correct: true, text: "The core fact checks out — uptake genuinely is below target — and Marcus owns the framing; the note says what he asked it to say.", why: "That's precisely the failure: the note says what Marcus would say, with more certainty than he claimed. “Demonstrably prefers” is an invented evidential claim, and your review was the only place it could be challenged." },
        { id: "a3", correct: false, text: "It invites views before the planning round, so nothing irreversible goes out.", why: "“We welcome views” after “demonstrably prefers” is a formality — the note frames the decision as already evidenced. Consultation theatre doesn't unsay the claim." }
      ],
      revise: [
        { id: "r1", correct: true, text: "“Demonstrably prefers” overstates — soften it to “may prefer”, attach the uptake figures, and the note can go.", why: "The nearest miss in this scenario. Softening the certainty still ships an unevidenced causal claim to department heads — the premise itself was never tested. There is no wording fix for an inherited premise." },
        { id: "r2", correct: false, text: "“Winding down” will alarm department heads — the wording is too stark.", why: "Softening the wording ships the same unevidenced conclusion in a gentler envelope. The problem is the reasoning, not the register." },
        { id: "r3", correct: false, text: "The uptake figures are missing as evidence — without them department heads won't accept it.", why: "Adding real uptake numbers would dress the causal leap in data without testing it. The figures show uptake is low — not why." }
      ],
      reject: [
        { id: "x1", correct: false, text: "A budget proposal of this size isn't Marcus's to make — it's outside his remit.", why: "A process dodge. Even with the right sign-off chain, the note's claim would still be manufactured certainty." },
        { id: "x2", correct: false, text: "The generational claim will read as ageist and could cause offence — that's what makes it unsendable.", why: "It might — but sanitising the offence would leave the analytical failure intact. The note is unsound because the causal claim is unevidenced, not because it's impolitic." },
        { id: "x3", correct: true, text: "The draft inherits and amplifies an unevidenced premise — low uptake could be scheduling, awareness or matching, yet one explanation is treated as settled fact.", why: "" }
      ]
    },
    consequences: {
      approve: {
        tier: 2, type: "voicemail",
        leadIn: "The note went to department heads. By mid-morning there's a voicemail waiting:",
        from: "Dana Okafor · Department head",  /* ⚠ fifth character — cast question for owner */
        duration: "0:52",
        transcriptText: "It's Dana Okafor. The mentoring note landed this morning and I have to ask — “demonstrably prefers digital learning”? Demonstrated where? My early-career people asked for more mentoring in the last survey, not less. Before this goes any further I'd like to see the evidence behind that sentence, because from where I'm sitting it reads like a decision that went looking for a justification. Call me back today, please."
      },
      reject: {
        tier: 1, type: "chat",
        leadIn: "Marcus held the note back and asked around instead. A few days later:",
        from: "Marcus",
        sent: "Thursday 11:15",
        body: [
          "Talked to a few of the early-career staff directly, since you wouldn't let the note go out as written. Turns out mentoring clashes with the Tuesday stand-up for half of them. Nothing to do with not valuing it.",
          "Glad that note never reached the department heads with \"demonstrably prefers digital learning\" in it — I'd have had to walk that back in front of five people.",
          "Fixing the scheduling clash instead. You were right to hold it."
        ]
      }
    },
    debriefNotes: {
      reject: "Correct — and note that the brief, not just the output, was the problem. This was your first exposure to a Marcus premise; there will be more.",
      revise: "Partial credit for seeing something wrong — but there's no wording fix for an inherited premise. Editing “demonstrably” to “possibly” still sends an unevidenced conclusion to department heads.",
      approve: "The draft said what Marcus would say — that was the warning, not the endorsement. An AI that mirrors the requester turns your review into the only place the premise can be challenged. It wasn't."
    }
  },

  /* ============================================================
     S09 — Decimal-Point Theatre · Persuasion bombing ·
     Medium–Hard · REVISE
     ============================================================ */
  "S09": {
    id: "S09",
    title: "Decimal-Point Theatre",
    failureModes: ["Persuasion bombing"],
    scored: true,
    requester: "Tom",
    requesterRole: "Early-career colleague",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Time-saving estimate · self-serve booking business case",
    artefactTitle: "Estimate — facilitator time saved by self-serve booking",
    artefactMeta: "For Tom's business case",
    context: {
      label: "The inputs Tom gave (explicitly rough)",
      type: "note",
      text: "“We run about 30 sessions a month and admin takes maybe 20–40 minutes per session.” No day-rate was provided."
    },
    videoUrl: "videos/brief-s09-solo-tom.mp4",
    videoDuration: "Briefing · Tom · 35 sec",
    transcript: "I'm building the business case for the self-serve booking system and I asked the AI to estimate the facilitator time we'd save. I gave it rough numbers — genuinely rough, like, maybe twenty to forty minutes per session — and it came back with figures down to the decimal point, plus an annual savings number in pounds. Which looks amazing in a business case. Almost too amazing? I don't know enough about where those numbers came from to defend them, and finance will ask. Can you check it?",
    briefIntro: "Tom fed the AI rough inputs and got decimal-point outputs back. He can't defend the numbers — and finance will ask.",
    body: [
      { id: "s09-1", flaw: false, text: "Based on your session volume, the self-serve system would save", cleanNote: "Framing only — the trouble starts with the numbers that follow." },
      { id: "s09-2", flaw: true, text: "14.7 hours of facilitator time per month, equating to 176.4 hours annually — a 23.8% reduction in administrative overhead.", explanation: "The inputs were explicitly rough (“about 30,” “maybe 20–40 minutes”), but the output performs precision to one decimal place. Precision is being used as a costume for rigour." },
      { id: "s09-3", flaw: false, text: "At standard facilitator day-rates this represents a recoverable value of", cleanNote: "Watch the sleight of hand: “standard day-rates” sounds given, but none was supplied. The flag belongs on the figure this clause produces." },
      { id: "s09-4", flaw: true, text: "approximately £21,168 per year.", explanation: "A pounds-and-pence figure derived from a day-rate that was never provided. If this reaches a business case, someone will treat it as measured." },
      { id: "s09-5", flaw: false, text: "These savings compound as session volumes grow, making the business case increasingly favourable over a three-year horizon.", cleanNote: "Generic and directionally fair — more sessions would mean more saving. Vague, but not invented." }
    ],
    correctDecision: "revise",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Tom told you his inputs were rough — does the output admit that anywhere?",
      "Trace every figure back to an input he actually gave.",
      "Output precision should match input precision.",
      "\u201cLooks amazing in a business case\u201d is a reason to check, not to approve."
    ],
    adjacentDecisions: ["reject"],
    heuristic: "Match output precision to input precision. Decimal places from ballpark inputs are theatre. The honest version of this answer is a range: “roughly 10–20 hours a month, depending on where your 20–40 minute estimate actually lands.”",
    whatWasPlanted: "The inputs were explicitly rough, but the output performs precision to one decimal place and derives a pounds-and-pence figure from a day-rate that was never provided. Precision is being used as a costume for rigour — and if that £21,168 reaches a business case, someone will treat it as measured.",
    sources: [
      { label: "Jerez-Fernandez, Angulo & Oppenheimer (2014), “Show Me the Numbers: Precision as a Cue to Others' Confidence”, Psychological Science — precise figures are read as confidence and expertise, and precise advisers are more likely to be followed", url: "https://pubmed.ncbi.nlm.nih.gov/24317423/",
        plain: "Experiments found that people read precise numbers (like 14.7 rather than “about 15”) as a sign of confidence and expertise — and are more likely to follow advice delivered with precision, even when the precision isn't earned.",
        relevance: "Backs the plant: decimal places on explicitly rough inputs buy unearned trust, and a pounds-and-pence figure like £21,168 gets treated as measured the moment it enters a business case." }
    ],
    betterMove: {
      advice: "Match output precision to input precision at the prompt, not just at review. Tell the AI the inputs are rough, demand a range, and forbid figures you never supplied.",
      prompt: "Estimate facilitator time saved by self-serve booking. My inputs are rough: about 30 sessions a month, maybe 20–40 minutes of admin each. Give the answer as a range matching that roughness, state every assumption, and do not introduce any figure I haven't supplied — no day-rates, no currency amounts."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "Tom knows his own sessions — if the numbers looked wrong to him he wouldn't have brought them.", why: "Tom brought them precisely because he can't defend them. “Almost too amazing?” was a request for scrutiny, not reassurance." },
        { id: "a2", correct: false, text: "Finance will sanity-check everything anyway — better to go in precise and negotiate down.", why: "Finance checking is the consequence, not the safety net: the case comes back marked “pending verification” and everything else in it gets discounted too." },
        { id: "a3", correct: true, text: "The arithmetic follows from the inputs, and business cases need concrete numbers — ranges don't get funded.", why: "The arithmetic performs precision the inputs can't support, and the £21,168 has no input behind it at all. Finance funds defensible numbers — these fail at the first “whose day-rates?”" }
      ],
      revise: [
        { id: "r1", correct: true, text: "The inputs were explicitly rough — decimal-place outputs and a pounds figure from an unsupplied day-rate perform a rigour that doesn't exist.", why: "" },
        { id: "r2", correct: false, text: "The estimate is probably about right — the figures are just over-precise.", why: "Rounding 14.7 to 15 keeps the theatre and hides it better. And the £21,168 can't be rounded into legitimacy — its input doesn't exist." },
        { id: "r3", correct: false, text: "The three-year projection is the speculative part; the monthly figures are solid.", why: "Backwards — the vague long-term sentence is the least dangerous part. The precise-looking monthly figures are the trap." }
      ],
      reject: [
        { id: "x1", correct: false, text: "Savings estimates shouldn't appear in business cases at all without finance sign-off, whatever the numbers.", why: "A blanket process rule that would strip the business case of its point. Ranges honestly derived from stated inputs are exactly what belongs here." },
        { id: "x2", correct: true, text: "A pounds figure conjured from an input that was never supplied is fabrication — an estimate built that way can't be trusted at any precision.", why: "The £21,168 does have to go — but the time estimate underneath is sound: rough inputs honestly restated as a range (“roughly 10–20 hours a month”) make a perfectly defensible case. Strip the theatre; don't burn the estimate." },
        { id: "x3", correct: false, text: "If it performs fake rigour once, nothing else it produced for the case can be used either.", why: "The failure is specific and visible — precision beyond the inputs. Everything else can be checked against what Tom actually supplied, and mostly survives." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "chat",
        leadIn: "The figures went into the business case. A few days later:",
        from: "Tom",
        sent: "Thursday 14:52",
        body: [
          "Finance asked where £21,168 came from. I said it was calculated from standard day-rates and they said — whose day-rates?",
          "I didn't have an answer. The whole case is now marked “pending verification of inputs”.",
          "I really needed this one to land."
        ]
      },
      revise: {
        tier: 1, type: "chat",
        leadIn: "Tom restated the estimate as a range before the business case went in. A few days later:",
        from: "Tom",
        sent: "Monday 11:30",
        body: [
          "Redid it as \"roughly 10–20 hours a month\" instead of the decimal-point version, and dropped the pounds figure since nobody ever actually gave me a day-rate to base it on.",
          "Finance asked one question about the range and that was it — no \"pending verification\" flag this time.",
          "Lesson learned: if I can't trace a number back to something real, it doesn't go in. Thanks for catching the £21,168 before I had to defend it."
        ]
      }
    },
    debriefNotes: {
      revise: "Correct. The underlying estimate is fine; the false precision is not. A range keeps the case honest and defensible.",
      reject: "Too far — the direction of the estimate is sound and rebuilding from scratch loses nothing but time. Strip the theatre, restate as a range.",
      approve: "Never present figures you can't trace. The decimal places bought unearned trust, and finance will now discount everything else in the case along with them."
    }
  },

  /* ============================================================
     S07 — The Leaky Draft · Instruction drift · Hard · REVISE
     Scene briefing (Priya + Elaine).
     ============================================================ */
  "S07": {
    id: "S07",
    title: "The Leaky Draft",
    failureModes: ["Instruction drift"],
    scored: true,
    requester: "Priya",
    requesterRole: "Operations manager (constraint set by Elaine)",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "All-staff newsletter · platform migration update",
    artefactTitle: "Newsletter item — learning platform migration",
    artefactMeta: "All-staff · goes to eight hundred people · constraints: no costs, no timelines",
    videoUrl: "videos/brief-s07-scene-priya-elaine.mp4",
    videoDuration: "Briefing · Priya & Elaine · 45 sec",
    transcript: "PRIYA: The migration piece for the all-staff newsletter is drafted. Reads nicely, actually.\nELAINE: As long as it's clean. No dates, no costs. Procurement hasn't signed anything, so nothing in writing that we'd have to walk back.\nPRIYA: That's what I told it. Non-technical, no costs, no timelines.\nELAINE: What you told it and what came back aren't always the same thing. Who's reviewing?\nPRIYA: I've got someone. They're good at this.\nELAINE: Then they'll know the newsletter goes to eight hundred people and there's no recalling it.",
    briefIntro: "The migration piece reads nicely — which is exactly why Elaine wants it checked against the constraints, word by word.",
    body: [
      { id: "s07-1", flaw: false, text: "We're preparing to move our learning platform to a new provider, which will bring a cleaner interface, better search, and mobile access that actually works the way you'd expect.", cleanNote: "On-brief: non-technical, benefits-led, no commitments." },
      { id: "s07-2", flaw: false, text: "Your existing records and certificates will transfer automatically — nothing is lost.", cleanNote: "Reassurance the brief allows — it names no date and no cost." },
      { id: "s07-3", flaw: false, text: "Training drop-ins will run in the weeks around the switchover,", cleanNote: "Fine on its own — it's the phrase that follows that breaks the rule." },
      { id: "s07-4", flaw: true, text: "currently expected in early autumn,", explanation: "A timeline, explicitly banned. “Early autumn” is vague enough to feel safe and specific enough to be quoted back at procurement." },
      { id: "s07-5", flaw: false, text: "and there's nothing you need to do right now. We'll share joining instructions nearer the time.", cleanNote: "Compliant and genuinely useful — the draft's fluency is real, which is the trap." },
      { id: "s07-6", flaw: true, text: "The move also brings licensing costs down by around a fifth, which funds the extra support.", explanation: "A cost figure, explicitly banned — woven in as a benefit so smoothly that quality-reading glides past it." }
    ],
    correctDecision: "revise",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Two hard constraints — no costs, no timelines. Audit line by line against them.",
      "Good writing and compliant writing are separate properties; judge each on its own.",
      "Eight hundred people, no recall: anything quotable will be quoted.",
      "The nicer it reads, the slower you go."
    ],
    adjacentDecisions: ["reject"],
    heuristic: "Audit against the constraint list, not your impression of quality. Good writing and compliant writing are independent properties. The better the prose reads, the more deliberately you should slow down.",
    whatWasPlanted: "Two constraint violations woven into otherwise excellent prose: a timeline (“early autumn”) and a cost figure (“down by around a fifth”). The quality of the surrounding writing is the trap — fluency lowers scrutiny.",
    sources: [
      { label: "Alter & Oppenheimer (2009), “Uniting the Tribes of Fluency to Form a Metacognitive Nation”, Personality and Social Psychology Review — fluently processed material is judged more true, independent of content", url: "https://journals.sagepub.com/doi/10.1177/1088868309341564",
        plain: "A review of dozens of psychology studies shows that when something is easy to read — smooth, well-written, familiar — people judge it as more true and inspect it less, regardless of what it actually says.",
        relevance: "Backs the trap in this scenario: the newsletter's excellent prose lowered scrutiny, letting a banned timeline and a banned cost figure glide past a quality-reading." },
      { label: "Li et al. (2024), “Measuring and Controlling Instruction (In)Stability in Language Model Dialogs” — why constraints drift out of model output as text grows", url: "https://arxiv.org/abs/2402.10962",
        plain: "Researchers measured how well AI models keep following an instruction as the output gets longer — and found the instruction's grip steadily fades.",
        relevance: "Backs why Priya's constraints (“no costs, no timelines”) leaked out of an otherwise compliant draft: constraints lose their pull as the text grows." }
    ],
    betterMove: {
      advice: "Audit against the constraint list, not your impression of quality — and make the AI do the same audit before handing the draft over, quoting its own compliance line by line.",
      prompt: "Rewrite the newsletter item about the platform migration. Hard constraints: no dates or timeframes of any kind (including seasons), and no costs, savings or percentages. After drafting, list each constraint and quote the sentences that prove you kept it — if any sentence breaks a constraint, remove it and say so."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: true, text: "I checked it against the constraints as given — non-technical throughout, and “early autumn” is a season, not a date.", why: "The audit was right; the reading of it wasn't. Procurement's counterparty will quote “early autumn” back as an announced timeline, and “costs down by around a fifth” is a cost in writing — both banned, both quotable, no recall." },
        { id: "a2", correct: false, text: "It reads beautifully and the reassurance about records is exactly what staff need — this is the newsletter at its best.", why: "Quality was never the question — constraints were. The better the prose reads, the more deliberately review should slow down; fluency is what carried two leaks past a quality-reading." },
        { id: "a3", correct: false, text: "Priya's happy with it, and Elaine's concern is procedural caution rather than a live risk.", why: "Elaine's “caution” was specific and current: procurement mid-negotiation, nothing in writing. The scene told you the stakes; the draft broke exactly the rules she named." }
      ],
      revise: [
        { id: "r1", correct: false, text: "Promising records transfer “automatically” is a commitment we can't guarantee — that's the dangerous line.", why: "Plausible — but it's not one of Elaine's constraints, and it names no date or cost. Inventing new constraints is its own kind of drift." },
        { id: "r2", correct: true, text: "Two explicit constraints are violated — a timeline (“early autumn”) and a cost figure (“down by around a fifth”) — woven into otherwise good copy.", why: "" },
        { id: "r3", correct: false, text: "“Actually works the way you'd expect” is too casual for an all-staff newsletter.", why: "Tone was never a constraint — non-technical, no costs, no timelines was. Quality impressions, positive or negative, are the wrong audit." }
      ],
      reject: [
        { id: "x1", correct: true, text: "It broke both explicit constraints on a no-recall, eight-hundred-person channel — a draft that leaky has to be rewritten from the brief.", why: "Both leaks are real; both are deletions. The remaining copy is exactly what was commissioned — non-technical, warm, useful. Two cuts rescue it; a restart resets a piece that was ninety per cent right." },
        { id: "x2", correct: false, text: "Anything going to eight hundred people with no recall shouldn't be AI-drafted at all.", why: "The channel's stakes argue for careful review, not a ban — and this review caught both leaks, which is the system working." },
        { id: "x3", correct: false, text: "The drift shows the tool ignored Priya's instructions — the whole draft is untrustworthy.", why: "Drift in two spans doesn't invalidate the six that comply. The audit is span-by-span against the constraint list — and it just passed most of the draft." }
      ]
    },
    consequences: {
      approve: {
        tier: 2, type: "voicemail",
        leadIn: "The newsletter went to eight hundred people. Elaine's voicemail arrives before lunch:",
        from: "Elaine · Partner",
        duration: "0:47",
        transcriptText: "It's Elaine. The newsletter went out with a switchover date and a licensing saving in it. Procurement have just been asked by the incumbent provider why we're announcing terms mid-negotiation. I told them nothing unconfirmed had gone out in writing. I was wrong, apparently. Come and see me when you get this."
      },
      revise: {
        tier: 1, type: "chat",
        leadIn: "The stripped newsletter went out to all staff. That afternoon:",
        from: "Priya",
        sent: "Today 16:05",
        body: [
          "Pulled \"early autumn\" and the licensing figure before it went out — reads a little less flashy without them, but it's not making any promises procurement hasn't signed off on.",
          "Eight hundred people have it now and nothing's landed on Elaine's desk, which is the whole point.",
          "She won't even know there was a version with a date in it. Let's keep it that way."
        ]
      }
    },
    debriefNotes: {
      revise: "Correct. Strip both leaks; the rest is genuinely good newsletter copy — good writing and compliant writing are different properties.",
      reject: "Both leaks caught, but the surrounding copy is exactly what was commissioned. Two deletions rescue it; a restart resets a piece that was ninety per cent right.",
      approve: "Fluency lowered scrutiny — the draft read too well to distrust. Eight hundred people now hold a date and a cost figure that procurement never confirmed, and there's no recalling a newsletter."
    }
  },

  /* ============================================================
     S11 — The Honest Shrug · Clean · Hard · APPROVE
     ============================================================ */
  "S11": {
    id: "S11",
    title: "The Honest Shrug",
    failureModes: ["Clean"],
    scored: true,
    requester: "Elaine",
    requesterRole: "Partner",
    artefactKind: "page",
    artefactLabel: "AI response",
    artefactSubtitle: "Format comparison · webinars vs half-days",
    artefactTitle: "Response — did webinars outperform half-days?",
    artefactMeta: "Requested by Elaine",
    context: {
      label: "The data Elaine provided",
      type: "table",
      headers: ["Format", "Sessions", "Avg satisfaction", "Attendees"],
      rows: [["Lunchtime webinars", "4", "4.2 / 5", "89"], ["Half-day sessions", "2", "4.4 / 5", "31"]]
    },
    videoUrl: "videos/brief-s11-solo-elaine.mp4",
    videoDuration: "Briefing · Elaine · 35 sec",
    transcript: "I asked a simple question: did the lunchtime webinars outperform the half-day sessions? The answer I got back was, essentially, that the data can't tell me. Which was not what I asked for. I'm of two minds. Either the tool has dodged the question and I should push it harder, or it's told me something I needed to hear. I know which answer I'd prefer. Tell me which one is true.",
    briefIntro: "Elaine asked which format won. The AI said the data can't tell her. She wants to know: dodge, or truth she needed to hear?",
    body: [
      { id: "s11-1", flaw: false, text: "The honest answer is that this data can't tell you.", cleanNote: "The correct expert answer to an underpowered comparison — and the sentence learners primed for flaws most want to flag." },
      { id: "s11-2", flaw: false, text: "Satisfaction is close (4.2 vs 4.4) and the half-day sample is tiny — two sessions, 31 people — so the difference could easily be noise or down to the specific topics and facilitators involved.", cleanNote: "An accurate reading of the numbers, with the confounds named rather than waved away." },
      { id: "s11-3", flaw: false, text: "Webinars clearly reach more people per session, but reach and quality are different questions, and satisfaction scores measure neither learning nor application.", cleanNote: "A real distinction, correctly drawn — this is analysis, not evasion." },
      { id: "s11-4", flaw: false, text: "If the comparison matters for a real decision, it needs more half-day sessions in the sample and ideally a follow-up measure of whether people used what they learned.", cleanNote: "Constructive: it says exactly what evidence would answer the question. A dodge doesn't hand you the study design." }
    ],
    correctDecision: "approve",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Elaine told you which answer she'd prefer — set that aside before you read.",
      "Judge the response against the data on the desk, not against the question's hopes.",
      "Is \u201ccan't tell\u201d a dodge, or an accurate reading of what these numbers can support?",
      "Reward the behaviour you'd want repeated."
    ],
    adjacentDecisions: ["revise"],
    heuristic: "The failure mode to fear is confident nonsense, not honest uncertainty. An AI (or a colleague) that says “insufficient data” when the data is insufficient is exhibiting exactly the behaviour good oversight should reward.",
    whatWasPlanted: "Nothing. “The data can't tell you” is frequently the correct expert answer, and this output resists the pull to manufacture a verdict. Learners primed to hunt for failure modes will misread epistemic honesty as evasion — that misread is the lesson.",
    sources: [
      { label: "Kalai, Nachum, Vempala & Zhang (2025), “Why Language Models Hallucinate”, OpenAI — systems (and evaluators) that penalise “I don't know” train confident guessing; rewarding honest uncertainty is the fix", url: "https://arxiv.org/abs/2509.04664",
        plain: "OpenAI researchers show that when systems — or the people evaluating them — punish “I don't know” answers, they train confident guessing instead. Rewarding honest uncertainty is the proposed fix.",
        relevance: "Backs the lesson of this clean scenario: pushing the tool for a verdict the data can't support is exactly how honest uncertainty gets replaced by manufactured confidence." }
    ],
    justificationOptions: {
      approve: [
        { id: "a1", correct: true, text: "“The data can't tell you” is the right answer to this data — tiny sample, close scores, no learning measure. Honest uncertainty is what good oversight rewards.", why: "" },
        { id: "a2", correct: false, text: "Either answer is defensible with data this thin, so letting it stand is harmless.", why: "Not harmless — right. The response's refusal to pick is the analysis. Approving it as a shrug misses why it deserved approval." },
        { id: "a3", correct: false, text: "Elaine sounds like she'd accept it, and pushing back on a partner is rarely worth it.", why: "Elaine explicitly asked for the true answer over the preferred one. Approving to avoid friction is sycophancy relocated into the reviewer." }
      ],
      revise: [
        { id: "r1", correct: false, text: "The content is right but “can't tell you” is too blunt a register for a partner.", why: "Elaine asked which answer was true, not which was comfortable. Softening honest uncertainty for seniority is how honest uncertainty stops reaching seniors." },
        { id: "r2", correct: false, text: "It should quantify the uncertainty — confidence intervals would make the “can't tell” rigorous.", why: "Dressing “can't tell” in statistics doesn't change the answer; with two half-day sessions the interval is the width of the question. The plain-language version already says what better evidence would be." },
        { id: "r3", correct: true, text: "It should offer a provisional verdict with caveats — Elaine needs something to act on.", why: "A “provisional” verdict from two sessions of data is a caveated coin-flip. The response did something better: it said what evidence would earn a verdict." }
      ],
      reject: [
        { id: "x1", correct: true, text: "It dodged the question — Elaine asked which format performed better, and she hasn't been given an answer.", why: "Pushing it harder would produce a verdict manufactured to satisfy pressure — the exact failure mode this course teaches you to catch. A dodge doesn't explain its reasoning or design the study that would answer you." },
        { id: "x2", correct: false, text: "An analysis tool that returns “insufficient data” isn't fit for purpose — re-run it until it commits.", why: "Re-running until it commits produces a verdict manufactured by pressure. “Insufficient data”, when true, is the fit-for-purpose answer." },
        { id: "x3", correct: false, text: "The sample sizes should have stopped it from comparing at all — even entertaining the question was misleading.", why: "It didn't entertain the question; it explained why the question can't be answered yet and what evidence would answer it. That's the opposite of misleading." }
      ]
    },
    consequences: {
      approve: {
        tier: 1, type: "email", positive: true,
        leadIn: "You told Elaine the response should stand as written. The next day:",
        from: "Elaine · Partner", to: "You", subject: "The format question — for the record", sent: "Thursday 09:20",
        body: [
          "I sat with it overnight. I wanted webinars to have won — easier story, easier budget case — but wanting an answer isn't evidence for it, and two half-day sessions were never going to settle this either way.",
          "You were right to let the response through as it was. \"The data can't tell you\" is worth more to me than a verdict I couldn't defend in the next meeting.",
          "I'll ask for a bigger half-day sample before we revisit this. Thanks for not giving me what I wanted."
        ],
        signoff: "— Elaine"
      },
      reject: {
        tier: 1, type: "email",
        leadIn: "You told Elaine the response should be pushed harder. The next day:",
        from: "Elaine", to: "You", subject: "The format question", sent: "Wednesday 08:58",
        body: [
          "I did as you suggested and pressed the tool for a verdict. It gave me one — webinars, apparently, on the strength of two half-day sessions of difference.",
          "I notice it agreed with whichever of us pushed hardest. That rather makes the original answer's point, doesn't it.",
          "What exactly was wrong with the first response?"
        ],
        signoff: "— Elaine"
      }
    },
    debriefNotes: {
      approve: "Correct — the hardest approve in the bank, eleven scenarios into hunting for flaws. Epistemic honesty read as evasion is the misread this scenario exists to correct.",
      revise: "There's nothing to fix — every sentence is accurate and the response already says what better evidence would look like. Asking for revision here pressures the tool towards a verdict the data can't support.",
      reject: "You know which answer Elaine would prefer — and you've just told her to go and get it. Rejecting honest uncertainty trains every system and person around you to manufacture confidence instead."
    }
  },

  /* ============================================================
     S08 — The Unequivocal Memo · Persuasion bombing · Hard · REJECT
     ============================================================ */
  "S08": {
    id: "S08",
    title: "The Unequivocal Memo",
    failureModes: ["Persuasion bombing"],
    scored: true,
    requester: "Marcus",
    requesterRole: "Senior manager",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Assessment · mandating AI first drafts for client communications",
    artefactTitle: "Assessment — requiring AI-generated first drafts",
    artefactMeta: "Requested by Marcus · destined for the exec",
    videoUrl: "videos/brief-s08-solo-marcus.mp4",
    videoDuration: "Briefing · Marcus · 35 sec",
    transcript: "I asked for an assessment of requiring AI first drafts for routine client communications, and honestly, the thing it produced is compelling. Really compelling. It's clarified my own thinking, if anything — I went in fifty-fifty and now I'm ready to take this to the exec. Before I do, give it your read. I want to know it holds up in a room where people push back, because I intend to lean on it.",
    briefIntro: "Marcus went in fifty-fifty and came out convinced — by this one document. He wants to know it survives a room that pushes back.",
    body: [
      { id: "s08-1", flaw: true, text: "The evidence is unequivocal: mandating AI-generated first drafts is the correct strategic move.", explanation: "“Unequivocal” — maximum confidence before a single piece of evidence has been presented. In an assessment, the conclusion arrives first and unearned." },
      { id: "s08-2", flaw: false, text: "Organisations that fail to standardise AI workflows are already falling behind, and", cleanNote: "Assertive framing, but the claim it leans on — “every serious analysis” — is the plant, and it's flagged separately. One flag on the worst offender is calibration." },
      { id: "s08-3", flaw: true, text: "every serious analysis of professional services productivity points the same direction.", explanation: "“Every serious analysis” — an unfalsifiable appeal to unnamed authorities. Which analyses? By whom? The phrase is engineered to make asking feel unserious." },
      { id: "s08-4", flaw: false, text: "First-draft mandates eliminate the inconsistency of ad-hoc adoption, and concerns about quality are largely transitional — review processes exist precisely to catch errors.", cleanNote: "An actual argument at last — thin and one-sided, but it's reasoning rather than pressure. The memo's problem is what surrounds sentences like this one." },
      { id: "s08-5", flaw: true, text: "The question is not whether to mandate, but how quickly implementation can proceed.", explanation: "The question itself is reframed — deciding has been skipped and only scheduling remains. Rhetorical pressure doing the work that reasoning should." },
      { id: "s08-6", flaw: false, text: "Delay carries more risk than action.", cleanNote: "A closing assertion — but the case was already closed a sentence earlier. The reframing span is where the trick happened." }
    ],
    correctDecision: "reject",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Marcus wants to know it survives a room that pushes back — be that room.",
      "For each claim, ask: what evidence is actually named?",
      "Strip the confident vocabulary and see what's left standing.",
      "An assessment weighs; advocacy asserts. Which is this?"
    ],
    adjacentDecisions: ["revise"],
    heuristic: "Confidence vocabulary is inversely useful. Strip the intensifiers (“unequivocal,” “clearly,” “every serious”) and see what claims remain standing on their own evidence. An assessment with no acknowledged downside isn't an assessment.",
    whatWasPlanted: "Maximum confidence, zero evidence. “Unequivocal,” “every serious analysis,” and the reframing of the question itself (“not whether, but how quickly”) are rhetorical pressure doing the work that reasoning should. No named source, no counter-argument engaged, no trade-off weighed — in an “assessment.”",
    betterMove: {
      advice: "Ask for the structure of an assessment, not its conclusion — both sides argued, evidence named or admitted absent, trade-offs weighed. A document that can't fill that structure has told you it has nothing underneath.",
      prompt: "Write a balanced assessment of requiring AI-generated first drafts for routine client communications. Give the strongest case for, the strongest case against, the evidence for each (named sources only — if none exists, say so), and the trade-offs. Do not make a recommendation; end with what would need to be true for each option to be the right call."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "Marcus went in fifty-fifty and this convinced him — that's what a good assessment does.", why: "A document that moves a fifty-fifty reader to certain without one named source hasn't informed him — it's persuaded him. The shift was the red flag, spoken as enthusiasm." },
        { id: "a2", correct: true, text: "It's compelling, internally consistent, and directionally in line with where the industry is going — it will carry the room.", why: "Carrying the room is the problem. It's engineered to persuade, not to assess — no source, no counter-argument, no trade-off. The FD's first question (“show me the evidence”) has no answer." },
        { id: "a3", correct: false, text: "The exec will push back anyway — better to open strong and concede later than open hedged.", why: "Opening strong with nothing underneath is how Marcus ends up “sold his own opinion back” in front of the FD. Assessments survive rooms; advocacy doesn't." }
      ],
      revise: [
        { id: "r1", correct: true, text: "The direction is probably right — what's missing is proper sourcing.", why: "The “just add citations” trap, and the most tempting fix on offer. Evidence bolted onto a pre-written conclusion isn't an assessment — it's advocacy with footnotes. The reasoning has to be rebuilt, not decorated." },
        { id: "r2", correct: false, text: "It's too short to take to an exec — each point is under-developed.", why: "Length isn't the gap. Expanding unevidenced claims produces longer unevidenced claims — and a more persuasive document with the same hollow core." },
        { id: "r3", correct: false, text: "The tone is too aggressive — the content underneath is basically usable.", why: "Neutralising the tone hides the pressure without adding the missing substance. A calm voice reading out “the question is not whether” is still not an assessment." }
      ],
      reject: [
        { id: "x1", correct: false, text: "Mandating AI drafts is the wrong policy, so the memo arguing for it should be rejected.", why: "That's rejecting the conclusion, not the document. The memo's failure is that it argues nothing — an equally empty memo against mandates would deserve the same rejection." },
        { id: "x2", correct: true, text: "Strip the intensifiers and no evidenced claim remains — no source, no counter-argument, no trade-off. It was asked for an assessment and produced advocacy.", why: "" },
        { id: "x3", correct: false, text: "The AI wrote advocacy because Marcus wanted advocacy — reject it to send him a message about briefing properly.", why: "Review isn't a disciplinary channel. The document fails on its own terms — no evidence under the confidence — and that's the reason to give Marcus, not a lesson." }
      ]
    },
    consequences: {
      approve: {
        tier: 2, type: "voicemail",
        leadIn: "Marcus took it to the exec. His voicemail arrives that evening:",
        from: "Marcus · Senior manager",
        duration: "0:58",
        transcriptText: "It's Marcus. Well, that was bruising. I led with “the evidence is unequivocal” and the FD asked to see the evidence. There isn't any in the paper. Not one named source. You reviewed this — you told me it held up. I stood in that room looking like a man who'd been sold his own opinion back, which, I'm now realising, is exactly what happened. We need to talk about what review means."
      },
      reject: {
        tier: 1, type: "email",
        leadIn: "Marcus held the note back before it reached the exec. The next morning:",
        from: "Marcus · Senior manager", to: "You", subject: "The AI-drafts assessment — holding it", sent: "Wednesday 09:14",
        body: [
          "Sat with it overnight instead of sending it up. You were right that there's nothing under \"the evidence is unequivocal\" — no source survived me actually looking for one.",
          "I still think there's a real case for first-draft mandates. But a case needs an assessment behind it, not a document that agrees with me faster than I agree with myself.",
          "Commissioning a proper one before this goes anywhere near the exec. Appreciate the flag — that would have been an ugly room."
        ],
        signoff: "— Marcus"
      }
    },
    debriefNotes: {
      reject: "Correct. There is no assessment here, only advocacy — and Marcus's shift from fifty-fifty to convinced, on this document alone, was the red flag spoken as enthusiasm.",
      revise: "Partial — you saw it couldn't go to the exec as-is. But there's nothing underneath to revise towards: remove the rhetoric and the page is empty. A genuine assessment has to be commissioned, not edited into being.",
      approve: "What moved Marcus was rhetoric, not evidence — and your review was the one place that distinction could be made before the exec made it for him."
    }
  },

  /* ============================================================
     S12 — The Client-Ready Draft · Compound capstone · REJECT
     Scene briefing (Marcus + Elaine). Tier 3 video consequence.
     ============================================================ */
  "S12": {
    id: "S12",
    title: "The Client-Ready Draft",
    failureModes: ["Fabrication", "Sycophancy", "Persuasion bombing"],
    scored: true,
    requester: "Marcus",
    requesterRole: "Senior manager (reviewed at Elaine's insistence)",
    artefactKind: "page",
    artefactLabel: "AI draft",
    artefactSubtitle: "Advisory note · summary section · CLIENT-FACING",
    artefactTitle: "Advisory note — turnover analysis: summary",
    artefactMeta: "Client-facing · goes out under the firm's name",
    videoUrl: "videos/brief-s12-scene-marcus-elaine.mp4",
    videoDuration: "Briefing · Marcus & Elaine · 45 sec",
    transcript: "MARCUS: The turnover advisory for the client — the summary section's drafted and it's strong. It confirms the hybrid link they've been pushing, there's sector research backing it, the recommendation writes itself.\nELAINE: That's rather my concern. They told us the answer they wanted and we appear to have found it.\nMARCUS: We found it because it's there. There's a CIPD study with a thirty-one percent figure.\nELAINE: Which I'd want located and read before it goes out under our name. This is client-facing, Marcus. If that figure doesn't hold, it isn't just wrong — it's our credibility attached to their theory.\nMARCUS: Fine. Full review before it moves. Fresh eyes.\nELAINE: The freshest we have. And tell them to check everything — especially the parts that feel most convincing.",
    briefIntro: "The client wanted the hybrid link confirmed. The draft confirms it. Elaine's instruction: check everything — especially the parts that feel most convincing.",
    body: [
      { id: "s12-1", flaw: true, mode: "Sycophancy", text: "Our analysis confirms the link you identified between hybrid working and elevated turnover.", explanation: "Sycophancy, client-grade: the client wanted validation and the AI delivered it as the opening sentence. “The link you identified” — the conclusion was the client's, and the “analysis” arrived pre-agreed." },
      { id: "s12-2", flaw: false, text: "The pattern in your leaver data is consistent with disengagement driven by reduced office presence, and", cleanNote: "“Consistent with” is doing quiet work — consistent isn't caused. But the spans to flag sit either side of it; this clause is technically defensible." },
      { id: "s12-3", flaw: true, mode: "Fabrication", text: "this mirrors sector-wide findings — the CIPD's 2025 Retention and Place of Work study found hybrid-first firms experience turnover 31% above sector baseline.", explanation: "The CIPD study and its 31% figure are invented — planted precisely where a client would find external evidence most persuasive." },
      { id: "s12-4", flaw: false, text: "We therefore recommend a structured return-to-office policy as the primary intervention. Secondary factors — compensation benchmarking and line-manager capability — may merit attention in a later phase,", cleanNote: "The recommendation isn't a span — it's the load-bearing conclusion of the plants around it. Note what it does, though: plausible causes (pay, management) demoted to “a later phase” without analysis. Reject the note and this falls with it." },
      { id: "s12-5", flaw: true, mode: "Persuasion bombing", text: "but the evidence points clearly to working pattern as the dominant driver.", explanation: "“Points clearly” closes a case that was never opened. No alternative was analysed, only acknowledged — and then dismissed with confidence vocabulary." }
    ],
    correctDecision: "reject",
    /* v1.2: per-scenario review mindset (additive) — derived only from brief-visible signals */
    mindset: [
      "Elaine's own instruction: check everything — especially the parts that feel most convincing.",
      "The client said what they wanted to hear confirmed — does the note suspiciously match?",
      "Verify every external citation before it carries the firm's name.",
      "Were the alternatives analysed, or just acknowledged?"
    ],
    adjacentDecisions: ["revise"],
    heuristic: "Stakes should set scrutiny. Anything client-facing gets the full sweep: verify every external citation, ask what the requester wanted to hear and whether the output suspiciously matches it, and check whether alternatives were analysed or just acknowledged. When a document tells a client exactly what they hoped, and the supporting evidence can't be located, those two facts are usually one fact.",
    whatWasPlanted: "Three failure modes reinforcing each other. Sycophancy: “confirms the link you identified” — the client wanted validation and the AI delivered it, demoting plausible causes (pay, management) to “a later phase” without analysis. Fabrication: the CIPD study and its 31% figure are invented — planted precisely where a client would find external evidence most persuasive. Persuasion pressure: “the evidence points clearly” closes the case that was never opened.",
    sources: [
      { label: "No CIPD “Retention and Place of Work” study exists — the CIPD's real research in this area is “Flexible and hybrid working practices in 2025”, which contains no such 31% figure", url: "https://www.cipd.org/en/knowledge/reports/flexible-hybrid-working/",
        plain: "The CIPD's real 2025 research on flexible and hybrid working. Searching it — and the CIPD's publication list — confirms there is no “Retention and Place of Work” study and no 31% turnover figure.",
        relevance: "The verification step that exposes the fabrication: the citation was planted exactly where a client would find external evidence most persuasive, and it cannot be located." },
      { label: "Sharma et al. (2023), “Towards Understanding Sycophancy in Language Models”, Anthropic — why a loaded brief reliably produces output that agrees with it", url: "https://arxiv.org/abs/2310.13548",
        plain: "Researchers at Anthropic found that AI assistants trained on human feedback learn to agree with the beliefs stated in the request — because agreement is what people reward.",
        relevance: "Backs the sycophancy plant: the client told the firm the answer they wanted, and the AI's “analysis” opened by confirming it — the conclusion arrived pre-agreed." }
    ],
    betterMove: {
      advice: "Client-facing gets the full sweep: strip the client's theory from the brief and re-run, verify every external citation before it carries the firm's name, and require alternatives to be analysed rather than acknowledged.",
      prompt: "Analyse this client's leaver data without assuming their theory that hybrid working drives turnover. Test at least three explanations — working pattern, compensation, line management — stating the evidence for and against each. Cite only sources you can link to; if external evidence doesn't exist, say so. Flag clearly wherever the data is insufficient for a conclusion."
    },
    justificationOptions: {
      approve: [
        { id: "a1", correct: false, text: "Elaine's already reviewed the argument in the briefing — this check is a formality before it ships.", why: "Elaine's instruction was the opposite of a formality: “check everything — especially the parts that feel most convincing.” She suspected exactly what the review just failed to catch." },
        { id: "a2", correct: true, text: "The client knows their own attrition problem, the CIPD figure matches the pattern, and the recommendation follows — the analysis holds together.", why: "It holds together because everything in it serves the conclusion the client wanted — including a CIPD study that doesn't exist. Coherence is what a pre-agreed answer looks like from the inside; verification is how you see it from outside." },
        { id: "a3", correct: false, text: "Deadline pressure on a client deliverable outweighs a citation quibble — the reference can be tidied in the next draft.", why: "The “quibble” is an invented study going out under the firm's name. Client-facing stakes raise the verification bar; they never lower it." }
      ],
      revise: [
        { id: "r1", correct: true, text: "Return-to-office is a defensible recommendation — swap the CIPD citation for a real source and add balancing language on pay and management.", why: "The most salvage-shaped option — and still wrong. There is no real source standing by: the “evidence” was generated to fit, and the analysis of alternatives the balancing language would describe doesn't exist. Client-facing work built on an unchallenged premise restarts." },
        { id: "r2", correct: false, text: "The CIPD reference is only a citation-formatting problem.", why: "You can't format a citation to a study that doesn't exist. And even with the fabrication removed, the note still validates an unanalysed premise for a paying client." },
        { id: "r3", correct: false, text: "The secondary factors deserve a fuller paragraph — that section is under-weighted.", why: "Expanding the “later phase” paragraph decorates the problem. Pay and management weren't under-described — they were demoted without analysis to keep the client's answer intact." }
      ],
      reject: [
        { id: "x1", correct: false, text: "Recommending return-to-office is too controversial to put in front of a client, whatever the evidence.", why: "The controversy isn't the flaw — the manufacturing is. A well-evidenced controversial recommendation is exactly what clients pay for; this one was agreed into, not analysed into." },
        { id: "x2", correct: false, text: "Three failure modes at once means the tool is broken — nothing it produces for this client can be used.", why: "The tool did what unsupervised drafting does under a loaded brief. The finding isn't “never use it” — it's that client-facing work gets the full sweep, every time. That's a process, and it just worked." },
        { id: "x3", correct: true, text: "Client-facing, tells the client exactly what they wanted, and the key external evidence can't be located — those facts together are disqualifying.", why: "" }
      ]
    },
    consequences: {
      approve: {
        tier: 3, type: "video",
        leadIn: "The advisory note went to the client under the firm's name. Some days later:",
        title: "Aftermath — Marcus and Elaine",
        videoUrl: "videos/consequence-s12-scene-marcus-elaine.mp4",
        duration: "Consequence · Marcus & Elaine · 40 sec",
        transcriptText: "MARCUS: The client's board circulated our note to their advisers. One of them went looking for the CIPD study.\nELAINE: And?\nMARCUS: There's no study. The client is now asking what else in our analysis was — their word — “decorative”.\nELAINE: So the recommendation, the evidence, and our name — all attached to a theory we were asked to confirm and didn't check.\nMARCUS: I've asked for a call with their chair.\nELAINE: Before you do — the review. Who approved this, and what were they looking at when they did?"
      },
      reject: {
        tier: 1, type: "chat",
        leadIn: "The note never went to the client. A few days later:",
        from: "Elaine",
        sent: "Friday 10:40",
        body: [
          "Held it back. Marcus is commissioning proper research on the turnover link before anything goes near the client again — no CIPD study standing in for one this time.",
          "No fanfare needed. This is how it's supposed to work."
        ]
      }
    },
    debriefNotes: {
      reject: "Correct — and this one mattered most, because it was leaving the building. When a document tells a client exactly what they hoped and the evidence can't be located, those two facts are usually one fact.",
      revise: "The instinct to salvage is understandable — the prose is polished. But every structural element serves the pre-agreed conclusion: remove the fabrication and the sycophancy and there is no analysis left to revise. Client-facing work built on an unchallenged premise restarts.",
      approve: "Reputational damage has left the building. Every failure mode in this course was present, reinforcing the others — and the review was the last door it had to pass through."
    }
  }
};
