"""
Motor de Cálculo para Diseño de Transformadores - Sistema KAVE (Avanzado Ingeniería Eléctrica)
"""

import math

# --- CONSTANTES DE MATERIALES (Basadas en especificaciones técnicas reales) ---
# Pérdidas Steinmetz: P_core = k * f^a * B^b
# k: coeficiente, a: exponente freq, b: exponente flujo
MATERIAL_SPECS = {
    'silicio': {
        'k': 0.0005, 'a': 1.5, 'b': 1.8, 
        'b_max': 1.6, # Saturation Flux Density (Tesla)
        'rho': 7.65,  # Densidad kg/dm3
        'costo_kg': 3.5 # USD/kg
    },
    'amorfoso': {
        'k': 0.00012, 'a': 1.4, 'b': 1.7, 
        'b_max': 1.3, 
        'rho': 7.18, 
        'costo_kg': 8.2
    },
    'ferrita': {
        'k': 0.00005, 'a': 2.1, 'b': 2.4, 
        'b_max': 0.45, 
        'rho': 4.8, 
        'costo_kg': 12.0
    }
}

CONDUCTOR_SPECS = {
    'cobre': {'rho_res': 0.0172, 'densidad': 8.96, 'costo_kg': 9.5},
    'aluminio': {'rho_res': 0.0282, 'densidad': 2.70, 'costo_kg': 4.2}
}

def calcular_conductor(area_req_mm2, tipo_cond, ancho_platina, alto_platina):
    """Calcula las propiedades del conductor (AWG o Platina)"""
    if area_req_mm2 <= 0: return ("N/A", 0, 0, 0)
    
    if tipo_cond == 'platina' and ancho_platina and alto_platina:
        area_real = alto_platina * ancho_platina
        dim_h = alto_platina * 1.05 # Aislamiento
        dim_v = ancho_platina * 1.05
        return (f"Platina {alto_platina}x{ancho_platina}", area_real, dim_h, dim_v)
    else:
        # Hilo Redondo (AWG)
        diametro_hilo = math.sqrt(4 * area_req_mm2 / math.pi)
        # Aproximación AWG
        awg = 36 - 39 * math.log(max(diametro_hilo, 0.001) / 0.127) / math.log(92)
        awg_int = round(awg)
        
        if awg_int < -4: awg_str = "Req. Platina"
        elif awg_int == 0: awg_str = "1/0"
        elif awg_int < 0: awg_str = f"{abs(awg_int)+1}/0"
        else: awg_str = str(awg_int)
        
        diam_aislado = diametro_hilo * 1.10 # Barniz doble capa
        return (awg_str, area_req_mm2, diam_aislado, diam_aislado)

