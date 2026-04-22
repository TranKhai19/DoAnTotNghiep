import pandas as pd
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write('--- BOOK1.XLSX ---\n')
    f.write(pd.read_excel('e:/FinalProject/DoAnTotNghiep/Book1.xlsx').to_markdown())
    f.write('\n--- SCENARIO.XLSX ---\n')
    f.write(pd.read_excel('e:/FinalProject/DoAnTotNghiep/Scenario.xlsx').to_markdown())
