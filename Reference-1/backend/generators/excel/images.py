# generators/excel/images.py
from io import BytesIO
from openpyxl.drawing.image import Image as XLImage
from openpyxl.drawing.spreadsheet_drawing import TwoCellAnchor, AnchorMarker

def process_and_insert_images(ws, entry, files, image_cache, image_row, data_columns):
    """
    Handles the precise anchoring of images within Excel cells.
    Uses 'oneCell' anchoring to ensure images move with cells but maintain aspect ratio.
    """
    for idx, img_key in enumerate(entry.get("images", {})):
        file_obj = files.get(img_key)
        if not file_obj or idx >= len(data_columns):
            continue

        # Use cache to avoid re-reading the same image stream multiple times
        if img_key not in image_cache:
            file_obj.stream.seek(0)
            image_cache[img_key] = file_obj.read()

        img = XLImage(BytesIO(image_cache[img_key]))
        
        # Openpyxl uses 0-indexed coordinates for anchors
        col_start = data_columns[idx] - 1
        row_start = image_row - 1
        
        # Define the anchor points
        # 1 inch = 914400 EMUs (English Metric Units)
        _from = AnchorMarker(col=col_start, colOff=0, row=row_start, rowOff=0)
        _to = AnchorMarker(
            col=col_start, 
            colOff=int(4.93 * 914400), # Width based on your template design
            row=row_start, 
            rowOff=int(3.7 * 914400)   # Height matching the 267 points in writer.py
        )
        
        anchor = TwoCellAnchor(editAs='oneCell') 
        anchor._from = _from
        anchor.to = _to
        
        img.anchor = anchor
        ws.add_image(img)