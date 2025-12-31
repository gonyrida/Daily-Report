import io
import os
import openpyxl
from flask import Flask, request, send_file
from flask_cors import CORS

# Import your existing logic
from generators.excel.writer import fill_reference_sheet
# Assuming you'll add logic for Sheet 1 here
# from generators.excel.report import fill_report_sheet 

app = Flask(__name__)
CORS(app)

@app.route("/generate-combined", methods=["POST"])
def generate_combined():
    data = request.json 
    reference_data = data.get("reference", [])

    # 1. Load the Reference Template
    template_path = os.path.join(os.path.dirname(__file__), "templates", "reference-template.xlsx")
    wb = openpyxl.load_workbook(template_path)
    
    # 2. TARGET THE FIRST SHEET (Index 0)
    # This was previously wb.worksheets[1], which caused the error
    ws = wb.worksheets[0] 

    # 3. RUN YOUR LOGIC
    # We use the same writer function we just moved
    fill_reference_sheet(ws, reference_data)

    # 4. Save and Return
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="Reference_Test.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

if __name__ == "__main__":
    # Changed from 5000 to 5001
    port = int(os.environ.get("PORT", 5001)) 
    app.run(host="0.0.0.0", port=port)