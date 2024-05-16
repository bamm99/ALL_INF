class Users::RegistrationsController < Devise::RegistrationsController
  private

  def sign_up_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :password, :password_confirmation, :user_student, :user_university_id, :user_degree_id)
  end

  def account_update_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :password, :current_password, :password_confirmation, :user_student, :user_university_id, :user_degree_id)
  end

  protected

  # Sobrescribe el método after_sign_up_path_for para cerrar la sesión
  def after_sign_up_path_for(resource)
    sign_out(resource) # Cierra la sesión del usuario después del registro
    root_path # Redirige al usuario al home o a la página que prefieras
  end
end
