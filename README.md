# PersonalFinance
A full-stack web application developed using Java Spring Boot for the backend and React for the frontend. This app allows users to track their investments, expenses, income, savings, and spending. 

# Technologies Used
Java Spring Boot, React, JavaScript, PostgreSQL, Docker, TailwindCSS

# Screenshots
<img width="960" alt="finance-app-dashboard" src="https://github.com/user-attachments/assets/66e2e03b-a9ba-4230-b417-3c76080b0758">
<p align="center">Main Home Dashboard</p>



# Setup Instructions

## Prerequisites
- Docker Desktop installed
- Git installed

## Installation Steps

1. Clone the repository
- $bash
- $git clone https://github.com/jackfallon/PersonalFinance.git
- $cd PersonalFinance

2. Create environment file:
- $bash
- $cp .env.template .env
  
3. Edit the `.env` file with your values:
- Get an AlphaVantage API key from https://www.alphavantage.co/
- Set your desired database credentials
  - DB_NAME=your_db_name
  - DB_USER=your_username
  - DB_PASSWORD=your_password
  - ALPHAVANTAGE_API_KEY=your_alphavantage_api_key

4. Edit the 'JwtConstant.java' file in /backend/src/main/java/com.jfallon.finance_app/config/JwtConstant with your secret key:
- public static final String SECRET_KEY = "your_secret_key";
- public static final String JWT_HEADER = "Authorization";
   

6. Build and start the containers
- $bash
- $docker-compose up -d

7. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5454

## Stopping the Application
- $bash
- $docker-compose down
