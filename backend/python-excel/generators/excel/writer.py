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
import textwrap
from copy import copy
from ..common.helpers import write_wrapped_rows
from openpyxl.styles import Alignment

def to_num(value):
    """
    Safely converts a value to a float. 
    Equivalent to the Node.js 'safeNumber' logic.
    """
    try:
        if value is None or value == "":
            return 0.0
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def copy_cell_style(source_cell, target_cell):
    """Copies all styling from one cell to another."""
    if source_cell.has_style:
        target_cell.font = copy(source_cell.font)
        target_cell.border = copy(source_cell.border)
        target_cell.fill = copy(source_cell.fill)
        target_cell.number_format = copy(source_cell.number_format)
        target_cell.alignment = copy(source_cell.alignment)

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

def fill_report_header(ws, data):
    # We are switching from "B" to "A" because "B" is a read-only MergedCell
    
    # Project Name (A7)
    ws["A7"].value = f"Project Name : {data.get('projectName', '')}"

    # Weather (A8)
    weather_am = data.get('weatherAM', "")
    weather_pm = data.get('weatherPM', "")
    ws["A8"].value = f"Weather          : AM {weather_am}  |  PM {weather_pm}"

    # Temperature (A9)
    temp_am = f"{data.get('tempAM')}°C" if data.get('tempAM') else ""
    temp_pm = f"{data.get('tempPM')}°C" if data.get('tempPM') else ""
    ws["A9"].value = f"Temperature  : AM {temp_am}    |  PM {temp_pm}"

    # Date (I9) - Usually not merged with H, so I9 should be fine
    report_date = data.get('reportDate')
    if report_date:
        try:
            dt_str = str(report_date).replace('Z', '')
            dt = datetime.fromisoformat(dt_str)
            ws["I9"].value = dt
            ws["I9"].number_format = "yyyy-mm-dd"
        except Exception:
            ws["I9"].value = report_date

from openpyxl.styles import Alignment

from openpyxl.styles import Alignment

def fill_activities(ws, data):
    # Define the "Left-Top" style
    report_style = Alignment(horizontal='left', vertical='top', wrap_text=True)
    
    # 1. Fill and Style Activities Today (Col B, Rows 12 to 21)
    write_wrapped_rows(ws, start_row=12, col=2, text=data.get('activityToday', ''), max_rows=10)
    for row_idx in range(12, 22): # Apply to all 10 possible rows
        ws.cell(row=row_idx, column=2).alignment = report_style

    # 2. Fill and Style Work Plan (Col G, Rows 12 to 21)
    write_wrapped_rows(ws, start_row=12, col=7, text=data.get('workPlanNextDay', ''), max_rows=10)
    for row_idx in range(12, 22):
        ws.cell(row=row_idx, column=7).alignment = report_style

