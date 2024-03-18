class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]

  def after_sign_in_path_for(resource)
    # Llama a la función para crear/verificar la sesión screen para el usuario
    create_user_screen_session(resource)
    super

    # Redirige al usuario a su dashboard correspondiente
    if resource.admin?
      admin_dashboard_path
    else
      student_dashboard_path
    end
  end

  def create_user_screen_session(user)
    Rails.logger.info "Iniciando configuración de usuario para #{user.email}"
  
    user_name = "webappuser_#{user.id}"
    user_password = user.email # Usando el email como contraseña
    user_group = "webappusers" # Nombre del grupo común para todos los usuarios
    ssh_host = ENV['SSH_HOST']
    ssh_user = ENV['SSH_USER']
    ssh_password = ENV['SSH_PASSWORD']
    ssh_port = ENV['SSH_PORT'].to_i
  
    Net::SSH.start(ssh_host, ssh_user, password: ssh_password, port: ssh_port) do |ssh|
      # Verifica si el grupo ya existe, si no, créalo
      unless ssh.exec!("getent group #{user_group}").include?(user_group)
        ssh.exec!("sudo groupadd #{user_group}")
        Rails.logger.info "Grupo #{user_group} creado."
      end
  
      # Verifica si el usuario ya existe
      output = ssh.exec!("id #{user_name}")
      if output.include?("no such user")
        # Crea el usuario con un shell limitado, sin acceso a sudo y lo agrega al grupo
        ssh.exec!("sudo useradd -m -s /bin/bash -g #{user_group} #{user_name}")
        ssh.exec!("echo #{user_name}:#{user_password} | sudo chpasswd")
  
        # Crear directorio de trabajo para el usuario
        ssh.exec!("sudo mkdir -p /home/#{user_name}/work")
        ssh.exec!("sudo chown #{user_name}:#{user_group} /home/#{user_name}/work")
  
        Rails.logger.info "Usuario #{user_name} creado con éxito en el servidor y agregado al grupo #{user_group}."
  
        # Crear sesión screen para el usuario
        screen_session_name = "session_#{user.id}"
        ssh.exec!("sudo -u #{user_name} screen -dmS #{screen_session_name}")
        Rails.logger.info "Sesión screen #{screen_session_name} creada para el usuario #{user_name}."
      else
        Rails.logger.info "El usuario #{user_name} ya existe en el servidor."
      end
    end
  rescue => e
    Rails.logger.error "Error al crear usuario #{user_name} o al agregarlo al grupo #{user_group}: #{e.message}"
  end
end