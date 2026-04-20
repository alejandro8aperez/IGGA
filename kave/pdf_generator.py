import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Rect, Circle, String

def generar_grafico_fisico(diseno, calculo):
    d = Drawing(400, 250)
    
    es_ei = diseno.forma_nucleo == 'ei'
    esp_total = getattr(calculo, 'espesor_total_bobinado', 20)
    
    def draw_r(x, y, w, h, c):
        r = Rect(200 + x, 125 + y, w, h)
        r.fillColor = colors.HexColor(c)
        r.strokeColor = colors.HexColor(c)
        r.strokeWidth = 0
        return r

    if es_ei:
        an_ventana = diseno.ancho_ventana or 100
        al_ventana = diseno.altura_ventana or 200
        an_pierna = diseno.ancho_pierna or 50
        
        width_total = (an_pierna * 3) + (an_ventana * 2)
        height_total = al_ventana + (an_pierna * 2)
        scale = 200 / max(width_total, height_total, 1)
        
        dpi = an_pierna * scale
        dvex = an_ventana * scale
        dvey = al_ventana * scale
        esp_r = (esp_total * scale) / 2
        w_bobina = min(esp_r, dvex - 2)
        
        # Núcleo completo
        d.add(draw_r(-dpi*1.5 - dvex, -dvey/2 - dpi, dpi*3 + dvex*2, dvey + dpi*2, '#334155'))
        # Ventanas (blanco)
        d.add(draw_r(-dpi/2 - dvex, -dvey/2, dvex, dvey, '#ffffff'))
        d.add(draw_r(dpi/2, -dvey/2, dvex, dvey, '#ffffff'))
        # Pierna Central
        d.add(draw_r(-dpi/2, -dvey/2 - dpi, dpi, dvey + dpi*2, '#475569'))
        
        # Baja Tensión (Interna)
        d.add(draw_r(-dpi/2 - w_bobina, -dvey/2 + 2, w_bobina, dvey - 4, '#F97316'))
        d.add(draw_r(dpi/2, -dvey/2 + 2, w_bobina, dvey - 4, '#F97316'))
        
        # Alta Tensión (Externa)
        d.add(draw_r(-dpi/2 - w_bobina, -dvey/2 + 2, w_bobina*0.4, dvey - 4, '#3B82F6'))
        d.add(draw_r(dpi/2 + w_bobina*0.6, -dvey/2 + 2, w_bobina*0.4, dvey - 4, '#3B82F6'))
        
        s = String(200, 125, f"{an_pierna}mm")
        s.fillColor = colors.white
        s.textAnchor = 'middle'
        d.add(s)

    else:
        # Toroidal
        c1 = Circle(200, 125, 90)
        c1.fillColor, c1.strokeColor = colors.HexColor('#475569'), colors.HexColor('#475569')
        d.add(c1)
        c2 = Circle(200, 125, 40)
        c2.fillColor, c2.strokeColor = colors.white, colors.white
        d.add(c2)
        
        c3 = Circle(200, 125, 80)
        c3.fillColor, c3.strokeColor = colors.HexColor('#F97316'), colors.HexColor('#F97316')
        d.add(c3)
        c4 = Circle(200, 125, 62)
        c4.fillColor, c4.strokeColor = colors.white, colors.white
        d.add(c4)
        
        c5 = Circle(200, 125, 55)
        c5.fillColor, c5.strokeColor = colors.HexColor('#3B82F6'), colors.HexColor('#3B82F6')
        d.add(c5)
        c6 = Circle(200, 125, 45)
        c6.fillColor, c6.strokeColor = colors.white, colors.white
        d.add(c6)

    # Leyenda básica manual
    d.add(draw_r(-100, -120, 10, 10, '#475569'))
    s1 = String(115, -112, "Nucleo Magnético")
    s1.fontSize = 8
    d.add(s1)
    
    d.add(draw_r(0, -120, 10, 10, '#F97316'))
    s2 = String(215, -112, "Baja Tensión")
    s2.fontSize = 8
    d.add(s2)
    
    d.add(draw_r(100, -120, 10, 10, '#3B82F6'))
    s3 = String(315, -112, "Alta Tensión")
    s3.fontSize = 8
    d.add(s3)

    return d

