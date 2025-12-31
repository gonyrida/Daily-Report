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

def get_image_bytes(file_obj):
    """
    Standardizes the extraction of bytes from a Flask/Werkzeug file stream.
    Used by both PDF and Excel generators.
    """
    if not file_obj:
        return None
    file_obj.stream.seek(0)
    return file_obj.read()