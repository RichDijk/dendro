properties(
    [
        pipelineTriggers([cron('H * * * *')]),
    ]
)
    
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh "chmod +x $WORKSPACE/conf/scripts/install.sh"
                sh "$WORKSPACE/conf/scripts/install.sh"
            }
        }
        stage('Test') {
            steps {
                sh "chmod +x $WORKSPACE/conf/scripts/test.sh"
                sh "$WORKSPACE/conf/scripts/test.sh JENKINSTESTSdendroVagrantDemo root r00t_p4ssw0rd"
            }
        }
        stage('Deploy') {
            steps {
                echo 'No deployments yet. Skipping.'
            }
        }
    }
}
