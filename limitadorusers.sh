#!/bin/bash

# Nombre del grupo
GROUP="students"

# Verificar si el grupo existe
if ! getent group "$GROUP" > /dev/null; then
    echo "El grupo $GROUP no existe. Creándolo..."
    sudo groupadd "$GROUP"
    if [ $? -ne 0 ]; then
        echo "Error al crear el grupo $GROUP. Abortando."
        exit 1
    fi
fi

# Lista de directorios importantes del sistema
DIRECTORIES=(
    "/bin"
    "/boot"
    "/cdrom"
    "/dev"
    "/etc"
    "/lib"
    "/lib32"
    "/lib64"
    "/libx32"
    "/lost+found"
    "/media"
    "/mnt"
    "/opt"
    "/proc"
    "/root"
    "/run"
    "/sbin"
    "/snap"
    "/srv"
    "/swap.img"
    "/sys"
    "/tmp"
    "/usr"
    "/var"
)

# Agregar ACL para denegar acceso al grupo "students"
for dir in "${DIRECTORIES[@]}"; do
    if [ -d "$dir" ] || [ -f "$dir" ]; then
        echo "Denegando acceso a $dir para el grupo $GROUP"
        sudo setfacl -m g:$GROUP:--- "$dir"
        if [ $? -ne 0 ]; then
            echo "Error al establecer ACL para $dir"
        fi
    else
        echo "El directorio $dir no existe. Saltando..."
    fi
done

echo "ACLs establecidas para el grupo $GROUP en los directorios especificados."
