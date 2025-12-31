# generators/pdf/drawer.py
from io import BytesIO
from PIL import Image
from reportlab.lib import colors

def draw_image(c, img_bytes, x, y, width, height):
    """Draws and scales a single image on the canvas."""
    img = Image.open(BytesIO(img_bytes))
    ratio = min(width / img.width, height / img.height)
    # Positioning logic for ReportLab (y is top-down)
    c.drawInlineImage(img, x, y - img.height*ratio, img.width*ratio, img.height*ratio)

def draw_footer_row(c, text, x, y, width, height, align="left"):
    """Draws a bordered text box for footer data."""
    c.setStrokeColor(colors.black)
    c.rect(x, y - height, width, height, fill=0, stroke=1)
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    
    if align == "center":
        c.drawCentredString(x + width/2, y - height/2 - 4, text)
    elif align == "right":
        c.drawRightString(x + width - 2, y - height/2 - 4, text)
    else:
        c.drawString(x + 2, y - height/2 - 4, text)

def draw_entry_block(c, entry, files, x, y, column_widths, image_height, footer_height, padding_height):
    """Coordinates drawing images and their associated footers for one entry."""
    current_y = y - padding_height 

    # Images side by side
    for idx, key in enumerate(entry.get("images", {})):
        file_obj = files.get(key)
        if file_obj:
            file_obj.stream.seek(0)
            img_bytes = file_obj.read()

            draw_image(
                c,
                img_bytes,
                x + sum(column_widths[:idx]),
                current_y,
                column_widths[idx],
                image_height
            )

    current_y -= (image_height + padding_height)

    # Footers
    for idx, text in enumerate(entry.get("footers", [])):
        draw_footer_row(
            c,
            text,
            x + sum(column_widths[:idx]),
            current_y,
            column_widths[idx],
            footer_height
        )

    return current_y - footer_height

def draw_section_header(c, title, x, y, width, height):
    """Draws a themed blue header box for sections."""
    c.setFillColor(colors.HexColor("#D9E1F2"))
    c.rect(x, y - height, width, height, fill=1, stroke=0)
    c.setStrokeColor(colors.black)
    c.rect(x, y - height, width, height, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.black)
    c.drawCentredString(x + width/2, y - height/2 - 4, title)