from io import BytesIO
from openpyxl.drawing.image import Image as XLImage
from openpyxl.drawing.spreadsheet_drawing import TwoCellAnchor, AnchorMarker

def process_and_insert_images(ws, entry, files, image_cache, image_row, data_columns):
    """
    Uses TwoCellAnchor to achieve 'Move and Size with cells' behavior.
    This anchors the image to the grid so it stays put in Print Preview.
    """
    for idx, img_key in enumerate(entry.get("images", {})):
        file_obj = files.get(img_key)
        if not file_obj or idx >= len(data_columns):
            continue

        if img_key not in image_cache:
            file_obj.stream.seek(0)
            image_cache[img_key] = file_obj.read()

        img = XLImage(BytesIO(image_cache[img_key]))
        
        # 0-indexed coordinates
        col_start = data_columns[idx] - 1
        row_start = image_row - 1
        
        # We anchor it from the start cell to the same cell (or next)
        # AnchorMarker(column, column_offset, row, row_offset)
        # Offsets are in EMUs (1 inch = 914400 EMUs)
        _from = AnchorMarker(col=col_start, colOff=0, row=row_start, rowOff=0)
        _to = AnchorMarker(col=col_start, colOff=int(4.93 * 914400), 
                          row=row_start, rowOff=int(3.7 * 914400))
        
        anchor = TwoCellAnchor(editAs='oneCell') # This is the "Move but don't size" magic
        anchor._from = _from
        anchor.to = _to
        
        img.anchor = anchor
        ws.add_image(img)