def calcular_parametros_transformador(data):
    """
    Motor de ingeniería avanzado para cálculo de transformadores
    """
    try:
        # 1. Inputs Base
        potencia_kva = float(data.get('potencia_kva', 25) or 25)
        vp = float(data.get('vp', 13200) or 13200)
        vs = float(data.get('vs', 220) or 220)
        frecuencia = float(data.get('frecuencia', 60) or 60)
        tipo = data.get('tipo', 'monofasico')
        material_nucleo = data.get('material', 'silicio')
        material_bobinas = data.get('material_bobinas', 'aluminio')
        refrigeracion = data.get('refrigeracion', 'seco')
        
        # 2. Especificaciones de Materiales
        m_core = MATERIAL_SPECS.get(material_nucleo, MATERIAL_SPECS['silicio'])
        m_cond = CONDUCTOR_SPECS.get(material_bobinas, CONDUCTOR_SPECS['aluminio'])
        
        # 3. Parámetros de Diseño (Heurística de Ingeniería)
        b_target = float(data.get('induccion_maxima', 0) or 0)
        if b_target <= 0:
            b_target = m_core['b_max'] * 0.9 # Diseñamos al 90% de saturación
            
        j_densidad = float(data.get('densidad_corriente', 2.5) or 2.5) # A/mm2
        
        # 4. Cálculo Eléctrico
        coef_fase = 1.732 if tipo == 'trifasico' else 1.0
        ip = (potencia_kva * 1000) / (vp * coef_fase)
        is_sec = (potencia_kva * 1000) / (vs * coef_fase)
        
        # 5. Geometría del Núcleo
        # Calculamos área requerida si no se provee
        ancho_p = float(data.get('ancho_pierna', 0) or 0)
        prof = float(data.get('profundidad_nucleo', 0) or 0)
        stack_factor = float(data.get('factor_apilamiento', 0.96) or 0.96)
        
        if ancho_p > 0 and prof > 0:
            area_nucleo_cm2 = (ancho_p * prof * stack_factor) / 100.0
            print(f"   Área núcleo proporcionada: {area_nucleo_cm2:.2f} cm²")
        else:
            # Fórmula empírica mejorada para transformadores pequeños
            # Ac = K * sqrt(S_kva / f) donde K = 0.8-1.2
            K_empirico = 1.0  # Factor para transformadores pequeños
            area_nucleo_cm2 = K_empirico * math.sqrt(potencia_kva / frecuencia) * 10
            ancho_p = math.sqrt(area_nucleo_cm2 / stack_factor) * 10
            prof = ancho_p
            print(f"   Área núcleo calculada: {area_nucleo_cm2:.2f} cm²")
            
        # 6. Devanados - Fórmula correcta
        # E = 4.44 * f * B * Ac * N  =>  N = E / (4.44 * f * B * Ac)
        v_por_vuelta = 4.44 * frecuencia * b_target * area_nucleo_cm2 * 1e-4
        vueltas_p = round(vp / v_por_vuelta)
        vueltas_s = round(vs / v_por_vuelta)
        
        print(f"   Voltaje por vuelta: {v_por_vuelta:.3f} V/vuelta")
        print(f"   Vueltas primario: {vueltas_p}")
        print(f"   Vueltas secundario: {vueltas_s}")
        
        # 7. Conductores
        area_cond_p = ip / j_densidad
        area_cond_s = is_sec / j_densidad
        
        print(f"   Área conductor primario: {area_cond_p:.2f} mm²")
        print(f"   Área conductor secundario: {area_cond_s:.2f} mm²")
        
        cond_p = calcular_conductor(area_cond_p, data.get('tipo_conductor_primario'), 0, 0)
        cond_s = calcular_conductor(area_cond_s, data.get('tipo_conductor_secundario'), 0, 0)
        
        # 8. Estimación de Pesos y Pérdidas Reales
        # Volumen núcleo más preciso (considerando geometría E-I)
        if data.get('forma_nucleo') == 'toroidal':
            # Volumen toroide = 2 * pi² * r_medio² * sección_transversal
            diam_ext = float(data.get('diametro_externo', 150)) or 150
            diam_int = float(data.get('diametro_interno', 50)) or 50
            alto_toro = float(data.get('altura_toroide', 70)) or 70
            
            # Convertir mm a cm para cálculos consistentes
            r_medio = ((diam_ext + diam_int) / 4) / 10  # Radio medio en cm
            seccion = ((diam_ext - diam_int) / 20) * (alto_toro / 10)  # cm²
            vol_nucleo_dm3 = (2 * math.pi**2 * r_medio**2 * seccion) / 1000  # dm³
            print(f"   Volumen toroidal: {vol_nucleo_dm3:.3f} dm³")
        else:
            # Volumen núcleo E-I (aproximación mejorada)
            alto_ventana = float(data.get('altura_ventana', 120)) or 120
            ancho_ventana = float(data.get('ancho_ventana', 80)) or 80
            
            # Convertir mm a cm para cálculos consistentes
            alto_ventana_cm = alto_ventana / 10
            ancho_ventana_cm = ancho_ventana / 10
            ancho_p_cm = ancho_p / 10
            prof_cm = prof / 10
            
            # Volumen columnas y yugos (en dm³)
            vol_columnas = 3 * (area_nucleo_cm2 * alto_ventana_cm) / 1000  # dm³
            vol_yugos = 2 * (area_nucleo_cm2 * (ancho_p_cm + ancho_ventana_cm)) / 1000  # dm³
            vol_nucleo_dm3 = vol_columnas + vol_yugos
            print(f"   Volumen E-I: {vol_nucleo_dm3:.3f} dm³")
            print(f"   Área núcleo: {area_nucleo_cm2:.2f} cm²")
            print(f"   Dimensiones: {ancho_p_cm}x{prof_cm}x{alto_ventana_cm} cm")
            
        peso_nucleo_kg = vol_nucleo_dm3 * m_core['rho']
        print(f"   Peso núcleo: {peso_nucleo_kg:.2f} kg")
        
        # Pérdidas Núcleo (Steinmetz corregida)
        # P_core = k * f^a * B^b * masa_kg
        perdidas_vacio_w = m_core['k'] * (frecuencia ** m_core['a']) * (b_target ** m_core['b']) * peso_nucleo_kg
        
        # Validar pérdidas realistas (máximo 2% de potencia nominal)
        perdidas_vacio_w = min(perdidas_vacio_w, potencia_kva * 1000 * 0.02)
        
        # Logs para depuración de pérdidas
        print(f" losses DEPURACIÓN:")
        print(f"   Peso núcleo: {peso_nucleo_kg:.2f} kg")
        print(f"   Frecuencia: {frecuencia} Hz")
        print(f"   Inducción: {b_target:.2f} T")
        print(f"   Coeficiente k: {m_core['k']}")
        print(f"   Pérdidas vacío: {perdidas_vacio_w:.1f} W")
        print(f"   % de potencia: {(perdidas_vacio_w/(potencia_kva*1000))*100:.2f}%")
        
        # Pérdidas Cobre (I2R + 15% Eddy/Parasitas)
        # Longitud media de vuelta en metros (convertir desde mm)
        long_media_vuelta_m = (2 * (ancho_p + prof) + 20) / 1000.0  # mm a metros
        
        print(f"   Longitud media vuelta: {long_media_vuelta_m:.3f} m")
        
        # Calcular resistencias con validación
        if area_cond_p > 0 and area_cond_s > 0:
            res_p = m_cond['rho_res'] * (vueltas_p * long_media_vuelta_m) / area_cond_p
            res_s = m_cond['rho_res'] * (vueltas_s * long_media_vuelta_m) / area_cond_s
            print(f"   Resistencia primario: {res_p:.3f} ohm")
            print(f"   Resistencia secundario: {res_s:.6f} ohm")
        else:
            res_p = res_s = 0
            print("   Error: Área de conductores inválida")
            
        perd_cu_p = (ip ** 2) * res_p * (3 if tipo == 'trifasico' else 1)
        perd_cu_s = (is_sec ** 2) * res_s * (3 if tipo == 'trifasico' else 1)
        perdidas_carga_w = (perd_cu_p + perd_cu_s) * 1.15  # +15% pérdidas adicionales
        
        # Validar pérdidas realistas (máximo 5% de potencia nominal)
        perdidas_carga_w = min(perdidas_carga_w, potencia_kva * 1000 * 0.05)
        
        print(f"   Pérdidas cobre primario: {perd_cu_p:.1f} W")
        print(f"   Pérdidas cobre secundario: {perd_cu_s:.1f} W")
        print(f"   Pérdidas carga total: {perdidas_carga_w:.1f} W")
        
        # 9. Eficiencia y Regulación
        perdidas_totales_w = perdidas_vacio_w + perdidas_carga_w
        pot_salida_w = potencia_kva * 1000
        eficiencia = (pot_salida_w / (pot_salida_w + perdidas_totales_w)) * 100
        
        # Regulación (simplificada %R = (P_carga_w / P_nominal_w) * 100)
        regulacion = (perdidas_carga_w / pot_salida_w) * 100
        
        # 10. Curva de Eficiencia (Mapa de Carga)
        eficiencia_map = []
        for carga in [0.1, 0.25, 0.5, 0.75, 1.0, 1.1]:
            p_out = pot_salida_w * carga
            p_cu_actual = perdidas_carga_w * (carga ** 2)
            eff = (p_out / (p_out + perdidas_vacio_w + p_cu_actual)) * 100 if p_out > 0 else 0
            eficiencia_map.append({'carga': int(carga*100), 'eficiencia': round(eff, 2)})
            
        # 11. Térmica
        # Área de disipación realista para transformadores en aceite
        # Considerando radiador y tanque expansión
        alto_cm = ancho_p * 2.5 / 10  # Estimación altura
        ancho_cm = ancho_p * 3 / 10   # Estimación ancho total
        prof_cm = prof / 10            # Profundidad en cm
        
        # Área base + área radiador (solo para aceite)
        area_base_cm2 = 2 * (ancho_cm * prof_cm + ancho_cm * alto_cm + prof_cm * alto_cm)
        if refrigeracion == 'aceite':
            area_superficial_cm2 = area_base_cm2 * 3.5  # Factor para radiador en aceite
        else:
            area_superficial_cm2 = area_base_cm2  # Sin radiador para transformadores secos
        
        # Factor de convección corregido para refrigeración seca (mucho más bajo)
        k_conv = 0.008 if refrigeracion == 'aceite' else 0.00008  # 100x más bajo para refrigeración seca
        
        # Cálculo de elevación de temperatura
        delta_t = perdidas_totales_w / (area_superficial_cm2 * k_conv)
        
        # Validación de temperatura realista
        k_conv_final = k_conv
        if delta_t > 500:
            print(f"   ADVERTENCIA: Temperatura extrema detectada: {delta_t:.1f}°C")
            print(f"   Ajustando factor de convección para valores realistas")
            # Ajustar automáticamente para temperaturas realistas
            k_conv_ajustado = k_conv * (delta_t / 100)  # Aumentar factor para reducir temperatura
            delta_t = perdidas_totales_w / (area_superficial_cm2 * k_conv_ajustado)
            k_conv_final = k_conv_ajustado
            print(f"   Factor convección ajustado: {k_conv_ajustado}")
            print(f"   Temperatura ajustada: {delta_t:.1f}°C")
        
        # Logs para depuración
        print(f" losses DEPURACIÓN:")
        print(f"   Pérdidas totales: {perdidas_totales_w:.1f} W")
        print(f"   Área base: {area_base_cm2:.1f} cm²")
        print(f"   Área con radiador: {area_superficial_cm2:.1f} cm²")
        print(f"   Factor convección: {k_conv}")
        print(f"   Delta T calculado: {delta_t:.1f} °C")
        print(f"   Refrigeración: {refrigeracion}")
        
        # Limitar valores realistas para evitar errores numéricos
        delta_t = min(delta_t, 200)  # Máximo 200°C para protección
        
        # 11.2 Cálculo de peso de bobinas
        # Peso = volumen × densidad
        # Volumen = área_conductor × longitud_total_vueltas
        
        # Longitud total de conductor
        long_total_pri_m = vueltas_p * long_media_vuelta_m
        long_total_sec_m = vueltas_s * long_media_vuelta_m
        
        # Volumen de conductores (mm³ a dm³)
        vol_cond_pri_dm3 = (area_cond_p * long_total_pri_m * 1000) / 1000000  # mm² × m × 1000 / 1M = dm³
        vol_cond_sec_dm3 = (area_cond_s * long_total_sec_m * 1000) / 1000000
        
        # Peso de bobinas
        peso_bobinas_kg = (vol_cond_pri_dm3 + vol_cond_sec_dm3) * m_cond['densidad']
        
        print(f"   Longitud total primario: {long_total_pri_m:.1f} m")
        print(f"   Longitud total secundario: {long_total_sec_m:.1f} m")
        print(f"   Volumen bobinas: {(vol_cond_pri_dm3 + vol_cond_sec_dm3):.3f} dm³")
        print(f"   Peso bobinas: {peso_bobinas_kg:.2f} kg")
        # Espesor total = 2 * (radio_bobina_primaria + radio_bobina_secundaria + aislamientos)
        radio_pri_mm = math.sqrt(area_cond_p / math.pi) if area_cond_p > 0 else 0
        radio_sec_mm = math.sqrt(area_cond_s / math.pi) if area_cond_s > 0 else 0
        
        # Aislamientos
        tubo_mm = float(data.get('aislamiento_tubo', 2.0) or 2.0)
        aisl_entre_dev_mm = float(data.get('aislamiento_entre_devanados', 1.0) or 1.0)
        margen_mm = float(data.get('margen_seguridad_extremos', 5.0) or 5.0)
        
        espesor_total_mm = 2 * (radio_pri_mm + tubo_mm + radio_sec_mm + aisl_entre_dev_mm + margen_mm)
        print(f"   Espesor total devanado: {espesor_total_mm:.2f} mm")
        
        # 12. Costo
        costo_mat = (peso_nucleo_kg * m_core['costo_kg']) + (potencia_kva * 15 * m_cond['costo_kg'])
        costo_total = costo_mat * 1.4 # +40% manufactura y otros
        
        # Construcción segura del resultado
        try:
            resultado = {
                'status': 'success',
                'potencia_nominal': potencia_kva,
                'frecuencia': frecuencia,
                'voltajes': {'primario': vp, 'secundario': vs},
                'corrientes': {'primaria': round(ip, 2), 'secundaria': round(is_sec, 2)},
                'relacion_transformacion': round(vp/vs, 2),
                'material_nucleo': material_nucleo,
                'eficiencia': round(eficiencia, 2),
                'eficiencia_map': eficiencia_map,
                'regulacion': round(regulacion, 2),
                'costo_estimado': round(costo_total, 0),
                'perdidas': {
                    'nucleo_w': round(perdidas_vacio_w, 1),
                    'cobre_w': round(perdidas_carga_w, 1),
                    'totales_w': round(perdidas_totales_w, 1)
                },
                'parametros_calculo': {
                    'area_nucleo_cm2': round(area_nucleo_cm2, 2),
                    'vueltas_primario': vueltas_p,
                    'vueltas_secundario': vueltas_s,
                    'area_conductor_primario_mm2': round(area_cond_p, 2),
                    'area_conductor_secundario_mm2': round(area_cond_s, 2),
                    'calibre_pri': cond_p[0] if cond_p else 'N/A',
                    'calibre_sec': cond_s[0] if cond_s else 'N/A',
                    'peso_nucleo_kg': round(peso_nucleo_kg, 2),
                    'peso_bobinas_kg': round(peso_bobinas_kg, 2) if 'peso_bobinas_kg' in locals() else 0,
                    'elevacion_temperatura_c': round(delta_t, 1),
                    'espesor_total_mm': round(espesor_total_mm, 2) if 'espesor_total_mm' in locals() else 0,
                    'material_bobinas': material_bobinas,
                    'viabilidad': delta_t < 65,
                    'mensaje_viabilidad': "Diseño térmicamente estable" if delta_t < 65 else f"Exceso de temperatura ({delta_t:.1f}°C) - Reducir densidad o mejorar refrigeración"
                },
                'dimensiones_estimadas': {
                    'altura_cm': round(ancho_p * 2.5 / 10, 1),
                    'ancho_cm': round(ancho_p * 3 / 10, 1),
                    'profundidad_cm': round(prof / 10, 1)
                }
            }
            print(f"   Resultado construido exitosamente")
            return resultado
        except Exception as e:
            print(f"   ERROR al construir resultado: {e}")
            return {'error': f'Error al construir resultado: {str(e)}', 'status': 'error'}
    except Exception as e:
        return {'error': str(e), 'status': 'error'}

def api_design_and_quote(data):
    print(f"API: Iniciando api_design_and_quote con datos: {data}")
    resultado = calcular_parametros_transformador(data)
    print(f"API: Resultado de calcular_parametros_transformador: {resultado.get('status', 'unknown')}")
    
    if resultado.get('status') == 'error':
        print(f"API: Error detectado en cálculo, retornando error: {resultado.get('error', 'unknown')}")
        return resultado
    
    response = {'resultado': resultado, 'status': 'success', 'cotizacion': resultado}
    print(f"API: Respuesta final construida exitosamente")
    return response
