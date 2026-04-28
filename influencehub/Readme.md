# 🚀 InfluenceHub

InfluenceHub is a full-stack platform that connects **brands and influencers** for collaboration, campaign management, and messaging.

---

## 🏗️ Tech Stack

### Backend
- Java (Spring Boot)
- Spring Security (JWT Authentication)
- JPA / Hibernate
- MySQL

### Frontend
- React (Vite)
- JavaScript

---

## 📂 Project Structure

```
influencehub/
├── backend/
└── frontend/
```

---

## ⚙️ Prerequisites

- Java 17+
- Maven
- Node.js (v16+)
- npm or yarn
- MySQL

---

## 🧩 Backend Setup

### 1. Navigate to backend
```
cd influencehub/backend
```

### 2. Configure Database

Update `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/influencehub
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

### 3. Run Backend
```
./mvnw spring-boot:run
```

Backend runs at:
http://localhost:8080

---

## 🎨 Frontend Setup

### 1. Navigate to frontend
```
cd influencehub/frontend
```

### 2. Install dependencies
```
npm install
```

### 3. Configure environment
```
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Run frontend
```
npm run dev
```

Frontend runs at:
http://localhost:5173

---

## 🔐 Authentication

- JWT-based authentication  
- Token expiration enabled  
- Passwords hashed using BCrypt  

---

## ✨ Features

- User Authentication  
- Campaign Management  
- Collaboration Requests  
- Messaging  
- Notifications  
- Influencer Discovery  

---

## 🏛️ Architecture

- N-Tier Monolithic Architecture  
- Controller → Service → Repository  
- REST API communication  

---

## 🚀 Future Improvements

- Microservices architecture  
- Real-time chat  
- Redis caching  
- Advanced analytics  

---

