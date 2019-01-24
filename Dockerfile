############################################
FROM "ubuntu:18.04" as base
############################################

######    CONSTANTS    ######
ENV DENDRO_GITHUB_URL https://github.com/feup-infolab/dendro.git
ENV DENDRO_INSTALL_DIR /tmp/dendro
ENV DENDRO_RUNNING_DIR /dendro/dendro
ENV DENDRO_PORT 3001

ENV DENDRO_USER dendro
ENV DENDRO_USER_GROUP dendro
ENV HOME /home/dendro
ENV NVM_DIR /home/dendro/.nvm

ENV NODE_VERSION v8.10.0
#####    END CONSTANTS    ######

# Change shell to bash
SHELL ["/bin/bash", "-c"]

# Create dendro user
RUN useradd -m "$DENDRO_USER"
RUN usermod "$DENDRO_USER" -g "$DENDRO_USER_GROUP"
USER "$DENDRO_USER"
RUN mkdir -p "$NVM_DIR"
USER root

############################################
FROM base AS dependencies
############################################

# Install preliminary dependencies
RUN apt-get update
RUN apt-get -y -f install unzip devscripts autoconf automake libtool flex bison gperf gawk m4 make libssl-dev imagemagick subversion zip wget curl git --fix-missing
RUN apt-get install -y apt-utils --no-install-recommends

# Install text extraction tools
RUN apt-get -y -f install poppler-utils antiword unrtf tesseract-ocr

# Install python 2.7
RUN apt-get -y -f install python2.7
RUN ln -s /usr/bin/python2.7 /usr/bin/python

# Install Java Oracle SDK 8
RUN apt-get install -y software-properties-common
RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  add-apt-repository -y ppa:webupd8team/java && \
  apt-get update && \
  apt-get install -y oracle-java8-installer && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/cache/oracle-jdk8-installer

# Set Java Oracle SDK 8 as default Java
RUN apt-get install oracle-java8-set-default

# compatibility fix for node on ubuntu
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Switch to dendro user
USER $DENDRO_USER

############################################
FROM dependencies as nvm_installed
############################################

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
RUN . "$NVM_DIR/nvm.sh" \
	&& nvm install $NODE_VERSION \
	&& nvm use --delete-prefix $NODE_VERSION \
	&& nvm alias default $NODE_VERSION

ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH

############################################
FROM nvm_installed as global_npms
############################################

# update npm (force 5.6.0 because of "write after end" issue: https://github.com/npm/npm/issues/19989)
# Install bower, gulp, grunt
RUN npm i -g npm@5.6.0 \
	&& npm i -g grunt@1.0.3 \
	&& npm i -g gulp-cli@2.0.1 \
	&& npm i -g bower@1.8.8

############################################
FROM global_npms as app_libs_installed
############################################

# Switch to root user
USER root
	
# Create install dir
RUN mkdir -p "$DENDRO_INSTALL_DIR"
RUN chown -R "$DENDRO_USER:$DENDRO_USER_GROUP" "$DENDRO_INSTALL_DIR"

# Create running dir
RUN mkdir -p "$DENDRO_RUNNING_DIR"
RUN chown -R "$DENDRO_USER:$DENDRO_USER_GROUP" "$DENDRO_RUNNING_DIR"

#create temporary librarry directories as root
RUN mkdir -p /tmp/public
RUN chown -R "$DENDRO_USER:$DENDRO_USER_GROUP" /tmp/public

# Switch to dendro install dir and dendro user
USER $DENDRO_USER
WORKDIR "$DENDRO_INSTALL_DIR"
# Install node dependencies in /tmp to use the Docker cache
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN cd /tmp && npm install

# same for bower
COPY public/bower.json /tmp/public/bower.json
RUN cd /tmp/public && bower install

############################################
FROM app_libs_installed AS dendro_installed
############################################

# Clone dendro into install dir
COPY --chown="dendro:dendro" . "$DENDRO_INSTALL_DIR"

# Copy dendro startup script and make 'docker' the active deployment config
COPY ./conf/scripts/docker/start_dendro_inside_docker.sh "$DENDRO_INSTALL_DIR/dendro.sh"
RUN cp "$DENDRO_INSTALL_DIR/conf/docker_deployment_config.yml" "$DENDRO_INSTALL_DIR/conf/active_deployment_config.yml"

# Set dendro execution script as executable
USER root
RUN chmod ugo+rx "$DENDRO_INSTALL_DIR/dendro.sh"
USER "$DENDRO_USER"

# Put compiled libraries in place
RUN cp -R /tmp/node_modules $DENDRO_INSTALL_DIR
RUN cp -R /tmp/public/bower_components $DENDRO_INSTALL_DIR

# Run grunt
RUN grunt

# Expose dendro running directory as a volume
VOLUME [ "$DENDRO_RUNNING_DIR"]

# Show contents of folders
RUN echo "Contents of Dendro install dir: $(ls -la $DENDRO_INSTALL_DIR)"
RUN echo "Contents of Dendro running dir: $(ls -la $DENDRO_RUNNING_DIR)"

# What is the active deployment config?
RUN echo "Contents of Dendro active configuration file: $(cat $DENDRO_INSTALL_DIR/conf/active_deployment_config.yml)"

EXPOSE "$DENDRO_PORT"

# Start Dendro

USER "$DENDRO_USER"
CMD [ "/bin/bash", "/dendro/dendro_install/dendro.sh" ]

