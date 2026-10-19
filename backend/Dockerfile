FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Google Cloud Run injects the PORT environment variable.
# We use uvicorn but pass the port dynamically via env var fallback.
# Cloud Run pone la IP real del cliente en X-Forwarded-For: sin esto el límite de peticiones contaría a todos como una sola IP.
ENV FORWARDED_ALLOW_IPS="*"
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers"]
