class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]

  def after_sign_in_path_for(resource)
    # Llama a la función para crear/verificar la sesión screen para el usuario
    create_user_screen_session(resource)

    # Redirige al usuario a su dashboard correspondiente
    if resource.admin?
      admin_dashboard_path # Suponiendo que tienes una ruta 'admin_dashboard_path'
    else
      student_dashboard_path # Suponiendo que tienes una ruta 'student_dashboard_path'
    end
  end

  private

  def create_user_screen_session(user)
    Rails.logger.info "Iniciando creación de sesión screen para el usuario #{user.email}"

    username = user.email.split('@').first # O cualquier lógica para definir un nombre de sesión único basado en el usuario

    Net::SSH.start(ENV['SSH_HOST'], ENV['SSH_USER'], password: ENV['SSH_PASSWORD'], port: ENV['SSH_PORT'].to_i) do |ssh|
      session_name = "session_#{username}"
      # Verifica si ya existe una sesión screen y créala si no existe
      ssh.exec!("screen -list | grep #{session_name} || screen -dmS #{session_name}")
    end
    Rails.logger.info "Sesión screen creada o verificada para el usuario #{user.email}"
  rescue => e
    Rails.logger.error "Error al crear sesión screen para el usuario #{user.email}: #{e.message}"
  end
end