def fill_team_tables(ws, data):
    mgmt_team = data.get('managementTeam', [])
    work_team = data.get('workingTeam', [])
    
    start_row = 25
    base_rows = 6
    needed_rows = max(base_rows, len(mgmt_team), len(work_team))
    shift = max(0, needed_rows - base_rows)

    # --- STEP 1: CLEAR EXISTING MERGES IN THE DANGER ZONE ---
    # This removes any pre-existing merges from the template in the table area
    # so they don't interfere with our new rows.
    target_range = f"B{start_row}:K{start_row + needed_rows}"
    
    # We have to iterate backwards through the merges to safely remove them
    for merge in list(ws.merged_cells.ranges):
        if merge.coord.startswith('B') or merge.coord.startswith('G'):
            # If the merge overlaps our table area, kill it.
            if merge.min_row >= start_row:
                ws.unmerge_cells(str(merge))
    
    # 1. Insert rows if we have more than 6 members
    if shift > 0:
        # Insert at the end of the base table (Row 31)
        ws.insert_rows(start_row + base_rows, amount=shift)
        
    # 2. STYLE & DATA LOOP (Moved OUTSIDE the shift block)
    for i in range(needed_rows):
        r = start_row + i

        mgmt = mgmt_team[i] if i < len(mgmt_team) else {}
        work = work_team[i] if i < len(work_team) else {}

        # Ensure Merges for every data row
        try:
            ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3) # B:C
            ws.merge_cells(start_row=r, start_column=7, end_row=r, end_column=8) # G:H
        except:
            pass 

        # Style Cloning (Always copy from Row 25 to ensure consistency)
        for col in range(2, 12):
            source_cell = ws.cell(row=25, column=col)
            target_cell = ws.cell(row=r, column=col)
            if source_cell.has_style:
                target_cell.font = copy(source_cell.font)
                target_cell.border = copy(source_cell.border)
                target_cell.fill = copy(source_cell.fill)
                target_cell.alignment = copy(source_cell.alignment)

        # Fill Data
        ws.cell(row=r, column=2).value = mgmt.get('description', '') 
        ws.cell(row=r, column=4).value = mgmt.get('prev', 0)         
        ws.cell(row=r, column=5).value = mgmt.get('today', 0)        
        ws.cell(row=r, column=6).value = f"=D{r}+E{r}"

        ws.cell(row=r, column=7).value = work.get('description', '') 
        ws.cell(row=r, column=9).value = work.get('prev', 0)         
        ws.cell(row=r, column=10).value = work.get('today', 0)       
        ws.cell(row=r, column=11).value = f"=I{r}+J{r}"

    # 3. TOTAL ROW LOGIC
    total_row_idx = start_row + needed_rows
    
    # Apply Merges to Total Row
    try:
        ws.merge_cells(start_row=total_row_idx, start_column=2, end_row=total_row_idx, end_column=3)
        ws.merge_cells(start_row=total_row_idx, start_column=7, end_row=total_row_idx, end_column=8)
    except:
        pass

    ws.cell(row=total_row_idx, column=2).value = "TOTAL"
    ws.cell(row=total_row_idx, column=7).value = "TOTAL"
    
    # Final Formulas
    ws.cell(row=total_row_idx, column=4).value = f"=SUM(D{start_row}:D{total_row_idx-1})"
    ws.cell(row=total_row_idx, column=5).value = f"=SUM(E{start_row}:E{total_row_idx-1})"
    ws.cell(row=total_row_idx, column=6).value = f"=SUM(F{start_row}:F{total_row_idx-1})"
    ws.cell(row=total_row_idx, column=9).value = f"=SUM(I{start_row}:I{total_row_idx-1})"
    ws.cell(row=total_row_idx, column=10).value = f"=SUM(J{start_row}:J{total_row_idx-1})"
    ws.cell(row=total_row_idx, column=11).value = f"=SUM(K{start_row}:K{total_row_idx-1})"

    # Final Style Fix for Total Row (Copy from the original template total row)
    original_total_row = 31 # This is where 'TOTAL' was in the empty template
    for col in range(2, 12):
        source_total = ws.cell(row=original_total_row, column=col)
        target_total = ws.cell(row=total_row_idx, column=col)
        if source_total.has_style:
            target_total.font = copy(source_total.font)
            target_total.border = copy(source_total.border)
            target_total.fill = copy(source_total.fill)
            target_total.alignment = copy(source_total.alignment)
    
    return shift

def fill_material_machinery_tables(ws, data, shifted_offset=0):
    materials = data.get('materials', [])
    machinery = data.get('machinery', [])
    
    # Starting row is 34, adjusted by how many rows the Team section added
    base_material_start = 34
    current_start = base_material_start + shifted_offset
    
    # How many rows we need to fit the data
    needed_rows = max(len(materials), len(machinery), 1)
    # Most templates have about 6 rows reserved for materials
    base_template_rows = 6 

    # --- STYLE & INSERT PATCH ---
    if needed_rows > base_template_rows:
        rows_to_insert = needed_rows - base_template_rows
        # Insert rows at the bottom of the material section
        ws.insert_rows(current_start + base_template_rows, amount=rows_to_insert)
        
        # Copy styles from the first row of materials (current_start) to the new rows
        for i in range(rows_to_insert):
            r = current_start + base_template_rows + i
            for col in range(2, 12): # Columns B through K
                copy_cell_style(ws.cell(row=current_start, column=col), ws.cell(row=r, column=col))

    # --- DATA FILLING ---
    for i in range(needed_rows):
        row_idx = current_start + i
        mat = materials[i] if i < len(materials) else {}
        mach = machinery[i] if i < len(machinery) else {}

        # Materials (B-F)
        ws.cell(row=row_idx, column=2).value = mat.get('description', '')
        ws.cell(row=row_idx, column=3).value = mat.get('unit', '')
        ws.cell(row=row_idx, column=4).value = mat.get('prev', 0)
        ws.cell(row=row_idx, column=5).value = mat.get('today', 0)
        
        # Handle accumulation math safely
        prev_m = to_num(mat.get('prev'))
        today_m = to_num(mat.get('today'))
        ws.cell(row=row_idx, column=6).value = mat.get('accumulated') or (prev_m + today_m)

        # Machinery (G-K)
        ws.cell(row=row_idx, column=7).value = mach.get('description', '')
        ws.cell(row=row_idx, column=8).value = mach.get('unit', '')
        ws.cell(row=row_idx, column=9).value = mach.get('prev', 0)
        ws.cell(row=row_idx, column=10).value = mach.get('today', 0)
        
        # Handle accumulation math safely
        prev_mc = to_num(mach.get('prev'))
        today_mc = to_num(mach.get('today'))
        ws.cell(row=row_idx, column=11).value = mach.get('accumulated') or (prev_mc + today_mc)
    
    # Return the total rows added to the document (Team shift + Material shift)
    # This is crucial for the "One Sheet" approach!
    total_new_offset = shifted_offset + max(0, needed_rows - base_template_rows)
    return total_new_offset