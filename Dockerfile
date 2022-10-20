
# Requirements
FROM python:3.10-slim
COPY /requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt

# Run App
COPY /static /app/static
COPY /templates /app/templates
COPY /run.py /app/run.py
ENTRYPOINT [ "python" ]
CMD ["run.py"]
