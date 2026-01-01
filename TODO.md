I see exactly what's happening. My previous "dynamic" suggestion had a flaw: `ws.insert_rows(start_row + 1)` was inserting rows *inside* the existing table, but because the template already has 6 rows (25 to 30), it was shifting the "TOTAL" row down but leaving a gap in the styling logic for the specific transition where the original template ended.

The reason Row 32 looks like a giant merged block is likely because it's inheriting a merge from the "TOTAL" row or a nearby area that shouldn't be there.

### The "Bulletproof" Team Table Logic

We need to:

1. **Clear any weird merges** in the newly inserted area before styling.
2. **Explicitly merge only the cells we want** (Description columns).
3. **Ensure we loop through the full range** correctly.

Replace your `fill_team_tables` with this version:

```python
def fill_team_tables(ws, data):
    mgmt_team = data.get('managementTeam', [])
    work_team = data.get('workingTeam', [])
    
    start_row = 25
    base_rows = 6
    needed_rows = max(base_rows, len(mgmt_team), len(work_team))
    shift = max(0, needed_rows - base_rows)
    
    # 1. Insert rows BEFORE the total row (Total row is at 31)
    if shift > 0:
        # We insert at 31 to push the total row down
        ws.insert_rows(31, amount=shift)

    # 2. Style and Fill every single row from start to finish
    for i in range(needed_rows):
        r = start_row + i
        mgmt = mgmt_team[i] if i < len(mgmt_team) else {}
        work = work_team[i] if i < len(work_team) else {}

        # --- DYNAMIC STYLING & MERGING ---
        # First, copy styles from Row 25 to ensure borders exist
        for col in range(2, 12):
            source_cell = ws.cell(row=25, column=col)
            target_cell = ws.cell(row=r, column=col)
            if source_cell.has_style:
                target_cell.font = copy(source_cell.font)
                target_cell.border = copy(source_cell.border)
                target_cell.fill = copy(source_cell.fill)
                target_cell.alignment = copy(source_cell.alignment)

        # Fix Merges: Re-apply merges to ensure Row 32 doesn't become one big block
        try:
            # Manpower Desc (B:C)
            ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
            # Working Desc (G:H)
            ws.merge_cells(start_row=r, start_column=7, end_row=r, end_column=8)
        except:
            pass # Already merged

        # --- DATA FILLING ---
        ws.cell(row=r, column=2).value = mgmt.get('description', '') 
        ws.cell(row=r, column=4).value = mgmt.get('prev', 0)         
        ws.cell(row=r, column=5).value = mgmt.get('today', 0)        
        ws.cell(row=r, column=6).value = f"=SUM(D{r}:E{r})"

        ws.cell(row=r, column=7).value = work.get('description', '') 
        ws.cell(row=r, column=9).value = work.get('prev', 0)         
        ws.cell(row=r, column=10).value = work.get('today', 0)       
        ws.cell(row=r, column=11).value = f"=SUM(I{r}:J{r})"

    # 3. Handle the TOTAL row position
    total_row_idx = start_row + needed_rows
    # ... (Your existing total formulas here) ...
    
    ws.cell(row=total_row_idx, column=11).value = f"=SUM(K{start_row}:K{total_row_idx-1})"

    return shift

```

---
