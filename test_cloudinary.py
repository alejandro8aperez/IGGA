"""
Cloudinary onboarding script — Python
Uploads a sample image, fetches metadata, and generates an optimized URL.
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api

# ── 1. Configurar Cloudinary (credenciales inline) ──────────────────────────
cloudinary.config(
    cloud_name="do78tgt1v",
    api_key="582319849841712",
    api_secret="WX-5ffNPJGsL2DCw7EANkBRkh6c",
    signature_algorithm="sha256",
    secure=True,
)

# ── 2. Subir imagen de ejemplo ──────────────────────────────────────────────
print("Subiendo imagen de ejemplo...")
result = cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    public_id="erp_sample_upload",
    overwrite=True,
)

secure_url = result["secure_url"]
public_id = result["public_id"]
print(f"  URL segura:  {secure_url}")
print(f"  Public ID:   {public_id}")

# ── 3. Obtener metadatos ────────────────────────────────────────────────────
print("\nMetadatos de la imagen:")
info = cloudinary.api.resource(public_id)
width = info["width"]
height = info["height"]
fmt = info["format"]
bytes_ = info["bytes"]
print(f"  Width:       {width}px")
print(f"  Height:      {height}px")
print(f"  Format:      {fmt}")
print(f"  File size:   {bytes_} bytes")

# ── 4. Generar URL transformada (f_auto + q_auto) ───────────────────────────
# f_auto → el CDN elige el mejor formato según el navegador (WebP, AVIF…)
# q_auto → el CDN ajusta la calidad automáticamente (balance tamaño/calidad)
transformed_url = cloudinary.CloudinaryImage(public_id).build_url(
    transformation=[{"fetch_format": "auto", "quality": "auto"}]
)
print(f"\nDone! Click link below to see optimized version of the image.")
print(f"Check the size and the format.")
print(f"\n  URL transformada: {transformed_url}")
