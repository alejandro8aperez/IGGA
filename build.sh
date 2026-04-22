#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=========================================="
echo "Building ERP-8AMPERIOS for Production..."
echo "=========================================="

# =============================================================================
# BACKEND BUILD
# =============================================================================
echo ""
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🔄 Applying database migrations..."
python manage.py migrate

echo ""
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# =============================================================================
# FRONTEND BUILD (Optional - if serving from same domain)
# =============================================================================
# Uncomment the following lines if you want to build the frontend as part
# of the backend deployment (serving static files through Django)
#
# echo ""
# echo "🎨 Building Frontend..."
# cd frontend
# npm install
# npm run build
# cd ..

# =============================================================================
# SEED INITIAL DATA (Optional)
# =============================================================================
# Uncomment if you need to create initial data on first deploy
#
# echo ""
# echo "🌱 Seeding initial data..."
# python manage.py shell -c "from init_roles import create_roles; create_roles()"

echo ""
echo "=========================================="
echo "✅ Build completed successfully!"
echo "=========================================="
