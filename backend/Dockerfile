# 1. Use an official, lean Python base image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the dependencies file first to leverage Docker's cache
COPY requirements.txt .

# 4. Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code
COPY ./app ./app
COPY ./models ./models
COPY ./data ./data

# 6. Expose the port the app will run on
# Render used $PORT, but Cloud Run provides a standard 8080
EXPOSE 8080

# 7. Define the command to run your application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]