# Use a imagem oficial do Node.js v18 como base
FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# Instala o Java (necessário para o emulador do Firestore) e o Firebase CLI
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends openjdk-17-jdk \
    && npm install -g firebase-tools@13

# Mantém o contêiner rodando
CMD [ "sleep", "infinity" ]