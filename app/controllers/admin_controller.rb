class AdminController < ApplicationController
  before_action :authenticate_user!
  before_action :check_admin
  before_action :set_curso, only: [:ver_curso, :editar_curso, :actualizar_curso, :eliminar_curso]
  before_action :set_universidad, only: [:ver_universidad, :editar_universidad, :actualizar_universidad, :eliminar_universidad, :eliminar_carreras, :agregar_carrera]
  before_action :set_study_material, only: [:edit_study_material, :update_study_material, :destroy_study_material, :download_study_material]

  include MarkdownHelper
  #-------------------Cursos-------------------#
  def cursos
    @cursos = Course.all
    render 'admin/cursos/admin_cursos'
  end

  def nuevo_curso
    @curso = Course.new
    render 'admin/cursos/admin_agregar_curso'
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
    @total_completions = @curso.course_completions.select(:user_id).distinct.count
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
      if params[:file_content].present?
        @curso.file.attach(io: StringIO.new(params[:file_content]), filename: 'contenido.md') if params[:file_content].present?
      end
      redirect_to ver_curso_admin_path(@curso), notice: 'Curso actualizado con éxito.'
    else
      @curso_content = params[:file_content] || ""
      render :editar_curso
    end
  end

  def eliminar_curso
    ActiveRecord::Base.transaction do
      @curso = Course.find(params[:id])
      @curso.course_completions.destroy_all
      @curso.destroy
    end
    redirect_to admin_cursos_path, notice: 'Curso eliminado con éxito.'
  rescue ActiveRecord::RecordNotDestroyed => e
    redirect_to admin_cursos_path, alert: "Ocurrió un error al eliminar el curso: #{e.message}"
  rescue => e
    redirect_to admin_cursos_path, alert: "Ocurrió un error: #{e.message}"
  end

  def eliminar_feedbacks
    CourseCompletion.where(id: params[:feedback_ids]).destroy_all
    redirect_to request.referer, notice: 'Feedbacks eliminados correctamente.'
  rescue ActiveRecord::RecordNotFound => e
    redirect_to request.referer, alert: "Algunos feedbacks no se pudieron encontrar: #{e.message}"
  rescue => e
    redirect_to request.referer, alert: "Ocurrió un error al eliminar los feedbacks: #{e.message}"
  end

  #-------------------Dashboard-------------------#
  def dashboard
    # Dashboard content
  end

  #-------------------Estadisticas----------------#
  def statistics
    @chart_type = params[:chart_type] || 'courses_completed_per_month'
    @month = params[:month].present? ? Date.strptime(params[:month], "%Y-%m") : Date.today.beginning_of_month
    @universities = University.all
    @selected_university = params[:university_id].present? ? University.find(params[:university_id]) : nil

    @chart_data = case @chart_type
                  when 'courses_completed_per_month'
                    generate_courses_completed_per_month_data
                  when 'course_completions_by_month'
                    generate_course_completions_by_month_data(@month)
                  when 'user_distribution_by_university'
                    generate_user_distribution_by_university_data
                  when 'user_distribution_by_degree_and_university'
                    generate_user_distribution_by_degree_and_university_data(@selected_university)
                  when 'study_materials_distribution_by_category'
                    generate_study_materials_distribution_by_category_data
                  else
                    {}
                  end

    render 'admin/statistics/admin_statistics'
  end
  #-------------------Universidades-------------------#
  def universidades
    @universidades = University.all
    render 'admin/universidades/admin_universidades'
  end

  def nuevo_universidad
    @universidad = University.new
    render 'admin/universidades/admin_agregar_universidad'
  end

  def crear_universidad
    @universidad = University.new(name: params[:university_name])
    if @universidad.save
      redirect_to admin_universidades_path, notice: 'Universidad creada con éxito.'
    else
      redirect_to admin_universidades_path, alert: 'Error al crear la universidad.'
    end
  end

  def ver_universidad
    @usuarios_count = User.where(user_university_id: @universidad.id).count
    @degrees = @universidad.degrees
    render 'admin/universidades/admin_universidad_info'
  end

  def agregar_carrera
    degree_name = params[:degree_name]
    if degree_name.present?
      @universidad.degrees.create!(name: degree_name)
      redirect_to ver_universidad_admin_path(@universidad), notice: 'Carrera agregada con éxito.'
    else
      redirect_to ver_universidad_admin_path(@universidad), alert: 'El nombre de la carrera no puede estar vacío.'
    end
  rescue => e
    redirect_to ver_universidad_admin_path(@universidad), alert: "Ocurrió un error al agregar la carrera: #{e.message}"
  end

  def eliminar_carreras
    begin
      Degree.transaction do
        Degree.where(id: params[:degree_ids]).each do |degree|
          User.where(user_degree: degree).update_all(user_degree_id: nil)
          degree.destroy!
        end
      end
      redirect_to ver_universidad_admin_path(@universidad), notice: 'Carreras eliminadas con éxito. Los usuarios han sido actualizados.'
    rescue => e
      redirect_to ver_universidad_admin_path(@universidad), alert: "Ocurrió un error al eliminar las carreras: #{e.message}"
    end
  end

  def eliminar_universidad
    ActiveRecord::Base.transaction do
      @universidad = University.find(params[:id])
      degrees = @universidad.degrees
      degrees.each do |degree|
        User.where(user_degree_id: degree.id).update_all(user_degree_id: nil)
      end
      User.where(user_university_id: @universidad.id).update_all(user_university_id: nil)
      degrees.destroy_all
      @universidad.destroy
    end
    redirect_to admin_universidades_path, notice: 'Universidad eliminada con éxito.'
  rescue => e
    redirect_to admin_universidades_path, alert: "Ocurrió un error al eliminar la universidad: #{e.message}"
  end

  def editar_universidad
    @universidad = University.find(params[:id])
    render 'admin/universidades/admin_editar_universidad'
  end

  def actualizar_universidad
    if @universidad.update(university_params)
      redirect_to ver_universidad_admin_path(@universidad), notice: 'Universidad actualizada con éxito.'
    else
      render :editar_universidad
    end
  end

  #-------------------Materiales de Estudio-------------------#
  def study_materials
    @categories = Category.all
    @study_materials = StudyMaterial.all

    if params[:search].present?
      @study_materials = @study_materials.where('title ILIKE ? OR description ILIKE ?', "%#{params[:search]}%", "%#{params[:search]}%")
    end

    if params[:category_id].present?
      @study_materials = @study_materials.where(category_id: params[:category_id])
    end

    render 'admin/study_materials/admin_study_materials'
  end

  def new_study_material
    @study_material = StudyMaterial.new
    @categories = Category.all
    render 'admin/study_materials/admin_new_study_material'
  end

  def create_study_material
    @study_material = StudyMaterial.new(study_material_params)
    if @study_material.save
      redirect_to admin_study_materials_path, notice: 'Material de estudio creado con éxito.'
    else
      @categories = Category.all
      render 'admin/study_materials/admin_new_study_material'
    end
  end

  def edit_study_material
    @categories = Category.all
    render 'admin/study_materials/admin_edit_study_material'
  end

  def update_study_material
    if @study_material.update(study_material_params)
      redirect_to study_materials_path, notice: 'Material de estudio actualizado con éxito.'
    else
      @categories = Category.all
      render 'admin/study_materials/admin_edit_study_material'
    end
  end

  def destroy_study_material
    @study_material.destroy
    redirect_to study_materials_path, notice: 'Material de estudio eliminado con éxito.'
  end

  def download_study_material
    redirect_to rails_blob_path(@study_material.file, disposition: 'attachment')
  end

  #-------------------Studentview-------------------#
  def student_view
    @cursos = Course.all
    render 'admin/studentview'
  end

  def mostrar_curso
    @curso = Course.find(params[:course_id])
    markdown_content = @curso.file.download
    html_content = MarkdownHelper.markdown_to_html(markdown_content)

    curso_html = render_to_string(partial: 'shared/curso', locals: { curso: @curso, html_content: html_content })
    feedback_form_html = render_to_string(partial: 'shared/feedback_form', locals: { curso: @curso })

    render json: { curso_html: curso_html, feedback_form_html: feedback_form_html }
  end

  def complete_course
    completion = CourseCompletion.new(course_id: params[:course_id], user_id: current_user.id, feedback: params[:feedback], completed_at: Time.current)

    if completion.save
      redirect_to student_dashboard_path, notice: '¡Curso completado con éxito! Gracias por tu feedback.'
    else
      redirect_to student_dashboard_path, alert: 'Hubo un error al completar el curso. Por favor, inténtalo de nuevo.'
    end
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

    if params[:user][:password].blank?
      params[:user].delete(:password)
      params[:user].delete(:password_confirmation)
    end

    if @usuario.update(user_params)
      flash[:notice] = 'Usuario actualizado con éxito.'
      redirect_to admin_user_info_path(@usuario)
    else
      flash.now[:alert] = 'Error al actualizar el usuario.'
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
      head :no_content
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

  def set_universidad
    @universidad = University.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to admin_universidades_path, alert: 'Universidad no encontrada.'
  end

  def university_params
    params.require(:university).permit(:name)
  end

  def set_curso
    @curso = Course.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to admin_cursos_path, alert: 'Curso no encontrado.'
  end

  def course_params
    params.require(:course).permit(:title, :description, :file)
  end

  def set_study_material
    @study_material = StudyMaterial.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to study_materials_path, alert: 'Material de estudio no encontrado.'
  end

  def study_material_params
    params.require(:study_material).permit(:title, :description, :category_id, :file)
  end

  def set_categories
    @categories = Category.all
  end

  def generate_courses_completed_per_month_data
    (0..11).map { |i| Date.today.beginning_of_month - i.months }.reverse.map do |month|
      [month.strftime("%B %Y"), CourseCompletion.where(completed_at: month..month.end_of_month).count]
    end.to_h
  end

  def generate_course_completions_by_month_data(month)
    CourseCompletion.where(completed_at: month.beginning_of_month..month.end_of_month)
                    .group('course_id')
                    .order('count_id desc')
                    .count('id')
                    .transform_keys { |course_id| Course.find(course_id).title }
  end

  def generate_user_distribution_by_university_data
    User.joins(:user_university)
        .group('universities.name')
        .count
  end

  def generate_user_distribution_by_degree_and_university_data(university)
    return {} unless university

    university.users.joins(:user_degree)
              .group('degrees.name')
              .count
  end

  def generate_study_materials_distribution_by_category_data
    StudyMaterial.joins(:category)
                 .group('categories.name')
                 .count
  end
end
