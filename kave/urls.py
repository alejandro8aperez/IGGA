from django.urls import path
from .api_views import (
    design_transformer, 
    list_transformers, 
    transformer_detail, 
    quick_quote, 
    materials_catalog,
    download_ficha_tecnica,
    send_to_mrp_engine,
    delete_transformer,
    ai_design_review
)

urlpatterns = [
    path('design/', design_transformer),
    path('designs/', list_transformers),
    path('disenos/', list_transformers),  # Alias en español para el frontend
    path('designs/<int:pk>/', transformer_detail),  # Soporta GET y DELETE
    path('designs/<int:pk>/pdf_ficha/', download_ficha_tecnica),
    path('designs/<int:pk>/send_to_mrp/', send_to_mrp_engine),
    path('designs/<int:pk>/ai_review/', ai_design_review),
    path('quote/', quick_quote),
    path('catalog/', materials_catalog),
]
