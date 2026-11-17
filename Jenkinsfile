pipeline {
    agent any

    environment {
        APP_NAME = 'electricity-bill-app'
        APP_TAG = 'latest'
        DOCKER_BIN = 'C:\\Users\\rupes\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing application dependencies with npm...'
                bat 'npm.cmd install'
            }
        }

        stage('Run Automated Tests') {
            steps {
                echo 'Running unit tests, validation rules, and endpoint tests...'
                bat 'npm.cmd test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker container image...'
                bat '"%DOCKER_BIN%" build -t %APP_NAME%:%APP_TAG% .'
            }
        }

        stage('Verify Docker Image') {
            steps {
                echo 'Listing generated Docker container image...'
                bat '"%DOCKER_BIN%" images %APP_NAME%:%APP_TAG%'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution cycle finished.'
        }
        success {
            echo 'Pipeline SUCCESS! Electricity Bill calculation passed all tests & Docker container is built.'
        }
        failure {
            echo 'Pipeline FAILED! Check console output for debugging information.'
        }
    }
}
