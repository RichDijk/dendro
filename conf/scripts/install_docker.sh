#!/usr/bin/env bash

INITIAL_DIR=`pwd`
NODE_VERSION=`cat .nvmrc`

echo "Installing Dendro in $INITIAL_DIR with username $(whoami) and Node $NODE_VERSION"

if [ "$NODE_VERSION" == "" ]
then
    echo "Unable to determine the version of NodeJS to install!"
    exit 1
else
    chown -R "$(whoami)" "$HOME/.nvm"

    #install NVM, Node, Node Automatic Version switcher
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash &&
    export NVM_DIR="$HOME/.nvm" &&
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && # This loads nvm

    source $HOME/.bash_profile

    echo "Installing Node Version $NODE_VERSION during install script!!"
    nvm install $NODE_VERSION &&
    nvm use --delete-prefix $NODE_VERSION --silent &&
    echo "loaded NVM."

    #clear npm cache
    npm cache clean --force

    #update npm (force 5.6.0 because of write after end issue: https://github.com/npm/npm/issues/19989)
    npm i -g npm@5.6.0

    #install nyc
    npm i -g nyc

    #delete node_modules folder
    rm -rf node_modules
    rm -rf package-lock.json

    chown -R "$(whoami)" "$HOME/.nvm"

    #install preliminary dependencies
    npm i -g grunt && npm install gulp-cli -g && npm install bower -g && npm install pm2 -g && npm install -g npm-check-updates

    #use grunt to put everything in place
    grunt
fi

# Want NVM to be loaded on every terminal you open? Add to ~/.bash_profile this:

#export NVM_DIR="$HOME/.nvm" &&
#[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"