I have two separate web forms in the same repository:

Report Web Form → used to generate Excel Sheet 1

Reference Web Form → used to generate Excel Sheet 2

I want you to visually and structurally combine both forms into a single unified web form.

Requirements:

Use Report Web Form as the base layout, structure, and styling.

Integrate Reference Web Form as a new section inside the Report form (not a separate page).

Clearly separate the two sections using:

Section headers (e.g. “Report” and “Reference”)

Consistent spacing and alignment

The same typography, input styles, and layout system

The final UI should feel like one complete form, not two stitched forms.

Maintain existing field names, validations, and behaviors from both forms.

From a data perspective:

Report data maps to Excel Sheet 1

Reference data maps to Excel Sheet 2

Do not change any export logic yet (Excel/PDF handling stays the same for now).

Focus only on:

UI merging

Visual consistency

Logical form structure

Goal:
A single, clean “Report” web form that includes a well-organized Reference section, ready to export as two sheets in one Excel file later.
