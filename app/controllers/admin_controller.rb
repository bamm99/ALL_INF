class AdminController < ApplicationController
  before_action :authenticate_user!
  before_action :check_admin

  def dashboard
    #dashboard 
  end

  def usuarios
    @usuarios = User.all
    render 'admin/usuarios/admin_users', locals: { usuarios: @usuarios }
  end

  def user_info
    @usuario = User.find(params[:id]) if params[:id].present?
    if @usuario
      render 'admin/usuarios/admin_user_info', locals: { usuario: @usuario }
    else
      redirect_to admin_usuarios_path, alert: 'Usuario no encontrado.'
    end
  end

  def edit_user
    @usuario = User.find(params[:id])
    if @usuario
      render 'admin/usuarios/admin_edit_user', locals: { usuario: @usuario }
    else
      redirect_to admin_usuarios_path, alert: 'Usuario no encontrado.'
    end
  end

  def update_user
    @usuario = User.find(params[:id])
  
    # Omitir la actualización de la contraseña si el campo está en blanco
    if params[:user][:password].blank?
      params[:user].delete(:password)
      params[:user].delete(:password_confirmation) # También es buena idea eliminar la confirmación si existe
    end
  
    if @usuario.update(user_params)
      redirect_to admin_user_info_path(@usuario), notice: 'Usuario actualizado con éxito.'
    else
      # Pasar @usuario a la vista como variable de instancia para evitar problemas de scope
      render 'admin/usuarios/admin_edit_user', status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    redirect_to admin_usuarios_path, alert: 'Usuario no encontrado.'
  end
  
  

  def destroy
    @usuario = User.find(params[:id])
    if @usuario == current_user
      render json: { error: "No puedes eliminar tu propio usuario." }, status: :forbidden
    else
      @usuario.destroy
      head :no_content # Indica éxito sin contenido de retorno
    end
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private

  def user_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :user_rol, :user_student, :user_university_id, :user_degree_id, :password, :password_confirmation)
  end

  def course_params
    params.require(:course).permit(:title, :description, :file)
  end

  def check_admin
    head :forbidden unless current_user.admin?
  end
end
