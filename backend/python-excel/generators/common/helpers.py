# generators/common/helpers.py
from io import BytesIO
from PIL import Image

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