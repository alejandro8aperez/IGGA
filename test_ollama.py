import ollama
import sys

def chat_con_modelo(prompt, modelo="phi3"):
    try:
        print(f"--- Consultando a Ollama (Modelo: {modelo}) ---")
        response = ollama.chat(model=modelo, messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])
        return response['message']['content']
    except ollama.ResponseError as e:
        if "memory" in str(e).lower():
            return f"Error de memoria: El modelo '{modelo}' es demasiado grande para tu RAM.\nIntenta con: ollama pull phi3"
        return f"Error de Ollama: {e}"
    except Exception as e:
        return f"Error al conectar con Ollama: {e}\n¿Está el servidor de Ollama corriendo?"

if __name__ == "__main__":
    # Uso: python test_ollama.py "Tu pregunta" "nombre_modelo"
    pregunta = sys.argv[1] if len(sys.argv) > 1 else "Explícame qué es un decorador en Python de forma breve."
    modelo_usar = sys.argv[2] if len(sys.argv) > 2 else "phi3"
    
    print(chat_con_modelo(pregunta, modelo_usar))