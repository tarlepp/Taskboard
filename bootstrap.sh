#!/usr/bin/env bash

#
# Tell that we are not in interactive mode
#
export DEBIAN_FRONTEND=noninteractive

#
# Add node.js repository, update apt cache and install all necessary
# packages via apt-get and npm
#
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install -y git mysql-server openssh-server python-software-properties python g++ make nodejs
npm install -g npm bower sails

#
# Fix possible SSH bug on Ubuntu box
# see http://askubuntu.com/questions/324574/cannot-ssh-into-new-vagrant-install-of-13-04
#
test -f /etc/ssh/ssh_host_dsa_key || dpkg-reconfigure openssh-server

#
# Start MySQL service, change root password, create database for Taskboard if it doesn't
# exists yet and grant access to Taskboard user to that database.
#
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
if [ ! -f /vagrant/config/local.js ]; then
    echo "${LOCALJS}" > /vagrant/config/local.js
fi

#
# Install all Taskboard specified stuff
#
cd /vagrant/
npm install