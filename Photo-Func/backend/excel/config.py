import os

# -------------------------
# Paths
# -------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
TEMPLATE_FILE = os.path.join(BASE_DIR, "template.xlsx")

# -------------------------
# Columns (1-based)
# -------------------------
DATA_COLUMNS = [2, 4]    # B, D for images
FOOTER_COLUMNS = [2, 4]  # B, D for footers

# -------------------------
# Entry block layout (from template)
# -------------------------
TOP_PADDING_ROWS = 1      # number of rows above image
IMAGE_ROWS = 1            # number of image rows
BOTTOM_PADDING_ROWS = 1   # number of rows below image
FOOTER_ROWS = 1           # number of footer rows

ENTRY_BLOCK_START = 6     # first row of entry block (top padding)
ENTRY_BLOCK_END = (
    ENTRY_BLOCK_START
    + TOP_PADDING_ROWS
    + IMAGE_ROWS
    + BOTTOM_PADDING_ROWS
    + FOOTER_ROWS
    - 1
)
ENTRY_HEIGHT = ENTRY_BLOCK_END - ENTRY_BLOCK_START + 1  # total rows per entry

# -------------------------
# Notes
# -------------------------
# Adjust these constants if your template changes layout (e.g., more padding or image rows).
# ENTRY_BLOCK_START should point to the first top padding row of the example entry.
# ENTRY_HEIGHT is automatically calculated.
