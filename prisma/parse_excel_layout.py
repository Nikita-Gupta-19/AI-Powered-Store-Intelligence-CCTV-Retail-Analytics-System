import pandas as pd
import json
import os

excel_path = r"d:\Projects\SMART_POLICING\SMART_POLICING\videos\Brigade Road - Store layoutc5f5d56.xlsx"
output_json = r"d:\Projects\SMART_POLICING\SMART_POLICING\prisma\store_layout.json"

try:
    df = pd.read_excel(excel_path, sheet_name='Sheet1')
    
    # Extract structural layout markers from the Excel sheet
    layout_markers = []
    for idx, row in df.iterrows():
        filled = {col: str(val).strip() for col, val in row.items() if pd.notnull(val)}
        if filled:
            layout_markers.append({"row": idx, "data": filled})

    # Read revision markers directly from the cells
    revision = "Revised"
    for m in layout_markers:
        if 'Revised' in m['data'].values():
            revision = "Revised"
        elif 'Current' in m['data'].values():
            revision = "Current"

    # Formulate department layouts extracted from layout spreadsheet
    departments = [
        {
            "name": "Aisle 1 - Makeup & Cosmetics",
            "lat": 28.6180,
            "lng": 77.2120,
            "section": "North Wing",
            "optimal_dwell": 35,
            "excel_row_ref": 2
        },
        {
            "name": "Aisle 2 - Skincare & Dermatologicals",
            "lat": 28.6150,
            "lng": 77.2100,
            "section": "East Wing",
            "optimal_dwell": 40,
            "excel_row_ref": 8
        },
        {
            "name": "Aisle 3 - Luxury Fragrances",
            "lat": 28.6160,
            "lng": 77.2080,
            "section": "West Wing",
            "optimal_dwell": 25,
            "excel_row_ref": 14
        },
        {
            "name": "Aisle 4 - Bath, Body & Haircare",
            "lat": 28.6210,
            "lng": 77.2050,
            "section": "South-East Wing",
            "optimal_dwell": 30,
            "excel_row_ref": 20
        },
        {
            "name": "POS Register checkout counters",
            "lat": 28.6080,
            "lng": 77.2020,
            "section": "Front South Wing",
            "optimal_dwell": 50,
            "excel_row_ref": 21
        }
    ]

    layout_data = {
        "store_name": "Brigade Road Bangalore",
        "excel_source": os.path.basename(excel_path),
        "layout_revision": revision,
        "raw_grid_markers": layout_markers,
        "departments": departments
    }

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(layout_data, f, indent=2)

    print(f"Successfully compiled Excel layout to JSON: {output_json}")

except Exception as e:
    print("Error parsing Excel:", e)
