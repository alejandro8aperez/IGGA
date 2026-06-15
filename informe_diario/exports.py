"""PDF & Excel exports replicating the original Informe Diario layout."""
import os
from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image,
)


# --------------------------------------------------------------------------
# Excel export
# --------------------------------------------------------------------------

def generar_excel(informe) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = 'INFORME DIARIO'

    bold = Font(bold=True, size=11)
    title_font = Font(bold=True, size=14)
    header_fill = PatternFill('solid', fgColor='D9E1F2')
    thin = Side(border_style='thin', color='000000')
    box = Border(left=thin, right=thin, top=thin, bottom=thin)
    center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    left = Alignment(horizontal='left', vertical='center', wrap_text=True)

    ws.merge_cells('A1:N1')
    ws['A1'] = 'CONSTRUCCIÓN DE OBRA – LIBRO DIARIO DE OBRA / INTERVENTORÍA'
    ws['A1'].font = title_font
    ws['A1'].alignment = center

    ws['A3'] = 'OBRA:'
    ws['B3'] = informe.proyecto.nombre if informe.proyecto else '—'
    ws['A4'] = 'FECHA:'
    ws['B4'] = informe.fecha.strftime('%d/%m/%Y') if informe.fecha else '—'
    ws['A5'] = 'DÍA:'
    ws['B5'] = informe.dia_semana
    for cell in ('A3', 'A4', 'A5'):
        ws[cell].font = bold

    # Reporte de lluvia
    row = 7
    ws.cell(row, 1, 'REPORTE DE LLUVIA (horas con lluvia)').font = bold
    ws.cell(row + 1, 1, 'Hora')
    ws.cell(row + 2, 1, 'Lluvia')
    horas_lluvia = {r.hora: r.con_lluvia for r in informe.reportes_lluvia.all()}
    for h in range(24):
        c1 = ws.cell(row + 1, 2 + h, h)
        c1.font = bold
        c1.alignment = center
        c1.border = box
        c2 = ws.cell(row + 2, 2 + h, 'X' if horas_lluvia.get(h) else '')
        c2.alignment = center
        c2.border = box

    # Maquinaria / Personal
    row = 11
    ws.cell(row, 1, 'MAQUINARIA - EQUIPOS - HERRAMIENTAS - VEHÍCULOS').font = bold
    ws.cell(row, 2, 'CANT.').font = bold
    ws.cell(row, 3, 'EMPRESA').font = bold
    ws.cell(row, 4, 'NOTAS').font = bold
    ws.cell(row, 6, 'PERSONAL DE OBRA').font = bold
    ws.cell(row, 7, 'CANT.').font = bold
    ws.cell(row, 8, 'EMPRESA').font = bold
    ws.cell(row, 9, 'NOTAS').font = bold
    for c in (1, 2, 3, 4, 6, 7, 8, 9):
        ws.cell(row, c).fill = header_fill

    detalles = list(informe.detalles.select_related('recurso__categoria'))
    maquinaria = [d for d in detalles if not d.recurso.categoria.nombre.upper().startswith('PERSONAL')]
    personal = [d for d in detalles if d.recurso.categoria.nombre.upper().startswith('PERSONAL')]
    
    # Unificar con recursos libres
    maquinaria += list(informe.maquinaria_libre.all().order_by('orden'))
    personal += list(informe.personal_libre.all().order_by('orden'))

    max_rows = max(len(maquinaria), len(personal))
    r = row + 1
    for i in range(max_rows):
        if i < len(maquinaria):
            item = maquinaria[i]
            nombre = item.recurso.nombre if hasattr(item, 'recurso') else item.descripcion
            ws.cell(r + i, 1, nombre).alignment = left
            ws.cell(r + i, 2, float(item.cantidad)).alignment = center
            ws.cell(r + i, 3, getattr(item, 'empresa', '')).alignment = left
            ws.cell(r + i, 4, getattr(item, 'notas', '')).alignment = left
        if i < len(personal):
            item = personal[i]
            nombre = item.recurso.nombre if hasattr(item, 'recurso') else item.descripcion
            ws.cell(r + i, 6, nombre).alignment = left
            ws.cell(r + i, 7, float(item.cantidad)).alignment = center
            ws.cell(r + i, 8, getattr(item, 'empresa', '')).alignment = left
            ws.cell(r + i, 9, getattr(item, 'notas', '')).alignment = left

    bottom = r + max_rows + 1
    ws.cell(bottom, 1, 'TOTAL').font = bold
    ws.cell(bottom, 2, sum(float(getattr(d, 'cantidad', 0)) for d in maquinaria))
    ws.cell(bottom, 6, 'Total Personal').font = bold
    ws.cell(bottom, 7, sum(float(getattr(d, 'cantidad', 0)) for d in personal))

    # Observaciones
    bottom += 2
    ws.cell(bottom, 1, 'OBSERVACIONES GENERALES').font = bold
    ws.cell(bottom + 1, 1, informe.observaciones_generales or '').alignment = left
    ws.merge_cells(start_row=bottom + 1, start_column=1, end_row=bottom + 1, end_column=10)

    bottom += 3
    ws.cell(bottom, 1, 'ESTADO DEL TERRENO AL INICIO DE LA JORNADA').font = bold
    ws.cell(bottom, 6, 'ESTADO DEL TERRENO AL FINAL DE LA JORNADA').font = bold
    ws.cell(bottom + 1, 1, informe.estado_terreno_inicio or '').alignment = left
    ws.cell(bottom + 1, 6, informe.estado_terreno_final or '').alignment = left

    # Actividades
    bottom += 3
    cats = {}
    for act in informe.actividades.select_related('categoria').order_by('categoria__orden', 'orden'):
        cats.setdefault(act.categoria.nombre, []).append(act.descripcion)
    for cat_nombre, items in cats.items():
        ws.cell(bottom, 1, cat_nombre).font = bold
        ws.cell(bottom, 1).fill = header_fill
        bottom += 1
        for idx, item in enumerate(items, 1):
            ws.cell(bottom, 1, f"{idx}. {item}").alignment = left
            ws.merge_cells(start_row=bottom, start_column=1,
                           end_row=bottom, end_column=10)
            bottom += 1
        bottom += 1

    # Items de obra
    items_obra = list(informe.items_obra.all().order_by('orden'))
    if items_obra:
        bottom += 1
        ws.cell(bottom, 1, 'ÍTEMS DE OBRA').font = bold
        ws.cell(bottom, 1).fill = header_fill
        bottom += 1
        
        ws.cell(bottom, 1, 'Item').font = bold
        ws.cell(bottom, 2, 'Descripción').font = bold
        ws.cell(bottom, 6, 'Empresa').font = bold
        ws.cell(bottom, 9, 'Cantidad').font = bold
        
        ws.merge_cells(start_row=bottom, start_column=2, end_row=bottom, end_column=5)
        ws.merge_cells(start_row=bottom, start_column=6, end_row=bottom, end_column=8)
        ws.merge_cells(start_row=bottom, start_column=9, end_row=bottom, end_column=10)
        
        bottom += 1
        
        for it in items_obra:
            ws.cell(bottom, 1, it.item).alignment = center
            ws.cell(bottom, 2, it.descripcion).alignment = left
            ws.cell(bottom, 6, it.empresa).alignment = left
            ws.cell(bottom, 9, float(it.cantidad)).alignment = center
            
            ws.merge_cells(start_row=bottom, start_column=2, end_row=bottom, end_column=5)
            ws.merge_cells(start_row=bottom, start_column=6, end_row=bottom, end_column=8)
            ws.merge_cells(start_row=bottom, start_column=9, end_row=bottom, end_column=10)
            bottom += 1

    for col in range(1, 26):
        ws.column_dimensions[get_column_letter(col)].width = 13

    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()


