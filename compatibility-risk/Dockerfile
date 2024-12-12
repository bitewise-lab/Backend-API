FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel --no-cache-dir
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8080

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]