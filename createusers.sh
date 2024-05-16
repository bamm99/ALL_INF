#!/bin/bash
# create_user.sh

# Check for root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please run with sudo."
    exit 1
fi

# Variables
username=$1
password=$2

# Check if the necessary arguments are provided
if [ -z "$username" ] || [ -z "$password" ]; then
    echo "Usage: $0 <username> <password>"
    exit 1
fi

# Check if the user already exists
if id "$username" &>/dev/null; then
    echo "The user '$username' already exists."
    exit 1
fi

# Create the user with a home directory, bash shell, and add to the 'students' group
useradd -m -s /bin/bash -G students "$username"

# Set the password
echo "$username:$password" | chpasswd

# Set the permissions for the home directory
chmod 700 /home/"$username"
chown "$username:students" /home/"$username"

# Create necessary files and set permissions
touch /home/"$username"/.bashrc
touch /home/"$username"/.profile
chown "$username:students" /home/"$username"/.bashrc /home/"$username"/.profile
chmod 644 /home/"$username"/.bashrc /home/"$username"/.profile

# Ensure /bin/bash is listed in /etc/shells
if ! grep -q "/bin/bash" /etc/shells; then
    echo "/bin/bash" >> /etc/shells
fi

echo "User '$username' successfully created with home directory, bash shell, and added to t>
