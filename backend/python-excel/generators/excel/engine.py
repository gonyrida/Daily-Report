# python-excel/generators/excel/writer.py
from .templates import copy_row, copy_merged_cells
from ..common.helpers import write_to_merged_safe
from .images import process_and_insert_images
from ..common.config import (
    ENTRY_BLOCK_START, 
    ENTRY_BLOCK_END, 
    ENTRY_HEIGHT, 
    DATA_COLUMNS, 
    FOOTER_COLUMNS
)

def prepare_entry_block(ws, current_row, template_start, template_end):
    if current_row != template_start:
        offset = current_row - template_start
        for r in range(template_start, template_end + 1):
            copy_row(ws, r, current_row + (r - template_start))
        copy_merged_cells(ws, template_start, template_end, offset)
    
    # Matching the 3.7 inch image height defined in images.py
    ws.row_dimensions[current_row + 1].height = 267

def write_footers(ws, row, entry, footer_columns):
    footers = entry.get("footers", ["", ""])
    for idx, text in enumerate(footers):
        if idx < len(footer_columns):
            write_to_merged_safe(ws, row, footer_columns[idx], text)