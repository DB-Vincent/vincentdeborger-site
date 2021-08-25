node {
    stage ("Pull code") {
        sh "git clone https://github.com/DB-Vincent/vincentdeborger-site.git ."
    }

    stage("Build") {
        sh "docker build -t vincentdeborger-site:0.0.1 ."
    }

    stage ("Clean up workspace") {
        sh "rm -rf *"
    }
}