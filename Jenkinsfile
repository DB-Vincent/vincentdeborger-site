node {
    stage ("Pull code") {
        sh "git pull git@github.com:DB-Vincent/vincentdeborger-site.git ."
        sh "ls -al"
    }
    stage("Build") {
        sh "docker build -t vincentdeborger-site:0.0.1 ."
    }
}