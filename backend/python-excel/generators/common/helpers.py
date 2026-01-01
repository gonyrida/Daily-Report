# generators/common/helpers.py
from io import BytesIO
from PIL import Image
import textwrap

def write_to_merged_safe(ws, row, col, value):
    """
    Safely writes a value to a cell that might be part of a merged range.
    Openpyxl requires writing to the top-left cell of a merge to display correctly.
    """
    for merged in ws.merged_cells.ranges:
        if (
            merged.min_row <= row <= merged.max_row
            and merged.min_col <= col <= merged.max_col
        ):
            # Write to the absolute top-left coordinate of the merge
            ws.cell(row=merged.min_row, column=merged.min_col).value = value
            return
            
    # If not merged, write normally
    ws.cell(row=row, column=col).value = value

def get_image_from_path(file_path):
    """
    New helper: Reads an image from a local path if Node.js 
    saves the file to a 'uploads' folder first.
    """
    if not file_path or not os.path.exists(file_path):
        return None
    with open(file_path, 'rb') as f:
        return f.read()

def write_wrapped_rows(ws, start_row, col, text, max_rows, width=55):
    """
    Python version of splitIntoRows (Node.js lines 623-644).
    Spreads text across multiple vertical rows.
    """
    if not text:
        return
    
    # Wrap the text into a list of strings
    lines = textwrap.wrap(str(text), width=width)
    
    # Write each line to a subsequent row
    for i in range(min(len(lines), max_rows)):
        ws.cell(row=start_row + i, column=col).value = lines[i]

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