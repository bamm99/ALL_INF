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
    elsif params[:view] == 'cursos'
      @cursos = Course.all
      @nuevo_curso = Course.new
      render partial: 'shared/cursos', locals: { cursos: @cursos, nuevo_curso: @nuevo_curso }, layout: false  
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
  
    # Elimina los parámetros de contraseña si la nueva contraseña está vacía
    if updated_params[:password].blank?
      updated_params.delete(:password)
      updated_params.delete(:password_confirmation)
    end

    # Actualiza user_university_id y user_degree_id si el usuario no es estudiante
    if updated_params[:user_student] == "0"
      updated_params[:user_university_id] = nil
      updated_params[:user_degree_id] = nil
    end

    # Intenta actualizar el usuario con los parámetros actualizados
    if @usuario.update(updated_params)
      redirect_to admin_dashboard_path, notice: "Usuario actualizado con éxito."
    else
      flash[:alert] = @usuario.errors.full_messages.to_sentence
      # Asegúrate de redirigir o renderizar de manera que el usuario pueda corregir los errores
      redirect_to admin_dashboard_path(view: 'edit_user', id: @usuario.id), alert: "Error al actualizar el usuario."
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

  def cursos
    @cursos = Course.all
    # Aquí también puedes construir un nuevo curso para el formulario
    @nuevo_curso = Course.new
    render partial: 'cursos', locals: { cursos: @cursos, nuevo_curso: @nuevo_curso }
  end

  def create_course
    @course = Course.new(course_params)
    if @course.save
      redirect_to admin_dashboard_path(view: 'cursos'), notice: 'Curso creado con éxito.'
    else
      flash[:alert] = @course.errors.full_messages.to_sentence
      redirect_to admin_dashboard_path(view: 'cursos')
    end
  end
  

  def update_course
    @course = Course.find(params[:id])
    if @course.update(course_params)
      # Redireccionar o renderizar vista con éxito
    else
      # Renderizar vista de error
    end
  end

  private

  def user_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :user_rol, :user_student, :user_university_id, :user_degree_id, :password, :password_confirmation)
  end

  def course_params
    # Asegúrate de incluir :file o :files en los parámetros permitidos
    params.require(:course).permit(:title, :description, :file)
  end

  def check_admin
    redirect_to(root_path) unless current_user.admin?
  end
end