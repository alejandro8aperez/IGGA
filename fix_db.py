import sqlite3
conn = sqlite3.connect('db.sqlite3')
conn.execute("UPDATE informe_diario_informediario SET elaborado_por='', revisado_por='' WHERE id=5")
conn.commit()
result = conn.execute("SELECT id, elaborado_por, revisado_por FROM informe_diario_informediario WHERE id=5").fetchall()
print('Resultado:', result)
conn.close()
