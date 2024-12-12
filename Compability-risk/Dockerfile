# Gunakan Python sebagai base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy semua file
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port aplikasi
EXPOSE 8080

# Jalankan aplikasi
CMD ["python", "app.py"]
