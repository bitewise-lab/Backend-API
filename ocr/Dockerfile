FROM python:3.10.8

ENV PYTHONUNBUFFERED 1

# Set working directory in the container
WORKDIR /app

COPY requirements.txt /app/

# Install the necessary Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt


RUN apt-get update && \
    apt-get install -y tesseract-ocr && \
    apt-get clean

COPY . /app/

EXPOSE 8080

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
