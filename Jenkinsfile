pipeline {
    stages {
        stage("Build") {
            steps {
                sh "docker build -t vincentdeborger-site:${version} ."
            }
        }
    }
}