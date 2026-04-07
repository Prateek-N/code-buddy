/* ============================================================
   INTERVIEW CODE NARRATOR — Logic & Heuristic Engine
   No APIs, 100% Client-Side Pure JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // === DOM ELEMENTS ===
  const els = {
    themeBtn: document.getElementById('theme-btn'),
    iconSun: document.getElementById('icon-sun'),
    iconMoon: document.getElementById('icon-moon'),
    langSelector: document.getElementById('lang-selector'),
    langSelect: document.getElementById('lang-select'),
    sampleBtn: document.getElementById('sample-btn'),
    narrateBtn: document.getElementById('narrate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    codeInput: document.getElementById('code-input'),
    lineCount: document.getElementById('line-count'),
    toast: document.getElementById('toast'),
    flowSection: document.getElementById('flow-section'),
    flowSteps: document.getElementById('flow-steps'),

    // Tabs
    tabs: document.querySelectorAll('.tab'),
    panels: document.querySelectorAll('.tab-panel'),

    // Outputs
    outClean: document.getElementById('output-clean').querySelector('code'),
    outCleanWrap: document.getElementById('output-clean'),
    emptyClean: document.getElementById('empty-clean'),

    outDoc: document.getElementById('output-doc').querySelector('code'),
    outDocWrap: document.getElementById('output-doc'),
    emptyDoc: document.getElementById('empty-doc'),

    outDebug: document.getElementById('output-debug').querySelector('code'),
    outDebugWrap: document.getElementById('output-debug'),
    emptyDebug: document.getElementById('empty-debug'),

    outSpeaker: document.getElementById('output-speaker'),
    emptySpeaker: document.getElementById('empty-speaker'),
    outSpeakerTxt: document.getElementById('output-speaker-text'),

    outTele: document.getElementById('output-tele'),
    emptyTele: document.getElementById('empty-tele'),
    outTeleTxt: document.getElementById('output-tele-text'),

    outFlowTxt: document.getElementById('output-flow-text'),

    // Copy bottons
    copyBtns: document.querySelectorAll('.copy-btn')
  };

  // === STATE ===
  let state = {
    isDark: true,
    code: '',
    langType: 'python', // default fallback
    lines: [],
    analysis: [],
    didNarrate: false
  };

  // === THEME HANDLING ===
  function toggleTheme() {
    state.isDark = !state.isDark;
    document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
    els.iconSun.style.display = state.isDark ? 'block' : 'none';
    els.iconMoon.style.display = state.isDark ? 'none' : 'block';

    document.getElementById('hljs-dark').disabled = !state.isDark;
    document.getElementById('hljs-light').disabled = state.isDark;
  }
  els.themeBtn.addEventListener('click', toggleTheme);

  // === UTIL: TOAST ===
  let toastTimer;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2500);
  }

  // === UTIL: COPY ===
  els.copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      
      let textToCopy = '';
      let isRichCode = false;

      if (targetEl.tagName === 'TEXTAREA') {
        textToCopy = targetEl.value;
      } else {
        // for <pre> blocks
        textToCopy = targetEl.innerText;
        isRichCode = targetEl.tagName === 'PRE';
      }

      if (!textToCopy.trim()) {
        showToast('Nothing to copy yet!');
        return;
      }

      try {
        if (isRichCode && window.ClipboardItem) {
          
          // --- SMART PASTE FIX v2 ---
          // Because flipping <link> tags is asynchronous, window.getComputedStyle failed and returned black.
          // Solution: Hardcode a pristine Light-Mode semantic palette. This guarantees 100% reliable 
          // colorful copying without any async browser rendering issues.

          // 1. Clone node to inline styles
          const clone = targetEl.cloneNode(true);
          const cloneSpans = clone.querySelectorAll('span');

          // GitHub Light semantic palette
          const baseColor = '#24292e';

          for (let i = 0; i < cloneSpans.length; i++) {
            const cls = cloneSpans[i].className || '';
            let c = baseColor;

            // Universal map for all Highlight.js language class variations
            if (/(keyword|attribute|selector-tag|meta-keyword|name)/.test(cls)) {
              c = '#cf222e'; // Red
            } else if (/(string|type|number|selector-id|quote|template-tag)/.test(cls)) {
              c = '#0a3069'; // Dark Blue
            } else if (/(comment|doctag)/.test(cls)) { 
              c = '#57606a'; // Grey
              cloneSpans[i].style.fontStyle = 'italic';
            } else if (/(title|section)/.test(cls)) {
              c = '#8250df'; // Purple
            } else if (/(built_in|meta|literal)/.test(cls)) {
              c = '#0550ae'; // Standard Blue
            } else if (/(variable|template-variable|symbol|regexp|link)/.test(cls)) {
              c = '#953800'; // Orange
            } else if (cls.includes('injected-line')) {
              c = '#953800'; // Match orange for injected prints
              cloneSpans[i].style.fontWeight = 'bold';
            }

            cloneSpans[i].style.color = c;
          }

          // Container for rich pasting
          const compPre = window.getComputedStyle(targetEl);
          const baseFont = compPre.fontFamily;

          // Construct the final HTML wrapper
          const wrapper = document.createElement('div');
          // We DO NOT set background color, so it blends naturally into Google Docs / Word
          wrapper.style.color = baseColor;
          wrapper.style.fontFamily = baseFont;
          
          clone.style.margin = '0';
          clone.style.whiteSpace = 'pre-wrap';
          clone.style.color = baseColor; // Guarantee base text isn't white
          
          // Remove any stray background classes from highlight.js
          clone.style.background = 'transparent';
          clone.className = '';
          if (clone.querySelector('code')) {
            clone.querySelector('code').style.background = 'transparent';
          }

          wrapper.appendChild(clone);

          const htmlBlob = new Blob([wrapper.outerHTML], { type: 'text/html' });
          const textBlob = new Blob([textToCopy], { type: 'text/plain' });
          
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': htmlBlob,
              'text/plain': textBlob
            })
          ]);
        } else {
          // Fallback to plain text
          await navigator.clipboard.writeText(textToCopy);
        }

        // Success UI
        const origHtml = btn.innerHTML;
        btn.innerHTML = '✨ Copied!';
        btn.classList.add('copied');
        btn.blur();

        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.classList.remove('copied');
        }, 2000);

      } catch (err) {
        showToast('Failed to copy');
        console.error('Copy failed:', err);
      }
    });
  });

  // === INPUT HANDLING & LINE COUNT ===
  els.codeInput.addEventListener('input', () => {
    const val = els.codeInput.value;
    const count = val ? val.split('\n').length : 0;
    els.lineCount.textContent = `${count} line${count !== 1 ? 's' : ''}`;
    
    
    if (val.length > 20) {
       // Only auto-detect if the user hasn't manually overridden it
       if (els.langSelect.value === 'auto' || !state.userSelectedLang) {
          heuristicDetectLanguage(val);
       }
    } else if (els.langSelect.value === 'auto') {
      els.langSelector.classList.remove('detected');
    }
  });

  els.langSelect.addEventListener('change', () => {
    state.userSelectedLang = true;
    const selection = els.langSelect.value;
    
    if (selection === 'auto') {
      state.userSelectedLang = false;
      heuristicDetectLanguage(els.codeInput.value);
    } else {
      els.langSelector.classList.add('detected');
      state.langType = selection;
    }
    
    // Auto-re-narrate if there is code
    if (els.codeInput.value.trim() && state.didNarrate) {
        runNarration();
    }
  });

  // Cmd/Ctrl + Enter to narrate
  els.codeInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runNarration();
    }
  });

  els.clearBtn.addEventListener('click', () => {
    els.codeInput.value = '';
    els.codeInput.dispatchEvent(new Event('input'));
    resetOutputs();
    els.codeInput.focus();
  });

  // === TABS ===
  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      els.tabs.forEach(t => t.classList.remove('active', 'aria-selected'));
      els.panels.forEach(p => p.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const id = tab.getAttribute('data-tab');
      document.getElementById(`panel-${id}`).classList.add('active');
    });
  });

  // === SAMPLE DATA ===
  const sampleCodes = [
`def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,

`function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}`,

`class Solution {
    public int maxSubArray(int[] nums) {
        int max_so_far = nums[0];
        int curr_max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            curr_max = Math.max(nums[i], curr_max + nums[i]);
            max_so_far = Math.max(max_so_far, curr_max);
        }
        return max_so_far;
    }
}`
  ];
  let sampleIndex = 0;

  els.sampleBtn.addEventListener('click', () => {
    els.codeInput.value = sampleCodes[sampleIndex];
    els.codeInput.dispatchEvent(new Event('input'));
    sampleIndex = (sampleIndex + 1) % sampleCodes.length;
    runNarration();
  });

  // === CUSTOM LANGUAGE DETECTION (Option A Fingerprinting) ===
  function heuristicDetectLanguage(code) {
    if (!code || code.length < 5) return;
    
    // Scores for each language
    const scores = {
      'python': 0,
      'javascript': 0,
      'java': 0,
      'c++': 0,
      'go': 0
    };

    // Keyword & Syntax Rules
    // Python
    if (/def\s+\w+/.test(code)) scores.python += 5;
    if (/print\(/.test(code)) scores.python += 3;
    if (/elif\b/.test(code)) scores.python += 5;
    if (/\bpass\b/.test(code)) scores.python += 3;
    if (/#\s/.test(code)) scores.python += 1;
    if (/import\s+\w+/.test(code) && !/;\s*$/.test(code)) scores.python += 2;

    // JavaScript / TypeScript
    if (/console\.log\(/.test(code)) scores.javascript += 5;
    if (/(let|const)\s+\w+/.test(code)) scores.javascript += 5;
    if (/=>/.test(code)) scores.javascript += 3;
    if (/function\s+\w*\(/.test(code)) scores.javascript += 2;
    if (/===\b/.test(code)) scores.javascript += 5;

    // Java
    if (/public\s+(class|static)\s/.test(code)) scores.java += 5;
    if (/String\[\]\s+args/.test(code)) scores.java += 5;
    if (/System\.out\.print/.test(code)) scores.java += 5;
    if (/\bHashMap</.test(code)) scores.java += 3;
    if (/\bArrayList</.test(code)) scores.java += 3;

    // C++
    if (/#include\s*</.test(code)) scores['c++'] += 5;
    if (/cout\s*<</.test(code)) scores['c++'] += 5;
    if (/std::/.test(code)) scores['c++'] += 4;
    if (/\bvector</.test(code)) scores['c++'] += 3;

    // Go
    if (/fmt\.Print/.test(code)) scores.go += 5;
    if (/func\s+\w+/.test(code)) scores.go += 4;
    if (/package\s+main/.test(code)) scores.go += 5;
    if (/:=/.test(code)) scores.go += 3;

    // Find the max score
    let bestLang = 'python'; // Default fallback
    let maxScore = 0;
    
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestLang = lang;
        }
    }

    // Only update if we are relatively confident (score > 2)
    // If not, we keep the previous default (python) but don't show it as detected
    if (maxScore >= 2) {
      els.langSelect.value = bestLang;
      els.langSelector.classList.add('detected');
      state.langType = bestLang;
    } else {
      els.langSelect.value = 'auto';
      els.langSelector.classList.remove('detected');
      state.langType = 'python'; // Fallback
    }
  }


  // ============================================================
  // === HEURISTIC ENGINE (THE BRAIN) ===
  // ============================================================

  // Language spec mappings
  const langSpecs = {
    'python': { print: 'print({MSG})', cmt: '#', end: '' },
    'javascript': { print: 'console.log({MSG});', cmt: '//', end: ';' },
    'java': { print: 'System.out.println({MSG});', cmt: '//', end: ';' },
    'c++': { print: 'cout << {MSG} << endl;', cmt: '//', end: ';' },
    'go': { print: 'fmt.Println({MSG})', cmt: '//', end: '' },
  };

  function getLangSpec() {
    return langSpecs[state.langType] || langSpecs['python']; // fallback python
  }

  // Analyze single line
  function analyzeLine(line, i, lines) {
    const txt = line.trim();
    if (!txt) return null;
    
    // Ignore comments
    const spec = getLangSpec();
    if (txt.startsWith(spec.cmt)) return null;

    let a = {
      lineNum: i,
      raw: line,
      indent: line.match(/^\s*/)[0],
      type: 'unknown',
      targetVars: [], // Extracted var names for debug prints
      snippet: txt.length > 30 ? txt.substring(0, 30) + '...' : txt
    };

    // 1. Function Start
    if (/^(def|function|public|private)\s+\w+/.test(txt) || /^[a-zA-Z_]\w*\s*\([^)]*\)\s*\{?/.test(txt) && !txt.startsWith('return ')) {
      a.type = 'func';
      const m = txt.match(/(\w+)\s*\(/);
      a.targetVars = m ? [m[1]] : ['function'];
      return a;
    }

    // 2. Loops
    if (/^(for|while)\b/.test(txt)) {
      a.type = 'loop';
      return a;
    }

    // 3. Conditionals
    if (/^(if|else if|elif)\b/.test(txt)) {
      a.type = 'cond';
      return a;
    }

    // 4. Initialization (Hashmaps/Arrays/Pointers)
    // Python dict: seen = {}
    // JS/Java obj/map: Map, new HashMap, {}
    if (/(=|:=)\s*(\{\}|\[\]|new\s+(Hash)?Map|new\s+(Array)?List)/.test(txt)) {
      a.type = 'init';
      const m = txt.match(/(\w+)\s*(=|:=)/);
      if (m) a.targetVars = [m[1]];
      return a;
    }

    // 5. Array/Map modification (DP updates, seen additions)
    if (/([a-zA-Z_]\w*)\[.*\]\s*=|\.set\(|\.add\(|\.push|\.append/.test(txt)) {
      a.type = 'dp';
      const m = txt.match(/([a-zA-Z_]\w*)/);
      if (m) a.targetVars = [m[1]];
      return a;
    }

    // 6. Return
    if (/^return\b/.test(txt)) {
      a.type = 'ret';
      return a;
    }

    // 7. Base case / Recursion
    if (txt.includes('return') && txt.includes('(') && txt.includes(')')) { // Rough heuristic for recursive calls returning
       a.type = 'rec';
       return a;
    }


    return null;
  }

  // Generate Narrator Content
  function buildNarration(analysisData) {
    const spec = getLangSpec();
    
    let cleanCodeStr = '';
    let debugCodeStr = '';
    let docCodeStr = '';
    
    let speakerHtml = '';
    let speakerTxt = '';
    
    let teleHtml = '';
    let teleTxt = '';

    let flowHtml = '';
    let flowTxt = '';

    const L = state.lines.length;
    let aIdx = 0;

    let stepNum = 1;

    for (let i = 0; i < L; i++) {
      const line = state.lines[i];
      cleanCodeStr += line + '\n';
      debugCodeStr += line + '\n';

      const a = analysisData[aIdx];
      if (a && a.lineNum === i) {
        // We hit an analyzed checkpoint
        aIdx++;

        let say = '';
        let debugMsg = '';
        let teleTip = '';
        let teleEdge = '';
        let timeEst = '15s';

        switch(a.type) {
          case 'func':
            say = `I'll start by defining the function signature.`;
            debugMsg = `"Starting ${a.targetVars[0] || 'algorithm'}"`;
            teleTip = `Don't rush typing this. State the time complexity requirement here before you write the body.`;
            teleEdge = `Ask interviewer: "Should I handle empty inputs?"`;
            timeEst = '30s';
            break;
          case 'init':
            say = `Now I'll initialize a ${a.targetVars[0] || 'data structure'} to keep track of state.`;
            debugMsg = `"Initialized ${a.targetVars[0]}", ${a.targetVars[0]}`;
            teleTip = `Explain WHY you chose this data structure (e.g., O(1) lookups vs O(N) array scan).`;
            timeEst = '15s';
            break;
          case 'loop':
            say = `I'll iterate through the collection exactly once to maintain O(N) complexity.`;
            debugMsg = `"Looping at iteration index..."`; 
            teleTip = `Pause typing. Look at the interviewer. Explain what ONE iteration does conceptually.`;
            teleEdge = `Mention loop invariant or bounds check (e.g. index out of bounds).`;
            timeEst = '45s';
            break;
          case 'cond':
            say = `Here's our main condition: if we find what we need, we act.`;
            debugMsg = `"Condition met!"`;
            teleTip = `Keep the if-condition simple. If it's complex, extract it to a helper function.`;
            timeEst = '20s';
            break;
          case 'dp':
            say = `We update our tracking structure dynamically.`;
            debugMsg = `"Updated state:", ${a.targetVars[0]}`;
            teleTip = `This is the core logic. Type it slowly. Name variables descriptively.`;
            timeEst = '30s';
            break;
          case 'ret':
            say = `Finally, we return the accumulated result.`;
            debugMsg = `"Returning result..."`;
            teleTip = `Double-check your return type against the function signature.`;
            teleEdge = `What if no result is found? Mention default returns (-1, [], null).`;
            timeEst = '10s';
            break;
        }

        // 1. Inject Debug Print
        if (debugMsg) {
          // Heuristic indentation: +1 level for funcs/loops, same level for others.
          // Getting perfect indentation regex across langs is hard, but we do OK:
          let indent = a.indent;
          if (['func', 'loop', 'cond'].includes(a.type)) {
              // Add a generic 4 spaces for the print inside block
              indent += '    '; 
          }
          
          let printStat = spec.print.replace('{MSG}', debugMsg);
          // Insert after the line for funcs/loops/init, before for returns
          if (a.type === 'ret') {
            // Strip the return line we just added, add print, re-add return
            debugCodeStr = debugCodeStr.substring(0, debugCodeStr.length - line.length - 1);
            debugCodeStr += `${a.indent}${printStat}\n`;
            debugCodeStr += `${line}\n`;
            
            // Add a comment class hook for CSS (we do this in rendering later)
          } else {
             debugCodeStr += `${indent}${printStat}\n`;
          }
        }

        // 2. Speaker HTML
        speakerHtml += `
          <div class="note-card type-${a.type}">
            <div class="note-badge">🗣️</div>
            <div class="note-body">
              <div class="note-line-ref">Line ${i+1}</div>
              <div class="note-snippet">${escapeHtml(a.snippet)}</div>
              <div class="note-say">${say}</div>
            </div>
          </div>`;
        speakerTxt += `Line ${i+1}:\nCode: ${a.snippet}\nSay: "${say}"\n\n`;

        // 3. Teleprompter HTML
        teleHtml += `
          <div class="tele-card type-${a.type}">
            <div class="tele-icon">👁️</div>
            <div class="tele-body">
              <div class="tele-line">Line ${i+1}</div>
              <div class="tele-tip">${teleTip}</div>
              ${teleEdge ? `<div class="tele-edge"><strong>Edge Case:</strong> ${teleEdge}</div>` : ''}
            </div>
          </div>`;
        teleTxt += `Line ${i+1}:\nTip: ${teleTip}\n${teleEdge ? `Ask: ${teleEdge}\n` : ''}\n`;

        // 4. Flow HTML
        let flowTypeLabel = a.type.toUpperCase();
        if(a.type==='func') flowTypeLabel = 'SETUP';
        if(a.type==='init') flowTypeLabel = 'STATE';
        if(a.type==='loop') flowTypeLabel = 'TRAVERSAL';
        if(a.type==='cond') flowTypeLabel = 'LOGIC';
        if(a.type==='dp') flowTypeLabel = 'UPDATE';
        if(a.type==='ret') flowTypeLabel = 'FINISH';

        flowHtml += `
          <div class="flow-step">
            <div class="step-num">${stepNum}</div>
            <div class="step-title">${flowTypeLabel}</div>
            <div class="step-time">⏱️ ~${timeEst}</div>
            <div class="step-snippet">${escapeHtml(a.snippet)}</div>
            <div class="step-say">"${say}"</div>
          </div>
        `;
        flowTxt += `Step ${stepNum}: ${flowTypeLabel}\nSnippet: ${a.snippet}\nSay: "${say}"\nWait ~${timeEst}\n\n`;
        stepNum++;
        
        // 5. Build Doc String
        // Insert the say string as a comment block above the line
        docCodeStr += `${a.indent}${spec.cmt} ${say}\n`;
        docCodeStr += `${line}\n`;
        
      } else {
        // No analysis for this line, just pass through for doc
        docCodeStr += `${line}\n`;
      }
    }

    return {
      clean: cleanCodeStr.trim(),
      debug: debugCodeStr.trim(),
      doc: docCodeStr.trim(),
      speakerHtml, speakerTxt,
      teleHtml, teleTxt,
      flowHtml, flowTxt
    };
  }


  // === MAIN EXECUTION ===
  els.narrateBtn.addEventListener('click', runNarration);

  function runNarration() {
    const raw = els.codeInput.value;
    if (!raw.trim()) {
      showToast('Paste some code first!');
      return;
    }

    // Attempt detection if not done and user hasn't locked it
    if (!state.userSelectedLang || els.langSelect.value === 'auto') {
        heuristicDetectLanguage(raw);
    }

    state.code = raw;
    state.lines = raw.split('\n');
    
    // Run Heuristics
    const analysis = [];
    state.lines.forEach((l, i) => {
      const res = analyzeLine(l, i, state.lines);
      if(res) analysis.push(res);
    });
    state.analysis = analysis;

    // Generate Files
    const gen = buildNarration(analysis);

    // Apply to UI
    hideEmptyStates();

    // Clean Tab
    els.outClean.textContent = gen.clean;
    if (window.hljs) hljs.highlightElement(els.outClean);
    
    // Doc Tab
    els.outDoc.textContent = gen.doc;
    if (window.hljs) hljs.highlightElement(els.outDoc);
    
    // Debug Tab
    els.outDebug.textContent = gen.debug;
    if (window.hljs) {
      hljs.highlightElement(els.outDebug);
      // Custom heuristic to highlight injected lines post-hljs
      const spec = getLangSpec();
      const printBase = spec.print.split('(')[0].split('.')[0].trim(); // e.g. 'print', 'console', 'System'
      
      let html = els.outDebug.innerHTML;
      let htmlLines = html.split('\n');
      for(let i=0; i<htmlLines.length; i++) {
        // Very basic detector for the injected print statements
        if(htmlLines[i].includes(`"${printBase}`) || htmlLines[i].includes(`>${printBase}<`) || htmlLines[i].includes(printBase) && htmlLines[i].includes('"')) {
            // Check if it matches our heuristic templates
            if(htmlLines[i].includes('"Starting') || htmlLines[i].includes('"Initialized') || htmlLines[i].includes('"Looping') || htmlLines[i].includes('"Condition') || htmlLines[i].includes('"Updated') || htmlLines[i].includes('"Returning')) {
                htmlLines[i] = `<span class="injected-line">${htmlLines[i]}</span>`;
            }
        }
      }
      els.outDebug.innerHTML = htmlLines.join('\n');
    }

    // Texts for copying
    els.outSpeakerTxt.value = gen.speakerTxt || 'No notes generated.';
    els.outTeleTxt.value = gen.teleTxt || 'No tips generated.';
    els.outFlowTxt.value = gen.flowTxt || 'No flow generated.';

    // HTML Rendering
    els.outSpeaker.innerHTML = gen.speakerHtml || '<div class="empty-state"><div class="empty-body">Could not find key logic points to narrate.</div></div>';
    els.outTele.innerHTML = gen.teleHtml || '<div class="empty-state"><div class="empty-body">Could not find key logic points to review.</div></div>';
    
    if (gen.flowHtml) {
      els.flowSection.style.display = 'flex';
      els.flowSteps.innerHTML = gen.flowHtml;
    } else {
      els.flowSection.style.display = 'none';
      els.flowSteps.innerHTML = '';
    }

    state.didNarrate = true;
    showToast('Code Narrated! ✨');
  }

  function hideEmptyStates() {
    els.emptyClean.style.display = 'none';
    els.emptyDoc.style.display = 'none';
    els.emptyDebug.style.display = 'none';
    if(els.emptySpeaker) els.emptySpeaker.style.display = 'none';
    if(els.emptyTele) els.emptyTele.style.display = 'none';
    
    // Clear previously injected HTML before pushing new content (prevents duplication bug)
    els.outSpeaker.innerHTML = '';
    els.outTele.innerHTML = '';
  }

  function resetOutputs() {
    state.didNarrate = false;
    
    els.outClean.textContent = '';
    els.outClean.removeAttribute('data-highlighted');
    els.outClean.className = '';
    els.emptyClean.style.display = 'flex';

    els.outDoc.textContent = '';
    els.outDoc.removeAttribute('data-highlighted');
    els.outDoc.className = '';
    els.emptyDoc.style.display = 'flex';

    els.outDebug.textContent = '';
    els.outDebug.removeAttribute('data-highlighted');
    els.outDebug.className = '';
    els.emptyDebug.style.display = 'flex';

    els.outSpeaker.innerHTML = '';
    els.outSpeaker.appendChild(els.emptySpeaker);
    els.emptySpeaker.style.display = 'flex';

    els.outTele.innerHTML = '';
    els.outTele.appendChild(els.emptyTele);
    els.emptyTele.style.display = 'flex';

    els.flowSection.style.display = 'none';
    els.flowSteps.innerHTML = '';

    els.langSelect.value = 'auto';
    els.langSelector.classList.remove('detected');
    state.userSelectedLang = false;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

});