def generar_ficha_tecnica_pdf(diseno, calculo):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle', parent=styles['Heading1'],
        alignment=1, fontSize=16, spaceAfter=20, textTransform='uppercase'
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Heading2'],
        fontSize=12, textColor=colors.HexColor('#4F46E5'), spaceBefore=15, spaceAfter=10
    )
    normal_style = styles['Normal']
    
    elements = []

    # Emcabezado ISO
    header_data = [
        [
            Paragraph("<b>8-AMPERIOS</b>", normal_style),
            Paragraph("<b>SISTEMA DE GESTIÓN ISO 9001</b>", normal_style),
            Paragraph(f"<b>FECHA:</b> {datetime.now().strftime('%d/%m/%Y')}", normal_style)
        ],
        [
            Paragraph("Fábrica de Transformadores", normal_style),
            Paragraph("Ficha Técnica Constructiva", normal_style),
            Paragraph(f"<b>CÓDGIGO:</b> SGC-FT-KAVE-{str(diseno.id).zfill(4)}", normal_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[2*inch, 3*inch, 2*inch])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9'))
    ]))
    
    elements.append(header_table)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph(f"PROTOCOLO DE DISEÑO ELÉCTRICO Y FÍSICO", title_style))
    
    elements.append(Paragraph(f"1. PARÁMETROS NOMINALES", subtitle_style))
    data_nominales = [
        ["Potencia (kVA)", f"{diseno.potencia_kva}"],
        ["Voltaje Primario (V)", f"{diseno.vp}"],
        ["Voltaje Secundario (V)", f"{diseno.vs}"],
        ["Sistema", f"{diseno.get_tipo_display().upper()}"],
        ["Frecuencia (Hz)", f"{diseno.frecuencia}"],
        ["Refrigeración", f"{diseno.get_refrigeracion_display().upper()}"]
    ]
    t1 = Table(data_nominales, colWidths=[3*inch, 3*inch])
    t1.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC'))]))
    elements.append(t1)

    elements.append(Paragraph(f"2. NÚCLEO MAGNÉTICO", subtitle_style))
    data_nucleo = [
        ["Morfología", f"{diseno.get_forma_nucleo_display()}"],
        ["Material", f"{diseno.get_material_display()}"],
        ["Área Efectiva", f"{calculo.area_nucleo} cm²"],
        ["Factor Apilamiento", f"{diseno.factor_apilamiento}"],
        ["Peso Estimado", f"{getattr(calculo, 'peso_nucleo_estimado', 'N/A')} kg"]
    ]
    t2 = Table(data_nucleo, colWidths=[3*inch, 3*inch])
    t2.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC'))]))
    elements.append(t2)

    elements.append(Paragraph(f"3. DEVANADOS (MATERIAL: {diseno.get_material_bobinas_display().upper()})", subtitle_style))
    data_devanados = [
        ["", "ALTA TENSIÓN (PRI)", "BAJA TENSIÓN (SEC)"],
        ["Vueltas Requeridas", f"{calculo.vueltas_primario}", f"{calculo.vueltas_secundario}"],
        ["Sección Teórica (mm²)", f"{round(calculo.area_conductor_primario,2)}", f"{round(calculo.area_conductor_secundario,2)}"],
        ["Calibre / Dimensiones", f"{calculo.calibre_awg_primario}", f"{calculo.calibre_awg_secundario}"],
        ["Conductor Físico", f"{calculo.get_tipo_conductor_primario_display()}", f"{calculo.get_tipo_conductor_secundario_display()}"]
    ]
    t3 = Table(data_devanados, colWidths=[2.5*inch, 2.25*inch, 2.25*inch])
    t3.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey), 
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
        ('ALIGN', (1,0), (-1,-1), 'CENTER')
    ]))
    elements.append(t3)

    elements.append(Paragraph(f"4. TERMODINÁMICA Y RENDIMIENTO", subtitle_style))
    data_rendimiento = [
        ["Pérdidas de Cortocircuito (Pcu)", f"{round(calculo.perdidas_cobre, 2)} W"],
        ["Pérdidas de Vacío (P0)", f"{round(calculo.perdidas_nucleo, 2)} W"],
        ["Pérdidas Totales", f"{round(calculo.perdidas_totales, 2)} W"],
        ["Impedancia Z Calculada", f"{getattr(calculo, 'impedancia_z', 'N/A')} %"],
        ["Elevación de Temperatura (ΔT)", f"{getattr(calculo, 'elevacion_temperatura_c', 'N/A')} °C"],
        ["Peso En Bobinas", f"{getattr(calculo, 'peso_cobre_estimado', 'N/A')} kg"]
    ]
    t4 = Table(data_rendimiento, colWidths=[3*inch, 3*inch])
    t4.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC'))]))
    elements.append(t4)
    
    # 5. GRAFICO VECTORIAL
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"5. PLANO FÍSICO CONSTRUCTIVO", subtitle_style))
    grafico = generar_grafico_fisico(diseno, calculo)
    elements.append(grafico)
    
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("__________________________________________", normal_style))
    elements.append(Paragraph("<b>FIRMA INGENIERO DISEÑADOR / GERENTE TÉCNICO</b>", normal_style))
    elements.append(Paragraph(f"Ficha generada automáticamente por módulo KAVE ERP.", ParagraphStyle('small', fontSize=8, textColor=colors.grey)))

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
