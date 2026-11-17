# Electricity Bill Calculation & Automated DevOps Pipeline

A production-grade **Electricity Bill Calculation** system built with Node.js and Java, completely containerized using **Docker** and automated via a **Jenkins CI/CD Declarative Pipeline**.

---

## 📌 Project Overview

This application calculates electricity consumption charges based on tiered/progressive slab rates for Domestic and Commercial connections, computes taxes, meter maintenance fees, and outputs an itemized bill breakdown.

The complete DevOps workflow is implemented:
1. **Source Code & Unit Logic**: JavaScript / Node.js web app & CLI calculation engine + Java implementation (`ElectricityBill.java`).
2. **Automated Testing**: 11 automated unit and integration tests with `node --test`.
3. **Containerization**: Optimized `Dockerfile` based on `node:20-bookworm-slim`.
4. **CI/CD Automation**: Multi-stage Jenkins declarative pipeline (`Jenkinsfile`) running on `http://localhost:8080`.
5. **Version Control**: Git repository with main branch and remote GitHub sync.

---

## ⚡ Electricity Slab Rates (Tariff Structure)

### Domestic (Residential)
| Slab Range | Rate per Unit |
| :--- | :--- |
| **0 – 100 units** | ₹1.50 / kWh |
| **101 – 200 units** | ₹2.50 / kWh |
| **201 – 300 units** | ₹4.00 / kWh |
| **Above 300 units** | ₹6.00 / kWh |
| **Fixed Meter Rent** | ₹50.00 |
| **Electricity Duty / Tax** | 5% on Energy Charges |

### Calculation Example (250 Units):
- 1st 100 units @ ₹1.50 = **₹150.00**
- Next 100 units @ ₹2.50 = **₹250.00**
- Next 50 units @ ₹4.00 = **₹200.00**
- **Energy Charges Subtotal** = ₹600.00
- **Fixed Meter Charge** = ₹50.00
- **Electricity Duty (5%)** = ₹30.00
- **Net Bill Payable** = **₹680.00**

---

## 🚀 Quick Start (Local Run)

### 1. Run via Node.js Web Interface
```powershell
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run via Command Line (CLI)
```powershell
# Node.js CLI:
node billCalculator.js 250 domestic

# Java CLI:
javac ElectricityBill.java
java ElectricityBill
```

### 3. Run Automated Tests
```powershell
npm test
```
All 11 unit, integration, and HTTP API endpoint tests will execute.

---

## 🐳 Docker Deployment

### 1. Build the Docker Image
```powershell
docker build -t electricity-bill-app:latest .
```

### 2. Run the Container
```powershell
docker run -d -p 3000:3000 --name electricity-bill-container electricity-bill-app:latest
```

### 3. Verify Container
- Access Web UI: [http://localhost:3000](http://localhost:3000)
- Health Check: [http://localhost:3000/health](http://localhost:3000/health)

### 4. Stop and Remove Container
```powershell
docker stop electricity-bill-container
docker rm electricity-bill-container
```

---

## 🔄 Jenkins CI/CD Pipeline Automation

The pipeline is defined in `Jenkinsfile` and automates:
1. **Checkout Source Code**: Pulls latest commit from Git repository.
2. **Install Dependencies**: Runs `npm.cmd install`.
3. **Run Automated Tests**: Runs `npm.cmd test` (all 11 tests must pass).
4. **Build Docker Image**: Builds `electricity-bill-app:latest` using Docker Desktop engine.
5. **Verify Docker Image**: Checks image creation and reports success.

### Steps to configure in Jenkins:
1. Open Jenkins at **`http://localhost:8080`**.
2. Click **New Item** &rarr; Enter name `Electricity-Bill-Pipeline` &rarr; Select **Pipeline** &rarr; Click **OK**.
3. Scroll down to the **Pipeline** configuration section:
   - **Definition**: Select `Pipeline script from SCM`.
   - **SCM**: Select `Git`.
   - **Repository URL**: Paste your GitHub repo URL (e.g. `https://github.com/GunjanNashine/Electricity-Bill-Calculation.git` or local path).
   - **Branch Specifier**: `*/main` (or `*/master`).
   - **Script Path**: `Jenkinsfile`.
4. Click **Save**.
5. Click **Build Now** to trigger the automated build pipeline!

---

## 🐙 Git & GitHub Setup

To push this repository to GitHub:

```powershell
# 1. Initialize Git in the project directory
cd c:\Users\rupes\Desktop\Devopslab\Electricity-Bill-DevOps
git init

# 2. Stage all files and make initial commit
git add .
git commit -m "feat: Electricity Bill Calculation with Docker and Jenkins CI/CD"

# 3. Create main branch
git branch -M main

# 4. Link to your GitHub remote repository
# (Create a new repository on https://github.com/new named 'Electricity-Bill-Calculation')
git remote add origin https://github.com/GunjanNashine/Electricity-Bill-Calculation.git

# 5. Push to GitHub
git push -u origin main
```

---

## 📁 Repository Structure

```text
Electricity-Bill-DevOps/
├── .dockerignore              # Docker build exclusions
├── .gitignore                # Git exclusions
├── Dockerfile                # Docker image build instructions
├── Jenkinsfile               # Jenkins CI/CD Declarative Pipeline
├── README.md                 # Complete documentation and setup guide
├── package.json              # Project dependencies and test scripts
├── package-lock.json         # Pinned dependency lockfile
├── server.js                 # Express HTTP server & API endpoints
├── billCalculator.js         # Core billing logic & CLI runner
├── ElectricityBill.java      # Java standalone billing calculator
├── tests/
│   └── billCalculator.test.js # 11 Automated test suites
└── public/
    ├── index.html            # Responsive UI with live invoice preview
    ├── style.css             # Glassmorphic, professional styling
    └── app.js                # Frontend interactivity & real-time updates
```
