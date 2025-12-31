# generators/common/config.py
import os

# 1. Update Path Logic
# __file__ is generators/common/config.py
# .parent is generators/common/
# .parent.parent is generators/
# .parent.parent.parent is backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATE_FILE = os.path.join(BASE_DIR, "template.xlsx")

# 2. Excel-Specific Layout (1-based)
DATA_COLUMNS = [2, 4]    # B, D for images
FOOTER_COLUMNS = [2, 4]  # B, D for footers

TOP_PADDING_ROWS = 1
IMAGE_ROWS = 1
BOTTOM_PADDING_ROWS = 1
FOOTER_ROWS = 1

ENTRY_BLOCK_START = 6
ENTRY_BLOCK_END = (
    ENTRY_BLOCK_START
    + TOP_PADDING_ROWS
    + IMAGE_ROWS
    + BOTTOM_PADDING_ROWS
    + FOOTER_ROWS
    - 1
)
ENTRY_HEIGHT = ENTRY_BLOCK_END - ENTRY_BLOCK_START + 1

# 3. PDF-Specific Layout (New additions for modularity)
PDF_MARGIN = 50
PDF_IMAGE_HEIGHT = 267
PDF_FOOTER_HEIGHT = 20
PDF_PADDING_HEIGHT = 15