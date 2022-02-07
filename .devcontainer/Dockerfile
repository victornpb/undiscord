FROM archlinux

# Set up pacman
RUN pacman-key --init
RUN pacman-key --populate

# Install git and yarn
RUN pacman --noconfirm -Syu git which
# Set the git editor to be VS Code (for obvious reasons)
RUN git config --global core.editor code --wait