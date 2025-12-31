# python-excel/generators/excel/images.py
import os
from io import BytesIO
from openpyxl.drawing.image import Image as XLImage
from openpyxl.drawing.spreadsheet_drawing import TwoCellAnchor, AnchorMarker

def process_and_insert_images(ws, entry, image_cache, image_row, data_columns):
    """
    Revised to work with both file paths (Node.js style) and streams.
    Note: 'files' argument removed, assuming image_cache or paths within 'entry'.
    """
    # entry["images"] might now be a list of local file paths from Node.js
    for idx, img_source in enumerate(entry.get("images", [])):
        if not img_source or idx >= len(data_columns):
            continue

        # 1. Get Image Bytes
        if img_source not in image_cache:
            if isinstance(img_source, str) and os.path.exists(img_source):
                # If Node.js sent a file path
                with open(img_source, 'rb') as f:
                    image_cache[img_source] = f.read()
            elif hasattr(img_source, 'read'):
                # If it's still a file-like object (old flask style)
                img_source.seek(0)
                image_cache[img_source] = img_source.read()
            else:
                continue

        img_data = BytesIO(image_cache[img_source])
        img = XLImage(img_data)
        
        # 2. Anchor Logic (Exactly your old working math)
        col_start = data_columns[idx] - 1
        row_start = image_row - 1
        
        _from = AnchorMarker(col=col_start, colOff=0, row=row_start, rowOff=0)
        _to = AnchorMarker(
            col=col_start, 
            colOff=int(4.93 * 914400), # Your template width
            row=row_start, 
            rowOff=int(3.7 * 914400)   # Your template height
        )
        
        anchor = TwoCellAnchor(editAs='oneCell') 
        anchor._from = _from
        anchor.to = _to
        
        img.anchor = anchor
        ws.add_image(img)