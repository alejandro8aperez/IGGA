import openpyxl
import sys

try:
    wb = openpyxl.load_workbook('Cotizacion_KAVE-0003.xlsx')
    ws = wb.active

    with open('excel_layout.txt', 'w', encoding='utf-8') as f:
        for r in ws.iter_rows():
            for c in r:
                if c.value is not None:
                    # check if bold
                    style = "BOLD" if c.font and c.font.bold else "NORMAL"
                    f.write(f"{c.coordinate} [{style}]: {c.value}\n")
        
        f.write("\nMERGED CELLS:\n")
        for group in ws.merged_cells.ranges:
            f.write(f"{group}\n")
            
    print("Extracted successfully.")
except Exception as e:
    print(f"Error: {e}")
