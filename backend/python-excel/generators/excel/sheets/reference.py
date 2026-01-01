from ...excel.templates import copy_row, copy_merged_cells
from ...common.helpers import write_to_merged_safe
from openpyxl.styles import Alignment
from ...common.config import (
    ENTRY_BLOCK_START, 
    ENTRY_BLOCK_END, 
    ENTRY_HEIGHT, 
    DATA_COLUMNS, 
    FOOTER_COLUMNS
)
from ..images import process_and_insert_images
from openpyxl.worksheet.pagebreak import Break

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
    
    # --- 2. THE COUNTER ---
    entries_on_current_page = 0 

    for entry in reference_entries:
        current_section = entry.get("section_title")

        # 2. SECTION HEADER LOGIC
        if current_section and current_section != last_section:
            # Check if we need a break BEFORE starting a new section title
            # Only if we are NOT at the very start of the document
            if last_section is not None:
                # If we have 4 entries already, we will break anyway in step 3.
                # But if you want a clean break for new sections, you'd check here.
                # For "Dynamic 4-per-page", we let the entry counter handle it.
                
                copy_row(ws, 5, current_row)
                copy_merged_cells(ws, 5, 5, current_row - 5)
                write_to_merged_safe(ws, current_row, 2, current_section)
                current_row += 1 
            else:
                write_to_merged_safe(ws, 5, 2, current_section)
            
            last_section = current_section

        # --- 3. THE SMART PAGE BREAK ---
        # If we just finished 4 entries, drop a break before the next entry starts
        if entries_on_current_page == 4:
            ws.row_breaks.append(Break(id=current_row - 1))
            entries_on_current_page = 0 # Reset the count for the new page

        # 4. IMAGE BLOCK LOGIC
        prepare_entry_block(ws, current_row, ENTRY_BLOCK_START, ENTRY_BLOCK_END)
        process_and_insert_images(ws, entry, image_cache, current_row + 1, DATA_COLUMNS)
        write_footers(ws, current_row + 3, entry, FOOTER_COLUMNS)
        
        current_row += ENTRY_HEIGHT
        entries_on_current_page += 1 # <--- 4. INCREMENT COUNTER

    # Final Setup
    ws.print_title_rows = '1:4'
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0 # Essential for dynamic breaks