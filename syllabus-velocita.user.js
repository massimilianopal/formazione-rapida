// ==UserScript==
// @name         Syllabus - Velocita video
// @namespace    syllabus-video-local
// @version      1.3.1
// @description  Velocita per video HTML5, Vimeo e lezioni interattive Storyline.
// @match        https://lms.syllabus.gov.it/*
// @match        https://player.vimeo.com/video/*
// @homepageURL  https://github.com/massimilianopal/formazione-rapida
// @updateURL    https://raw.githubusercontent.com/massimilianopal/formazione-rapida/main/syllabus-velocita.user.js
// @downloadURL  https://raw.githubusercontent.com/massimilianopal/formazione-rapida/main/syllabus-velocita.user.js
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(() => {
  'use strict';

  const isVimeo = location.hostname === 'player.vimeo.com';
  if (isVimeo) {
    let parentHost = '';
    try { parentHost = new URL(document.referrer).hostname; } catch {}
    if (parentHost !== 'lms.syllabus.gov.it') return;
  }

  const page = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
  const valid = n => Number.isFinite(n) && n >= 0.25 && n <= 16;
  const readSpeed = (key, fallback) => {
    const n = Number(GM_getValue(key, fallback));
    return valid(n) ? n : fallback;
  };
  const speeds = {
    video: readSpeed('velocita', 1.5),
    storyline: readSpeed('velocita_storyline', 10)
  };
  const known = new WeakSet();
  let mode = 'video';
  let panel, labelText, input, status;
  let lastState, failedState = null;
  let scheduled = false;

  function getStoryState() {
    try {
      const state = page.DS?.appState;
      return typeof state?.setPlaybackSpeed === 'function' &&
        typeof state?.getPlaybackSpeed === 'function' ? state : null;
    } catch { return null; }
  }

  function isStoryline() {
    return Boolean(getStoryState() ||
      page.globals?.publishSource === 'storyline' ||
      document.querySelector('#playback-speed') ||
      document.querySelector('script[src*="/scripts/slides.min.js"]'));
  }

  function setStatus(text) {
    if (status && status.textContent !== text) status.textContent = text;
  }

  function applyVideo(video) {
    // Anche i vecchi listener evitano interventi diretti quando parte Storyline.
    if (isStoryline()) return;
    try {
      video.defaultPlaybackRate = speeds.video;
      video.playbackRate = speeds.video;
    } catch (error) {
      console.warn('[Syllabus velocita]', error);
      setStatus('Velocita non supportata');
    }
  }

  function applyStoryline() {
    const state = getStoryState();
    if (!state) { setStatus('Attendo il player...'); return; }
    if (state !== lastState) {
      lastState = state;
      failedState = null;
    }
    if (state === failedState) return;
    let previous;
    try {
      previous = Number(state.getPlaybackSpeed());
      if (previous !== speeds.storyline) {
        state.setPlaybackSpeed(speeds.storyline);
      }
      const actual = Number(state.getPlaybackSpeed());
      if (actual !== speeds.storyline) {
        failedState = state;
        setStatus(`Il player restituisce ${actual}x`);
        return;
      }
      setStatus(`Storyline: ${actual}x`);
    } catch (error) {
      // Evita di ripetere un'impostazione fallita ad ogni scansione.
      failedState = state;
      if (valid(previous)) {
        try { state.setPlaybackSpeed(previous); } catch {}
      }
      setStatus('Errore: prova una velocita inferiore');
      console.warn('[Syllabus Storyline]', error);
    }
  }

  function showPanel() {
    if (!panel) {
      panel = document.createElement('div');
      panel.style.cssText = 'position:fixed!important;right:12px!important;top:12px!important;bottom:auto!important;z-index:2147483647!important;display:block!important;';
      const root = panel.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = `
        :host { all: initial; }
        .box { padding:9px 12px; background:#fff; color:#182431;
          border:1px solid #8093a5; border-radius:8px;
          box-shadow:0 2px 10px #0003; font:14px system-ui; }
        label { display:flex; align-items:center; gap:8px; }
        input { width:64px; padding:4px; font:inherit; color:#182431;
          background:#fff; border:1px solid #8093a5; border-radius:4px; }
        small { display:block; margin-top:4px; font:11px system-ui; }
      `;
      const box = document.createElement('div');
      box.className = 'box';
      const label = document.createElement('label');
      labelText = document.createElement('span');
      input = document.createElement('input');
      Object.assign(input, { type:'number', min:'0.25', max:'16', step:'0.25' });
      input.setAttribute('aria-label', 'Velocita di riproduzione');
      input.title = '1 = normale. La scelta viene ricordata.';
      input.addEventListener('change', () => {
        const next = Number(input.value);
        if (!valid(next)) { input.value = String(speeds[mode]); return; }
        speeds[mode] = next;
        GM_setValue(mode === 'storyline' ? 'velocita_storyline' : 'velocita', next);
        failedState = null;
        if (mode === 'storyline') applyStoryline();
        else {
          setStatus(isVimeo ? 'Vimeo' : 'Video');
          document.querySelectorAll('video').forEach(applyVideo);
        }
      });
      status = document.createElement('small');
      status.setAttribute('aria-live', 'polite');
      label.append(labelText, input);
      box.append(label, status);
      root.append(style, box);
    }
    const title = mode === 'storyline' ? 'Corso x' : 'Video x';
    if (labelText.textContent !== title) {
      labelText.textContent = title;
      input.value = String(speeds[mode]);
      setStatus(mode === 'storyline' ? 'Storyline' : isVimeo ? 'Vimeo' : 'Video');
    }
    if (!panel.isConnected) document.documentElement.append(panel);
  }

  function scan() {
    mode = isStoryline() ? 'storyline' : 'video';
    if (mode === 'storyline') {
      showPanel();
      applyStoryline();
      return;
    }
    const videos = document.querySelectorAll('video');
    if (videos.length) showPanel();
    else if (panel?.isConnected) panel.remove();
    videos.forEach(video => {
      if (known.has(video)) return;
      known.add(video);
      applyVideo(video);
      video.addEventListener('loadedmetadata', () => applyVideo(video));
      video.addEventListener('play', () => applyVideo(video));
    });
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; scan(); }, 100);
  }).observe(document.documentElement, { childList:true, subtree:true });

  // Attende anche il motore Storyline inizializzato dopo il caricamento del DOM.
  setInterval(scan, 1000);

  // Conserva il comportamento Vimeo della versione precedente.
  if (isVimeo) {
    const positions = new WeakMap();
    setInterval(() => {
      document.querySelectorAll('video').forEach(video => {
        const current = video.currentTime;
        const previous = positions.get(video);
        positions.set(video, current);
        if (!video.paused && !video.seeking && !video.ended &&
            video.playbackRate > 2 && previous !== undefined && current > previous) {
          video.dispatchEvent(new Event('timeupdate'));
        }
      });
    }, 50);
  }
  scan();
})();
