pipeline {
    agent none

    stages {
        stage("Docker build") {
            steps {
                sh "docker build -t vincentdeborger:dev-${BUILD_NUMBER} ."
                sh "docker build -t vincentdeborger:dev-latest ."
            }
        }

        stage("Deploy development version") {
            steps {
                sh '''
                    if [[ -n "$( docker inspect --format="{{.State.Running}}" vincentdeborger-dev )" ]]; then
                        docker stop vincentdeborger-dev
                        docker rm vincentdeborger-dev
                    fi
                '''

                sh "docker run -d -p 80:80 --name vincentdeborger-dev vincentdeborger:dev-${BUILD_NUMBER}"
            }
        }
    }
}