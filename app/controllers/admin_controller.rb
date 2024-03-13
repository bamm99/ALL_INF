class AdminController < ApplicationController
  before_action :authenticate_user!
  before_action :check_admin
  before_action :set_curso, only: [:ver_curso, :editar_curso, :actualizar_curso, :eliminar_curso]

  #-------------------Cursos-------------------#

  def cursos
    @cursos = Course.all
    render 'admin/cursos/admin_cursos'

  end

  def nuevo_curso
    @curso = Course.new
    render 'admin/cursos/admin_agregar_curso' # Asegúrate de que esta línea apunte correctamente al archivo de la vista

  end

  def crear_curso
    @curso = Course.new(course_params)
    if @curso.save
      redirect_to admin_cursos_path, notice: 'Curso creado con éxito.'
    else
      render :nuevo_curso
    end
  end

  def ver_curso
    @curso = Course.find(params[:id])
    # Cantidad total de completaciones del curso
    @total_completions = @curso.course_completions.count
    # Solo las completaciones que tienen feedback no nulo y no vacío
    @feedbacks = @curso.course_completions.where.not(feedback: [nil, ""])
    render 'admin/cursos/admin_curso_info'
  end
  

  def editar_curso
    @curso = Course.find(params[:id])
    if @curso.file.attached?
      @curso_content = @curso.file.download.force_encoding('UTF-8')
    else
      @curso_content = ""
    end
    render 'admin/cursos/admin_editar_curso'
  end
  

  def actualizar_curso
    if @curso.update(course_params.except(:file))
      # Actualizar el archivo .md si es necesario
      if params[:file_content].present?
        # Reemplazar el archivo existente o adjuntar uno nuevo
        @curso.file.attach(io: StringIO.new(params[:file_content]), filename: 'contenido.md') if params[:file_content].present?
      end
  
      redirect_to ver_curso_admin_path(@curso), notice: 'Curso actualizado con éxito.'
    else
      @curso_content = params[:file_content] || ""
      render :editar_curso
    end
  end

  def eliminar_curso
    @curso.destroy
    redirect_to admin_cursos_path, notice: 'Curso eliminado con éxito.'
  end

  #-------------------Dashboard-------------------#

  def dashboard
    #dashboard 
  end

  #-------------------Usuarios-------------------#

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

#-------------------Privado-------------------#

  private

  def user_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :user_rol, :user_student, :user_university_id, :user_degree_id, :password, :password_confirmation)
  end

  def check_admin
    head :forbidden unless current_user.admin?
  end

  def set_curso
    @curso = Course.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to admin_cursos_path, alert: 'Curso no encontrado.'
  end

  def course_params
    params.require(:course).permit(:title, :description, :file)
  end


end
