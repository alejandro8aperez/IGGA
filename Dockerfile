# Use the official lightweight Python image.
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED True

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install production dependencies.
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Run the web service on container startup. 
# Note: Replace 'ERP_8AMPERIOS.wsgi' with the actual name of your project folder 
# containing the wsgi.py file if it is different.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 ERP_8AMPERIOS.wsgi:application