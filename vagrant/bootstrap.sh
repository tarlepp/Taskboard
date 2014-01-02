#!/usr/bin/env bash

#
# Tell that we are not in interactive mode.
#
# Notes:
#  - http://serverfault.com/questions/227190/how-do-i-ask-apt-get-to-skip-any-interactive-post-install-configuration-steps
#
export DEBIAN_FRONTEND=noninteractive

#
# Add node.js repository, update apt cache and install all necessary packages via apt-get and npm.
#
# Notes:
#  - http://linuxg.net/how-to-fix-error-sudo-add-apt-repository-command-not-found/
#  - http://stackoverflow.com/questions/13018626/add-apt-repository-not-found
#
echo "Installing following packages: mysql-server openssh-server python-software-properties python g++ make nodejs"
apt-get update && apt-get install -y python-software-properties
add-apt-repository ppa:chris-lea/node.js -y
apt-get update && apt-get install -y git mysql-server openssh-server python-software-properties python g++ make nodejs
npm install -g npm bower sails

#
# Fix possible SSH bug on Ubuntu box.
#
# Notes:
#  - http://askubuntu.com/questions/324574/cannot-ssh-into-new-vagrant-install-of-13-04
#
test -f /etc/ssh/ssh_host_dsa_key || dpkg-reconfigure openssh-server

#
# Start MySQL service, change root password, create database for Taskboard if it doesn't
# exists yet and grant access to Taskboard user to that database.
#
# Note that used passwords are static, so change those if you're using this in production.
#
echo "Starting MySQL and create database for application"
service mysql start
mysqladmin -u root password 6sG6Cr2HCW
mysql -uroot -p6sG6Cr2HCW -e "CREATE DATABASE IF NOT EXISTS Taskboard; GRANT ALL ON Taskboard.* TO Taskboard@'localhost' IDENTIFIED BY 'O1SuSLLxPC';"

#
# Create default 'local.js' configuration content
#
LOCALJS=$(cat <<EOF
module.exports = {
    adapters: {
        default: 'mysql',
        mysql: {
            module: 'sails-mysql',
            host: 'localhost',
            user: 'Taskboard',
            password: 'O1SuSLLxPC',
            database: 'Taskboard'
        }
    },

    log: {
        level: 'verbose'
    }
};
EOF
)

#
# Create new local.js config file if it doesn't exists yet.
#
if [ ! -f /home/vagrant/Taskboard/config/local.js ]; then
    echo "${LOCALJS}" > /home/vagrant/Taskboard/config/local.js
fi

#
# Install all Taskboard specified npm modules etc.
#
# Notes:
#  - http://stackoverflow.com/questions/12926416/socket-io-install-errors
#  - http://askubuntu.com/questions/269727/npm-errors-when-installing-packages-on-windows-share
#
echo "Started to installing Taskboard depencies, this will take a moment..."
cd /home/vagrant/Taskboard/
su vagrant -c "npm install --no-bin-link"

echo "-------------------------------------------------------------------------------";
echo " All is ready now for you trying to Taskboard application."
echo " Open your favorite SSH client and open connect to vagrant system."
echo " This is usually just 'ssh localhost:2222', use following credentials:"
echo "    username: vagrant"
echo "    password: vagrant"
echo " After that just make following:"
echo "    cd /home/vagrant/Taskboard"
echo "    sails lift"
