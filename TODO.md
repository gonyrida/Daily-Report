> **Context:**
> The project contains a 2 parts for Report and Reference but in Reference
> No Table Title UI exists yet.
>
> **Task:**
> Add a **visual-only Table Title input** to the form.
>
> ---
>
> ### Scope (VERY IMPORTANT)
>
> This task is **UI ONLY**.
>
> * ❌ Do NOT add backend logic
> * ❌ Do NOT modify export logic
> * ❌ Do NOT wire to form state or persistence
> * ❌ Do NOT refactor existing code
>
> The goal is visual placement only.
>
> ---
>
> ### UI Requirements
>
> 1. Add a text input labeled **“Table Title”**.
> 2. Position it **at the top of the form**, above all Sections.
> 3. The input is **non-repeatable** (only one instance).
> 4. It visually reads as a **global table-level field**, not a Section Title.
> 5. It should be clearly separated from the first Section Title (spacing, divider, or subtle styling).
>
> ---
>
> ### Behavior
>
> * No validation required
> * No persistence required
> * No functional behavior required
> * Placeholder text is acceptable
>
> ---
>
> **Goal:**
> Introduce a clear, intuitive visual placeholder for a future Table Title feature without affecting any existing functionality.
> This change is intentionally visual-only; functional wiring will be implemented later.