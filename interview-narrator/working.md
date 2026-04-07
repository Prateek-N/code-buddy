# ⚡ Interview Code Narrator v2

**Interview Code Narrator** is a fully static, 100% client-side web application designed to help developers rehearse and prepare for live coding interviews (like Data Structures & Algorithms rounds on LeetCode or HackerRank).

Instead of silently writing a wall of code, this tool transforms raw code into an **interactive interview narrative**. It gives you a step-by-step game plan on what to say, where to pause, and how to prove to the interviewer that you are a pragmatic, methodical engineer.

---

## 🚀 Use Cases
* **Mock Interviews:** Rehearse talking aloud while typing to build muscle memory.
* **Algorithm Studying:** Instead of just memorizing the code, use the generated *Doc Print* to memorize the *logic flow* and the edge cases.
* **Coaching & Mentoring:** Use the generated *Speaker Notes* to teach juniors how to articulate decisions like choosing a HashMap vs. an Array.

---

## 🎯 Core Features (v2 Upgrades)

1. **Clean Code (✅):** Polished, formatted code ready for the interview.
2. **Doc Print (📝):** The core code organically merged with full-sentence "Speaker Notes" as block comments right above the relevant lines.
3. **Speaker Notes (🗣️):** A line-by-line script of natural phrases to say while typing. **(v2: Now features rotating phrase banks so you don't sound like a robot during repetitive logic!)**
4. **Debug Print (🐛):** The original code injected with strategic `print()` / `console.log()` statements at high-value checkpoints to make the live coding look highly test-driven.
5. **Teleprompter (👁️):** Hidden, private coaching tips that live off-screen. Warns about edge cases and prompts you to mention Big-O complexity.

### 🔥 Exclusive v2 Additions
* **10 Language Support:** Python, Java, JavaScript, TypeScript, C++, Go, Rust, Kotlin, Swift, and Ruby.
* **Confidence Badge:** A dynamic UI badge reflecting the engine's confidence level (0-100%) when automatically guessing the programming language via heuristics.
* **Problem Statement Integration:** A dedicated input field to paste the original problem statement, which the engine weaves into the opening narration.
* **Keyboard Navigation:** Rapid tab switching via `Ctrl+1` through `Ctrl+5`.

---

## ⚙️ How It Works (Technical Architecture)

### 1. Extended Language Fingerprinting (Zero-API Detection)
Auto-detecting code snippets is notoriously difficult client-side without heavy machine learning models. We built a custom **Keyword Fingerprinting Engine**. 
When code is pasted, the app assigns "weights" to language-specific syntax:
* `def `, `print(`, `elif` → Python (+8 weight)
* `public static`, `System.out` → Java
* `go func`, `:=`, `chan` → Go
* `fn `, `let mut`, `match` → Rust

The highest overall score dynamically determines the language and updates the **Confidence Badge**. If it dips below a threshold, the app safely falls back.

### 2. Regex-Based Code Analyzer (The Brain)
The engine parses plain text line-by-line and categorizes the intent without a heavy AST (Abstract Syntax Tree). The v2 Engine is incredibly robust:
* **`func` & `classdef`**: Detects function signatures / classes and extracts variable names for context.
* **`init`**: Detects HashMaps, Lists, and Sets being instantiated for state tracking.
* **`loop`**: Detects bounds and iterations.
* **`dp`**: Detects array/map mutations (e.g., `seen[num] = i`).
* **`rec` & `trycatch`**: Safely identifies recursion boundaries and defensive error handling blocks.

### 3. Dynamic Narrative Builder with Phrase Rotation
Once lines are categorized, a lookup maps semantics to **time estimates, edge cases, and humanized dialogue**. 
To prevent the generated speech from sounding repetitive, v2 introduced a **`pickPhrase()` round-robin rotation**. For instance, a loop might say *"I'll iterate through exactly once"*, and the next loop will seamlessly say *"A single traversal handles this"*.

### 4. "Smart Paste" Rich Text Clipboard Engine
When copying code to Microsoft Word, Google Docs, or Notion, browsers generally strip the background colors, resulting in invisible white text.
We intercepted the native `Copy` button logic and rewrote it using the `ClipboardItem` API. 
* It scans every inner `<span>` assigned by `highlight.js`.
* It assigns a **Universal Regex Map** against the syntax classes (`hljs-keyword`, `hljs-string`).
* It explicitly forces a 100% pristine GitHub Light Hex Color Palette into the HTML tree (e.g., `#cf222e` for keywords, `#57606a` for comments).
* It guarantees perfect, vibrant syntax highlights upon clipboard paste, ignoring the web-app's dark mode state.

### 5. Vanilla UI/UX
The UI uses a **Dark-First, Custom CSS Design System** drawing inspiration from IDEs like VS Code. Heavy use of flexbox, hardware-accelerated CSS keyframe animations, and DOM manipulation entirely within Vanilla JS ensures a zero-latency feel.
