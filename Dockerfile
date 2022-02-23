
# Requirements
FROM arm32v7/python:3.7.12-slim
COPY ./requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt

# Run App
COPY static /app/static
COPY templates /app/templates
COPY run.py /app/run.py
EXPOSE 8080
CMD ["python", "run.py"]

# Health Check
HEALTHCHECK CMD curl --fail http://localhost:8080/ || exit 1
