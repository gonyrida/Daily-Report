# generators/pdf/engine.py
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
# generators/pdf/engine.py
from . import drawer  # Import the whole module instead of specific functions

# Local imports from drawer.py
from .drawer import draw_section_header, draw_entry_block

def export_pdf(sections, files):
    output = BytesIO()
    c = canvas.Canvas(output, pagesize=A4)
    page_width, page_height = A4
    margin = 50
    y = page_height - margin

    # Configuration (These could also be moved to common/config.py later)
    column_widths = [(page_width - 2*margin)/2] * 2
    image_height = 267
    footer_height = 20
    padding_height = 15

    for section in sections:
        # 1. Section Header
        drawer.draw_section_header(c, section["title"], margin, y, sum(column_widths), 30)
        y -= 30

        # 2. Entries
        for entry in section.get("entries", []):
            # Check if we need a new page (Optional future logic here)
            y = drawer.draw_entry_block(c, entry, files, margin, y, column_widths, image_height, footer_height, padding_height)

        y -= 10  # Spacing between sections

    c.showPage()
    c.save()
    output.seek(0)
    return output