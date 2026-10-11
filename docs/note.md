# Tarot-Tajai Feature Roadmap Notes

This document outlines proposed new features planned for upcoming iterations of the Tarot-Tajai project.

---

## 1. Daily Card (One-Card Reading of the Day)

### Objective
Enable users to draw a single card each day for daily inspiration, energetic guidance, and routine reflection without requiring complex inquiry setups. Encourages daily user engagement and habit formation.

### Key Capabilities
- **Single-Draw Daily Ritual:**
  - Dedicated view or quick-access widget on the home page.
  - Automatically resets every day at midnight (local time).
  - Stores the current day's drawn card in local/session storage to prevent repeated draws on the same day while allowing revisiting.
- **Micro-Interpretation:**
  - Short, digestible daily affirmation, theme of the day, and practical mindset advice.
  - Quick toggle for Thai/English language interpretation.
- **Daily Streak & History Tracking:**
  - Track consecutive days of drawing cards.
  - View past daily cards in a calendar-style or chronological list view.

---

## 2. Interactive Follow-up Inquiries (Ask Follow-up Question)

### Objective
Allow users to ask clarifying or deeper questions based on their existing reading results without losing the current card spread context or requiring a new shuffle.

### Key Capabilities
- **In-Context Conversational Expansion:**
  - Input box positioned at the bottom of the Reading Result screen (`/read?step=result`).
  - Allows users to ask specific follow-up questions (e.g., *"What should I focus on this week based on these cards?"* or *"How can I best overcome the challenge in Card 2?"*).
- **Context-Preserving AI Prompting:**
  - Submits the follow-up question along with the original inquiry, selected spread, drawn cards, and previous synthesis to the AI engine.
  - Strict grounding to ensure the response references the existing cards rather than hallucinating new elements.
- **Multi-Turn Thread within Reading Session:**
  - Renders the Q&A thread cleanly under the main interpretation.
  - Persisted alongside the reading record in local reading history.
