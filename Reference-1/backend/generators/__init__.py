# generators/__init__.py
print("📦 Initializing generators package...")

try:
    from .excel.engine import export_excel
    print("✅ Excel engine loaded")
    from .pdf.engine import export_pdf
    print("✅ PDF engine loaded")
except Exception as e:
    print(f"❌ Error during package init: {e}")

__all__ = ["export_excel", "export_pdf"]