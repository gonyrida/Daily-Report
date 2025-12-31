import io
import json
from flask import Flask, request, send_file
from flask_cors import CORS
from generators import export_excel, export_pdf
import os

app = Flask(__name__)
CORS(app)

@app.route("/export", methods=["POST"])
def export():
    sections = json.loads(request.form["data"])
    files = request.files

    wb = export_excel(sections, files)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="output.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

@app.route("/export_pdf", methods=["POST"])
def export_pdf_route():
    sections = json.loads(request.form["data"])
    files = request.files

    pdf_bytes = export_pdf(sections, files)

    return send_file(
        pdf_bytes,
        as_attachment=True,
        download_name="daily-report.pdf",
        mimetype="application/pdf",
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
