# ⚡ Interview Code Narrator

**Interview Code Narrator** is a fully static, 100% client-side web application designed to help developers rehearse and prepare for live coding interviews (like Data Structures & Algorithms rounds).

Instead of silently typing out 50 lines of code, this tool transforms raw code into an **interactive interview narrative**, giving you a step-by-step game plan on what to say, where to pause, and how to prove to the interviewer that you are a pragmatic, methodical engineer.

---

## 🎯 What We Built

We built a **zero backend, no-API** heuristic engine housed entirely within `index.html`, `styles.css`, and `app.js`.

The user pastes their raw algorithm (in Python, Java, JS, C++, or Go) into the editor. The application instantly processes it and generates 5 distinct, interview-optimized outputs:

1. **Clean Code (✅):** Polished, formatted code ready for the interview.
2. **Doc Print (📝):** The core code organically merged with full-sentence "Speaker Notes" as block comments right above the relevant lines.
3. **Speaker Notes (🗣️):** A line-by-line script of natural phrases to say while typing (e.g., *"I'll iterate through the collection exactly once to maintain O(N) complexity"* instead of *"Here is a for loop"*).
4. **Debug Print (🐛):** The original code injected with strategic `print()` / `console.log()` statements at high-value checkpoints (like conditional checks and DP transitions) to make the live coding look highly test-driven.
5. **Teleprompter (👁️):** Hidden, private coaching tips that live off-screen. It warns you about edge cases and prompts you to mention Big-O complexity requirements.

Finally, the app calculates a **Natural Typing Flow**—suggesting the psychological order in which you should type the solution to maximize the interviewer's comprehension.

---

## ⚙️ How It Works (Technical Breakdown)

### 1. The Heuristic Scoring Engine (Language Detection)
Auto-detecting code snippets is notoriously difficult client-side without heavy machine learning models. We built a custom **Keyword Fingerprinting Engine**. 
When code is pasted, the app scans for language-specific syntactic flags:
* `def `, `print(`, `elif` → Python
* `public static`, `System.out` → Java
* `console.log`, `===` → JavaScript
* `#include`, `cout` → C++

The language with the highest score dynamically changes the syntax parser and the UI Dropdown. If the engine guesses wrong, the user can manually override it via the dropdown.

### 2. Regex-Based Code Analyzer (The Brain)
The heart of the app is the `analyzeLine(line, index)` function. It parses the plain text line-by-line and categorizes the intent of the code without using a heavy AST (Abstract Syntax Tree):
* **`func`**: Detects function signatures and captures inputs.
* **`init`**: Detects HashMaps, Lists, and Dictionaries being instantiated for state tracking.
* **`loop`**: Detects `for` and `while` logic boundaries.
* **`dp`**: Detects arrays or maps being mutated (e.g., `seen[num] = i`).
* **`cond` & `ret`**: Detects condition branching and recursion base cases.

### 3. Dynamic Narrative Builder
Once the lines are categorized, a massive `switch` statement maps the code semantics to **time estimates, edge cases, and humanized dialogue**. 
For example, if it detects `dp` (Array mutation), the Teleprompter injects: *"This is the core logic. Type it slowly. Name variables descriptively."*

### 4. "Smart Paste" Rich Text Clipboard Engine
By default, web browsers copy text in pure Black & White. We wanted developers to be able to copy the **Doc Print** and paste it directly into MS Word, Google Docs, or Notion while preserving the beautiful Markdown-style syntax highlighting.

We intercepted the native `Copy` button logic and rewrote it using the unified `ClipboardItem` API:
* When "Copy" is clicked, the app clones the code block invisibly.
* It scans every inner `<span>` assigned by `highlight.js`.
* It runs a **Universal Regex Map** against the syntax classes (`hljs-keyword`, `hljs-string`, `hljs-comment`).
* It explicitly forces precise, pristine GitHub Light Hex Colors directly into the HTML tree (e.g., `#cf222e` for keywords, `#57606a` for comments).
* It packages this as `text/html` and overrides the system clipboard, guaranteeing perfect syntax highlights anywhere it is pasted.

### 5. Vanilla UI/UX
The UI uses a **Dark-First, Custom CSS Design System** drawing inspiration from IDEs like VS Code and GitHub Dark. Animations use hardware-accelerated CSS keyframes, and states are managed silently through JavaScript so the application feels instant.
