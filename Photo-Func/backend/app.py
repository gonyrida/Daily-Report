import io
import json
from flask import Flask, request, send_file
from flask_cors import CORS

from excel.exporter import export_excel

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

if __name__ == "__main__":
    app.run(debug=True)
