FROM python:3.12-slim

# Créer un utilisateur non-root
RUN useradd -m -u 1000 garane

WORKDIR /app

# Donner les droits sur le dossier de travail
RUN chown -R garane:garane /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Utiliser l'utilisateur non-root
USER garane

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]