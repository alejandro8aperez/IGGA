#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Building ERP-8AMPERIOS Backend..."

# Install python dependencies
pip install -r requirements.txt

# Convert static files for production
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate
