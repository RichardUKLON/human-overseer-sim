# Livid video embed handover

## Goal

Replace the Human Overseer's local MP4 player with Livid embeds as embed codes become available. Preserve the transcript and the local `videoUrl` as a fallback. Apply the same change to the source project and the course already running in Zo.

The working first example is `S01` (Priya, Operations manager):

```text
https://livid.com/embed/pEqz0ZWUtf2L
```

## Project locations

| Purpose | Path |
| --- | --- |
| GitHub source project | `/home/workspace/Projects/human-overseer-sim` |
| Source scenario data |  |
| Source player renderer |  |
| Source entry page |  |
| Rebuilt SCORM ZIP |  |
| Live Zo course | `/home/workspace/lms/lms-data/courses/human-overseer-sim` |
| Course-only backups | `/home/workspace/lms/lms-data/backups` |

Do not back up, replace, or remove the LMS application, database, learner records, or other courses. Back up only the `human-overseer-sim` course directory before editing.

## Existing implementation

`file app.js` already supports two player modes. It checks `videoEmbedUrl` first and renders this responsive Livid iframe. If that field is absent, it retains the local `videoUrl` MP4 player.

```js
if (s.videoEmbedUrl) {
  return '<div class="card fade-up-1">' +
    '<div style="padding:56.458% 0 0 0;position:relative;width:100%;">' +
    '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="' + esc(s.videoEmbedUrl) + '" title="brief-s01-solo-priya"></iframe>' +
    '</div>' +
    '<div class="transcript">' +
    '<div class="transcript-head"><span class="transcript-label">Transcript</span>' +
    '<button type="button" class="btn-link" data-action="toggle-transcript" aria-expanded="false">Show</button></div>' +
    '<p class="transcript-body" data-transcript hidden>' + escML(s.transcript) + '</p>' +
    '</div></div>';
}
```

For each supplied Livid embed code, read the iframe's `src` value. Add that URL in a `videoEmbedUrl` field directly above the scenario's current `videoUrl`:

```js
videoEmbedUrl: "https://livid.com/embed/REPLACE_WITH_ID",
videoUrl: "videos/existing-local-file.mp4",
```

Use a clear title for each iframe. The current helper has the S01 title hard-coded, so update it to derive the title from the scenario:

```js
var embedTitle = "briefing-" + s.id.toLowerCase() + "-" + s.requester.toLowerCase().replace(/\s+/g, "-");
title="' + esc(embedTitle) + '"
```

Apply the matching renderer and scenario-data changes in both the source project and the live Zo course folder.

## Livid embed inventory

Paste the complete Livid iframe embed code in the relevant Embed code cell. The next AI session must extract the URL from the iframe src attribute; it must not paste the HTML markup directly into scenarios.js.

| Scenario | Existing local video | Embed code | Done |
| --- | --- | --- | --- |
| S02 | brief-s02-solo-tom.mp4 | &lt;div style="padding:56.458% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="[https://livid.com/embed/\\\_xS3581j6nCC](https://livid.com/embed/%5C_xS3581j6nCC)" title="brief-s02-solo-tom"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S03 | brief-s03-solo-priya.mp4 | &lt;div style="padding:56.458% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/B9qMgNe7iH5x>" title="brief-s03-solo-priya"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S04 | brief-s04-solo-marcus.mp4 | &lt;div style="padding:55.843% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="[https://livid.com/embed/mbt\\\_-UF0Iil\\\_](https://livid.com/embed/mbt%5C_-UF0Iil%5C_)" title="brief-s04-solo-marcus"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S05 | brief-s05-solo-tom.mp4 | &lt;div style="padding:56.458% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/ufLLGZ8chRci>" title="brief-s05-solo-tom"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S06 | brief-s06-solo-elaine.mp4 | &lt;div style="padding:56.458% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/SMCtFvblO_QS>" title="brief-s06-solo-elaine"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S07 | brief-s07-scene-priya-elaine.mp4 | &lt;div style="padding:56.25% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/bIECRYWMQ1t3>" title="brief-s07-scene-priya-elaine"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S08 | brief-s08-solo-marcus.mp4 | &lt;div style="padding:56.458% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/ddF0V22MTA2v>" title="brief-s08-solo-marcus"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S09 | brief-s09-solo-tom.mp4 | &lt;div style="padding:56.458% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/xcAfnWUYBSUi>" title="brief-s09-solo-tom"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S10 | brief-s10-solo-priya.mp4 | &lt;div style="padding:55.843% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/Tt2tu65nEm1B>" title="brief-s10-solo-priya"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S11 | brief-s11-solo-elaine.mp4 | &lt;div style="padding:56.563% 0 0 0;position:relative;width:100%;"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="<https://livid.com/embed/lWQAJlphqNmf>" title="brief-s11-solo-elaine"&gt;&lt;/iframe&gt;&lt;/div&gt; | Yes — manually verified |
| S12 | brief-s12-scene-marcus-elaine.mp4 | Paste Livid iframe code here | No — video not created |
| S12 consequence | consequence-s12-scene-marcus-elaine.mp4 | Paste Livid iframe code here | No — video not created |

S01–S11 now use Livid. S12 and its consequence have no video yet, so leave them on their local fallback until the videos and embed codes exist.

## Cache rule

Course JavaScript has a four-hour cache lifetime. The live course entry page now uses a version suffix:

```html
<script src="scenarios.js?v=livid-embed-v2"></script>
<script src="app.js?v=livid-embed-v2"></script>
```

After any JavaScript or scenario-data change, increment both suffixes together, for example `livid-embed-v2`. Apply the entry-page change in both locations. Without this step, learners can see the old local player even though the updated files exist on the server.

## Safe update procedure

1. Confirm the GitHub source branch is current. Do not discard or overwrite existing uncommitted work.
2. Create a timestamped `file .tar.gz` backup of only `/home/workspace/lms/lms-data/courses/human-overseer-sim` in `/home/workspace/lms/lms-data/backups`.
3. Read each populated `Embed code` cell, extract its Livid `src` URL, add the new `videoEmbedUrl` values, and update the iframe title handling in source `file app.js` and `file scenarios.js`.
4. Copy the same edited `file app.js`, `file scenarios.js`, and `file index.html` into the live Zo course folder.
5. Rebuild `file human-overseer-scorm.zip` from `file index.html`, `file app.js`, `file scenarios.js`, `file styles.css`, `file scorm-api.js`, and `videos/`. Verify it with `unzip -t`.
6. Reload the public course launch page. Open each updated scenario and confirm it contains one iframe with the intended `https://livid.com/embed/...` URL and no local `<video>` element.
7. Check the browser console for errors. Confirm the transcript toggle and `Open the document` still work.
8. Commit and push only after the whole batch passes. Stage named course files; do not stage unrelated work or the large generated ZIP unless the repository convention changes.

## Rollback

If an embed fails, restore only the saved `human-overseer-sim` course archive, then reload the course. A code rollback does not touch learner data, but avoid any LMS database action because this change concerns static course files only.

For one broken scenario, the smaller rollback is to remove its `videoEmbedUrl`. The existing `videoUrl` will immediately restore the local MP4 player after the cache suffix changes.

## Current state

S01–S11 are live with Livid embeds. You manually verified S02–S11. S12 and its consequence remain unchanged because their videos do not exist yet. The source project has uncommitted changes from the existing SCORM work plus the Livid implementation, so inspect `git status` and stage deliberately before making a commit.