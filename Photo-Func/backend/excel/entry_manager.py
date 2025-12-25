from .entry_block import copy_row, copy_merged_cells
from .helpers import write_to_merged_safe

def prepare_entry_block(ws, current_row, template_start, template_end):
    """Clones template structure and forces row height for images."""
    if current_row != template_start:
        offset = current_row - template_start
        for r in range(template_start, template_end + 1):
            copy_row(ws, r, current_row + (r - template_start))
        copy_merged_cells(ws, template_start, template_end, offset)
    
    # Force the Image Row (current_row + 1) to be 3.7" tall
    # 3.7 inches * 72 points/inch = 266.4 points
    ws.row_dimensions[current_row + 1].height = 267

def write_footers(ws, row, entry, footer_columns):
    """Writes footer data into the merged footer cells."""
    footers = entry.get("footers", ["", ""])
    for idx, text in enumerate(footers):
        if idx < len(footer_columns):
            write_to_merged_safe(ws, row, footer_columns[idx], text)