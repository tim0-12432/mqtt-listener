
# Requirements
FROM python:3.7.12-slim
COPY ./requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt

# Run App
COPY static /static
COPY templates /templates
COPY run.py /run.py
CMD ["python", "run.py"]

# Health Check
HEALTHCHECK CMD curl --fail http://localhost:8080/ || exit 1
