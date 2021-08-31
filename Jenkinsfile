pipeline {
    agent any

    stages {
        stage("Docker build") {
            steps {
                sh "docker build -t vincentdeborger:${BUILD_NUMBER} ."
                sh "docker build -t vincentdeborger:latest ."
            }
        }

        stage("Deploy development version") {
            steps {
                sh '''
                    if [[ -n "$( docker inspect --format="{{.State.Running}}" vincentdeborger )" ]]; then
                        docker stop vincentdeborger
                        docker rm vincentdeborger
                    fi
                '''

                sh "docker run -d -p 80:80 --name vincentdeborger vincentdeborger:${BUILD_NUMBER}"
            }
        }
    }
}