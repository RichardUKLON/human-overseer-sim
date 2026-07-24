/* SCORM 1.2 API Wrapper for The Human Overseer
   Bridges window.SCORM (expected by app.js) and the LMS's API object.
   Load BEFORE app.js. */

(function () {
  "use strict";

  var lmsAPI = null;

  /* Find the SCORM API object — check various locations the LMS might put it */
  function findAPI() {
    var attempts = ["API", "API_1484_11"];
    var win = window;
    for (var i = 0; i < 10 && win; i++) {
      for (var j = 0; j < attempts.length; j++) {
        if (typeof win[attempts[j]] !== "undefined") {
          return win[attempts[j]];
        }
      }
      win = win.parent;
    }
    return null;
  }

  function init() {
    lmsAPI = findAPI();
    if (!lmsAPI) {
      console.warn("SCORM: no LMS API found — running in standalone mode");
      return;
    }
    /* Initialize the SCORM session */
    var result = lmsAPI.LMSInitialize("");
    if (result === "false") {
      console.error("SCORM: LMSInitialize failed");
      lmsAPI = null;
      return;
    }
    /* Set initial status to "incomplete" */
    lmsAPI.LMSSetValue("cmi.core.lesson_status", "incomplete");
    lmsAPI.LMSCommit("");
    console.log("SCORM: session initialized");
  }

  function commit() {
    if (!lmsAPI) return;
    lmsAPI.LMSCommit("");
  }

  function finish(status) {
    if (!lmsAPI) return;
    lmsAPI.LMSSetValue("cmi.core.lesson_status", status || "completed");
    lmsAPI.LMSSetValue("cmi.core.exit", "");
    lmsAPI.LMSCommit("");
    lmsAPI.LMSFinish("");
    console.log("SCORM: finished with status", status || "completed");
  }

  /* The interface app.js calls */
  window.SCORM = {
    init: init,

    /* Report score: raw and max. LMS normalises to percentage. */
    setScore: function (raw, max) {
      if (!lmsAPI) return;
      if (max <= 0) return;
      var score = Math.round((raw / max) * 100);
      score = Math.min(100, Math.max(0, score));
      lmsAPI.LMSSetValue("cmi.core.score.raw", String(score));
      lmsAPI.LMSSetValue("cmi.core.score.max", "100");
      lmsAPI.LMSSetValue("cmi.core.score.min", "0");
      commit();
    },

    /* Mark the course as completed */
    complete: function () {
      finish("completed");
    },

    /* Mark as failed (score below threshold) */
    fail: function () {
      finish("failed");
    },

    /* Suspend all data (for resume) */
    suspend: function (data) {
      if (!lmsAPI) return;
      lmsAPI.LMSSetValue("cmi.suspend_data", JSON.stringify(data));
      commit();
    },

    /* Resume from saved data */
    resume: function () {
      if (!lmsAPI) return null;
      var data = lmsAPI.LMSGetValue("cmi.suspend_data");
      if (data && data.length > 0) {
        try { return JSON.parse(data); } catch (e) { return null; }
      }
      return null;
    }
  };

  /* Auto-init when the page is ready */
  if (document.readyState === "complete") {
    window.SCORM.init();
  } else {
    window.addEventListener("load", function () { window.SCORM.init(); });
  }
})();
