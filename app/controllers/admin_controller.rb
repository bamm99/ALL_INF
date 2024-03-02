class AdminController < ApplicationController
  before_action :authenticate_user!
  before_action :check_admin

  def dashboard
    if params[:view] == 'usuarios'
      @usuarios = User.all
      render partial: 'shared/usuarios', locals: { usuarios: @usuarios }, layout: false
    elsif params[:view] == 'user_info' && params[:id].present?
      @usuario = User.find(params[:id])
      render partial: "shared/user_info", locals: { usuario: @usuario }, layout: false
    elsif params[:view] == 'edit_user' && params[:id].present?
      @usuario = User.find(params[:id])
      render partial: "shared/edit_user", locals: { usuario: @usuario }, layout: false
    else
      # Código para la vista principal del dashboard si es necesario
    end
  end

  def edit_user
    @usuario = User.find(params[:id])
    # Asegúrate de tener manejo de errores en caso de que el usuario no se encuentre
  end
  
  def update_user
    @usuario = User.find(params[:id])
    updated_params = user_params
  
    # Si el usuario ya no es estudiante, se asegura de que user_university_id y user_degree_id se establezcan en nil.
    if updated_params[:user_student] == "0"
      success = @usuario.update(updated_params.except(:user_university_id, :user_degree_id).merge(user_university_id: nil, user_degree_id: nil))
    else
      success = @usuario.update(updated_params)
    end
  
    if success
      redirect_to admin_dashboard_path, notice: "Usuario actualizado con éxito."
    else
      flash[:alert] = @usuario.errors.full_messages.to_sentence
      redirect_to admin_dashboard_path, notice: "Error, Usuario no actualizado."
    end
  end

  def destroy
    @usuario = User.find(params[:id])
    if @usuario.destroy
      # Si quieres devolver JSON o alguna otra cosa, ajusta esto
      head :no_content
    else
      render json: { error: "No se pudo eliminar el usuario." }, status: :unprocessable_entity
    end
  end


  private

  def user_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :user_rol, :user_student, :user_university_id, :user_degree_id)
  end

  def check_admin
    redirect_to(root_path) unless current_user.admin?
  end
end