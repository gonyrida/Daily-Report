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
from openpyxl.styles import Alignment

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

def fill_reference_sheet(ws, reference_entries, table_title="PHOTO REFERENCE"):
    # 1. Write the static Table Title
    write_to_merged_safe(ws, 3, 2, f"◙ {table_title}")
    ws.cell(row=3, column=1).alignment = Alignment(horizontal='center', vertical='center')

    current_row = ENTRY_BLOCK_START # Row 6
    last_section = None
    image_cache = {}

    for entry in reference_entries:
        current_section = entry.get("section_title")

        # 2. SECTION HEADER LOGIC
        if current_section and current_section != last_section:
            if last_section is not None:
                # CLONE ROW 5 (The Section Title) to the current row
                copy_row(ws, 5, current_row)
                copy_merged_cells(ws, 5, 5, current_row - 5)
                write_to_merged_safe(ws, current_row, 2, current_section)
                current_row += 1 # Move past the header row
            else:
                # First section: write to existing Row 5
                write_to_merged_safe(ws, 5, 2, current_section)
            
            last_section = current_section

        # 3. IMAGE BLOCK LOGIC (Old Project Style)
        prepare_entry_block(ws, current_row, ENTRY_BLOCK_START, ENTRY_BLOCK_END)
        process_and_insert_images(ws, entry, image_cache, current_row + 1, DATA_COLUMNS)
        write_footers(ws, current_row + 3, entry, FOOTER_COLUMNS)
        
        current_row += ENTRY_HEIGHT