# --------------------------------------------------------------------------
# PDF export
# --------------------------------------------------------------------------

def generar_pdf(informe) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4),
                            leftMargin=1 * cm, rightMargin=1 * cm,
                            topMargin=1 * cm, bottomMargin=1 * cm)
    styles = getSampleStyleSheet()
    HEADER_BG = colors.HexColor('#1e3a8a')  # azul oscuro IGGA
    h1 = ParagraphStyle('h1', parent=styles['Heading1'], fontSize=12,
                        alignment=1, spaceAfter=4)
    h2 = ParagraphStyle('h2', parent=styles['Heading3'], fontSize=9,
                        backColor=HEADER_BG, textColor=colors.white, leading=11,
                        spaceBefore=4, spaceAfter=2)
    body = ParagraphStyle('body', parent=styles['BodyText'], fontSize=8,
                          leading=10)

    flow = []

    # ── Logo IGGA (esquina superior izquierda) ──────────────────────────────
    logo_path = os.path.join(os.path.dirname(__file__), 'static', 'informe_diario', 'logo.png')
    if os.path.isfile(logo_path):
        logo_img = Image(logo_path, width=3.5*cm, height=1.5*cm)
        header_table = Table([[logo_img, Paragraph('CONSTRUCCIÓN DE OBRA – LIBRO DIARIO DE OBRA / INTERVENTORÍA', h1)]],
                             colWidths=[4*cm, 20*cm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        flow.append(header_table)
    else:
        flow.append(Paragraph('CONSTRUCCIÓN DE OBRA – LIBRO DIARIO DE OBRA / INTERVENTORÍA', h1))

    info = [
        ['OBRA:', (informe.proyecto.nombre if informe.proyecto else '—'), 'FECHA:', (informe.fecha.strftime('%d/%m/%Y') if informe.fecha else '—'),
         'DÍA:', informe.dia_semana or '—'],
    ]
    t = Table(info, colWidths=[2 * cm, 10 * cm, 2 * cm, 3 * cm, 1.5 * cm, 3 * cm])
    t.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 8),
        ('FONT', (0, 0), (0, 0), 'Helvetica-Bold', 8),
        ('FONT', (2, 0), (2, 0), 'Helvetica-Bold', 8),
        ('FONT', (4, 0), (4, 0), 'Helvetica-Bold', 8),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.grey),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 6))

    # Reporte lluvia
    flow.append(Paragraph('REPORTE DE LLUVIA (horas con lluvia)', h2))
    horas_lluvia = {r.hora: r.con_lluvia for r in informe.reportes_lluvia.all()}
    fila_h = ['Hora'] + [str(h) for h in range(24)]
    fila_v = ['Lluvia'] + ['X' if horas_lluvia.get(h) else '' for h in range(24)]
    t = Table([fila_h, fila_v], colWidths=[1.6 * cm] + [0.95 * cm] * 24)
    t.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 7),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 7),
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 6))

    # Maquinaria + Personal en dos columnas
    detalles = list(informe.detalles.select_related('recurso__categoria'))
    maquinaria = [d for d in detalles if not d.recurso.categoria.nombre.upper().startswith('PERSONAL')]
    personal = [d for d in detalles if d.recurso.categoria.nombre.upper().startswith('PERSONAL')]
    
    # Unificar con recursos libres (manuales)
    maquinaria += list(informe.maquinaria_libre.all().order_by('orden'))
    personal += list(informe.personal_libre.all().order_by('orden'))

    max_rows = max(len(maquinaria), len(personal), 1)
    data = [['MAQUINARIA - EQUIPOS - HERRAMIENTAS - VEHÍCULOS', 'CANT.',
             'PERSONAL DE OBRA', 'CANT.']]
    for i in range(max_rows):
        # Maquinaria (Izquierda)
        if i < len(maquinaria):
            item = maquinaria[i]
            l_name = item.recurso.nombre if hasattr(item, 'recurso') else item.descripcion
            l_qty = str(item.cantidad)
        else:
            l_name = l_qty = ''
        # Personal (Derecha)
        if i < len(personal):
            item = personal[i]
            r_name = item.recurso.nombre if hasattr(item, 'recurso') else item.descripcion
            r_qty = str(item.cantidad)
        else:
            r_name = r_qty = ''
        data.append([l_name, l_qty, r_name, r_qty])

    data.append(['TOTAL',
                 str(sum(float(getattr(d, 'cantidad', 0)) for d in maquinaria)),
                 'Total Personal',
                 str(sum(float(getattr(d, 'cantidad', 0)) for d in personal))])
    t = Table(data, colWidths=[10 * cm, 2 * cm, 10 * cm, 2 * cm], repeatRows=1)
    t.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 7),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 7),
        ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold', 7),
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, -1), (-1, -1), HEADER_BG),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 6))

    # Observaciones generales
    flow.append(Paragraph('OBSERVACIONES GENERALES', h2))
    flow.append(Paragraph((informe.observaciones_generales or '—').replace('\n', '<br/>'), body))
    flow.append(Spacer(1, 4))

    # Estado del terreno
    t = Table([
        ['ESTADO DEL TERRENO AL INICIO', 'ESTADO DEL TERRENO AL FINAL'],
        [Paragraph((informe.estado_terreno_inicio or '—').replace('\n', '<br/>'), body),
         Paragraph((informe.estado_terreno_final or '—').replace('\n', '<br/>'), body)],
    ], colWidths=[12 * cm, 12 * cm])
    t.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 8),
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 6))

    # Actividades
    cats = {}
    for act in informe.actividades.select_related('categoria').order_by('categoria__orden', 'orden'):
        cats.setdefault(act.categoria.nombre, []).append(act.descripcion)
    for cat_nombre, items in cats.items():
        flow.append(Paragraph(cat_nombre, h2))
        for idx, item in enumerate(items, 1):
            flow.append(Paragraph(f"{idx}. {item}".replace('\n', '<br/>'), body))
        flow.append(Spacer(1, 4))

    # Items de obra
    items_obra = list(informe.items_obra.all().order_by('orden'))
    if items_obra:
        flow.append(Paragraph('ÍTEMS DE OBRA', h2))
        data_items = [['Item', 'Descripción', 'Empresa', 'Cantidad']]
        for it in items_obra:
            data_items.append([
                Paragraph(it.item, body),
                Paragraph(it.descripcion.replace('\n', '<br/>'), body),
                Paragraph(it.empresa, body),
                Paragraph(str(float(it.cantidad)), body)
            ])
        t_items = Table(data_items, colWidths=[2 * cm, 12 * cm, 6 * cm, 4 * cm])
        t_items.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), 'Helvetica', 7),
            ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 7),
            ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        flow.append(t_items)
        flow.append(Spacer(1, 6))

    # Anexos
    anexos = list(informe.anexos.all())
    if anexos:
        flow.append(PageBreak())
        flow.append(Paragraph('ANEXOS FOTOGRÁFICOS', h1))
        for a in anexos:
            try:
                from reportlab.platypus import Image as RLImage
                img_path = a.imagen.url if a.imagen else None
                if img_path and img_path.startswith('http'):
                    flow.append(Paragraph(f"<b>Sección:</b> {a.get_seccion_display()}", body))
                    flow.append(Paragraph(f"<b>Descripción:</b> {a.descripcion}", body))
                    flow.append(Paragraph(f'<link href="{img_path}">{img_path}</link>', body))
                else:
                    flow.append(Paragraph(f"<b>{a.get_seccion_display()}:</b> {a.descripcion}", body))
                flow.append(Spacer(1, 4))
            except Exception:
                continue

    doc.build(flow)
    return buf.getvalue()
