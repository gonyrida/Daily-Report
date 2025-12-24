def write_to_merged_safe(ws, row, col, value):
    for merged in ws.merged_cells.ranges:
        if (
            merged.min_row <= row <= merged.max_row
            and merged.min_col <= col <= merged.max_col
        ):
            ws.cell(row=merged.min_row, column=merged.min_col).value = value
            return
    ws.cell(row=row, column=col).value = value
