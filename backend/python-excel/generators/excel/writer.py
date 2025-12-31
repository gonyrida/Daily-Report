# generators/excel/writer.py
from .templates import copy_row, copy_merged_cells
from ..common.helpers import write_to_merged_safe
from ..common.config import (
    ENTRY_BLOCK_START, 
    ENTRY_BLOCK_END, 
    ENTRY_HEIGHT, 
    DATA_COLUMNS, 
    FOOTER_COLUMNS
)
from .images import process_and_insert_images

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

def fill_reference_sheet(ws, reference_entries):
    """
    This is the main entry point for the Reference Sheet (Sheet 2).
    'ws' is the Worksheet object for the 2nd tab.
    'reference_entries' is the list of data from your Node.js form.
    """
    current_row = ENTRY_BLOCK_START
    image_cache = {}

    for entry in reference_entries:
        # 1. Clone the template block for this entry
        prepare_entry_block(ws, current_row, ENTRY_BLOCK_START, ENTRY_BLOCK_END)
        
        # 2. Insert the Images (using your existing images.py logic)
        # Image row is usually row 2 of the block (current_row + 1)
        process_and_insert_images(ws, entry, image_cache, current_row + 1, DATA_COLUMNS)
        
        # 3. Write Footers (row 4 of the block: current_row + 3)
        write_footers(ws, current_row + 3, entry, FOOTER_COLUMNS)
        
        # 4. Move down to the next block
        current_row += ENTRY_HEIGHT