# generators/excel/writer.py
from .templates import copy_row, copy_merged_cells
from ..common.helpers import write_to_merged_safe

def prepare_entry_block(ws, current_row, template_start, template_end):
    """
    Clones the template structure into the new location and 
    forces the row height specifically for image fitting.
    """
    # Only clone if we aren't currently sitting on the template row itself
    if current_row != template_start:
        offset = current_row - template_start
        for r in range(template_start, template_end + 1):
            copy_row(ws, r, current_row + (r - template_start))
        copy_merged_cells(ws, template_start, template_end, offset)
    
    # Force the Image Row (usually current_row + 1) to be large enough for photos
    # 3.7 inches * 72 points/inch = ~267 points
    ws.row_dimensions[current_row + 1].height = 267

def write_footers(ws, row, entry, footer_columns):
    """
    Writes footer data (like labels or dates) into the 
    pre-merged footer cells in the Excel sheet.
    """
    footers = entry.get("footers", ["", ""])
    for idx, text in enumerate(footers):
        if idx < len(footer_columns):
            # Using the common helper to ensure we don't break merged cells
            write_to_merged_safe(ws, row, footer_columns[idx], text)