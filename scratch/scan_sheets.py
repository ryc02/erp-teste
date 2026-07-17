import os
import pandas as pd
import openpyxl

docs_dir = r"C:\Users\rycha\OneDrive\Documents"

for file in os.listdir(docs_dir):
    if file.endswith((".xls", ".xlsx")):
        file_path = os.path.join(docs_dir, file)
        try:
            # We can inspect sheet names
            if file.endswith(".xlsx"):
                wb = openpyxl.load_workbook(file_path, read_only=True)
                sheets = wb.sheetnames
                print(f"[XLSX] {file} - Sheets: {sheets}")
                # Let's search inside sheets for keywords
                for sheet in sheets[:3]:
                    df = pd.read_excel(file_path, sheet_name=sheet, nrows=10)
                    cols = [str(c) for c in df.columns]
                    if any("modulo" in c.lower() or "módulo" in c.lower() or "valor" in c.lower() or "preço" in c.lower() or "preco" in c.lower() for c in cols):
                        print(f"  Found potential column in sheet {sheet}: {cols}")
            else:
                # XLS file
                xl = pd.ExcelFile(file_path)
                sheets = xl.sheet_names
                print(f"[XLS] {file} - Sheets: {sheets}")
                for sheet in sheets[:3]:
                    df = pd.read_excel(file_path, sheet_name=sheet, nrows=10)
                    cols = [str(c) for c in df.columns]
                    if any("modulo" in c.lower() or "módulo" in c.lower() or "valor" in c.lower() or "preço" in c.lower() or "preco" in c.lower() for c in cols):
                        print(f"  Found potential column in sheet {sheet}: {cols}")
        except Exception as e:
            # print(f"Error reading {file}: {e}")
            pass
