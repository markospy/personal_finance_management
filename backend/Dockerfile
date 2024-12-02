# syntax=docker/dockerfile:1.7-labs

# Esta linea me permite aprovechar la flag experimental de --exclude en la linea COPY




# First stage: base image
FROM python:bookworm as base
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /usr/local/app
EXPOSE 8000
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt


# Second stage: dev image
FROM base as developer
COPY app/ .
CMD [ "fastapi", "dev", "main.py" ]


# Third stage: deploy
FROM base as deploy
# Does not include the app/test directory
COPY --exclude=app/test app/ ./
CMD [ "fastapi", "run", "main.py" ]
