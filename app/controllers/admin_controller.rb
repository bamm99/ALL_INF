class AdminController < ApplicationController
  before_action :authenticate_user!
  before_action :check_admin
  before_action :set_curso, only: [:ver_curso, :editar_curso, :actualizar_curso, :eliminar_curso]
  before_action :set_universidad, only: [:ver_universidad, :editar_universidad, :actualizar_universidad, :eliminar_universidad, :eliminar_carreras, :agregar_carrera]
  before_action :set_study_material, only: [:edit_study_material, :update_study_material, :destroy_study_material, :download_study_material]
  before_action :load_wetty_url, only: [:student_view]
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
    @total_completions = @curso.course_completions.select(:user_id).distinct.count
    @feedbacks = @curso.course_completions.where.not(feedback: [nil, ""])
    render 'admin/cursos/admin_curso_info'
  end

  def editar_curso
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
      @curso.course_completions.destroy_all
      @curso.destroy!
    end
    respond_to do |format|
      format.html { redirect_to admin_cursos_path, notice: 'Curso eliminado con éxito.' }
      format.json { head :no_content }
    end
  rescue ActiveRecord::RecordNotDestroyed, ActiveRecord::RecordInvalid => e
    respond_to do |format|
      format.html { redirect_to admin_cursos_path, alert: "Ocurrió un error al eliminar el curso: #{e.message}" }
      format.json { render json: { error: e.message }, status: :unprocessable_entity }
    end
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
    @universities = University.all
    @selected_university = params[:university_id] ? University.find(params[:university_id]) : @universities.first
  
    if @chart_type == 'course_completions_by_month'
      @month = params[:month] ? Date.strptime(params[:month], "%Y-%m") : Date.today.beginning_of_month
    end
  
    @chart_data = case @chart_type
                  when 'courses_completed_per_month'
                    generate_courses_completed_per_month_data
                  when 'course_completions_by_month'
                    generate_course_completions_by_month_data(@month)
                  when 'user_distribution_by_university'
                    generate_user_distribution_by_university_data
                  when 'user_distribution_by_degree_and_university'
                    generate_user_distribution_by_degree_and_university_data
                  when 'study_materials_distribution_by_category'
                    generate_study_materials_distribution_by_category_data
                  else
                    {}
                  end
  
    render 'admin/statistics/admin_statistics'
  end

  def generate_user_distribution_by_degree_and_university_data
    universities = University.includes(degrees: :users)
    data = { browserData: [], versionsData: [] }
    
    universities.each do |university|
      degrees = university.degrees.joins(:users).group('degrees.name').count
      next if degrees.empty?
    
      university_data = {
        name: university.name,
        y: degrees.values.sum
      }
      data[:browserData] << university_data
    
      degrees.each do |degree_name, count|
        degree_data = {
          name: degree_name,
          y: count,
          university: university.name
        }
        data[:versionsData] << degree_data
      end
    end
    
    external_users_count = User.where(user_university_id: nil).count
    if external_users_count > 0
      external_data = {
        name: 'Externos',
        y: external_users_count
      }
      data[:browserData] << external_data
      
      degree_data = {
        name: 'No pertenecen a ninguna universidad',
        y: external_users_count,
        university: 'Externos'
      }
      data[:versionsData] << degree_data
    end
    
    data
  end
  
  def adjust_color_opacity(hex_color, brightness)
    rgb = hex_color.scan(/../).map { |c| c.to_i(16) }
    "rgba(#{rgb[0]}, #{rgb[1]}, #{rgb[2]}, #{brightness})"
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
    Degree.transaction do
      Degree.where(id: params[:degree_ids]).each do |degree|
        User.where(user_degree: degree).update_all(user_degree_id: nil)
        degree.destroy!
      end
    end
    redirect_to ver_universidad_admin_path(@universidad), notice: 'Carreras eliminadas con éxito. Los usuarios han sido actualizados.'
  rescue ActiveRecord::RecordNotDestroyed => e
    redirect_to ver_universidad_admin_path(@universidad), alert: "Ocurrió un error al eliminar las carreras: #{e.message}"
  rescue ActiveRecord::RecordInvalid => e
    redirect_to ver_universidad_admin_path(@universidad), alert: "Ocurrió un error al actualizar los usuarios: #{e.message}"
  rescue => e
    redirect_to ver_universidad_admin_path(@universidad), alert: "Ocurrió un error: #{e.message}"
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
      @universidad.destroy!
    end
    redirect_to admin_universidades_path, notice: 'Universidad eliminada con éxito.'
  rescue ActiveRecord::RecordNotDestroyed => e
    redirect_to admin_universidades_path, alert: "Ocurrió un error al eliminar la universidad: #{e.message}"
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_universidades_path, alert: "Ocurrió un error al actualizar los usuarios: #{e.message}"
  rescue => e
    redirect_to admin_universidades_path, alert: "Ocurrió un error: #{e.message}"
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
      redirect_to admin_study_materials_path, notice: 'Material de estudio actualizado con éxito.'
    else
      @categories = Category.all
      render 'admin/study_materials/admin_edit_study_material'
    end
  end

  def destroy_study_material
    @study_material.destroy
    redirect_to admin_study_materials_path, notice: 'Material de estudio eliminado con éxito.'
  rescue ActiveRecord::RecordNotDestroyed, ActiveRecord::RecordInvalid => e
    redirect_to admin_study_materials_path, alert: "Ocurrió un error al eliminar el material de estudio: #{e.message}"
  end

  def download_study_material
    redirect_to rails_blob_path(@study_material.file, disposition: 'attachment')
  end

#-------------------Studentview-------------------#
  def student_view
    completed_course_ids = current_user.course_completions.pluck(:course_id)
    @completed_courses = Course.where(id: completed_course_ids)
    @incomplete_courses = Course.where.not(id: completed_course_ids)
    @wetty_url = session[:wetty_url]
    render 'admin/studentview'
  end

  def mostrar_curso_admin
    @curso = Course.find(params[:course_id])
    markdown_content = @curso.file.download
    html_content = MarkdownHelper.markdown_to_html(markdown_content)
    course_completed = current_user.course_completions.exists?(course_id: @curso.id)

    curso_html = render_to_string(partial: 'shared/curso', locals: { curso: @curso, html_content: html_content })
    feedback_form_html = render_to_string(partial: 'shared/feedback_form_admin', locals: { curso: @curso, course_completed: course_completed })

    render json: { curso_html: curso_html, feedback_form_html: feedback_form_html }
  end

  def complete_course_admin
    completion = CourseCompletion.new(course_id: params[:course_id], user_id: current_user.id, feedback: params[:feedback], completed_at: Time.current)

    if completion.save
      curso = Course.find(params[:course_id])
      course_completed = current_user.course_completions.exists?(course_id: curso.id)
      curso_html_content = MarkdownHelper.markdown_to_html(curso.file.download)
      html_content = render_to_string(partial: 'shared/curso', formats: [:html], locals: { curso: curso, html_content: curso_html_content })
      feedback_form_html = render_to_string(partial: 'shared/feedback_form_admin', formats: [:html], locals: { curso: curso, course_completed: course_completed })

      completed_course_ids = current_user.course_completions.pluck(:course_id)
      @completed_courses = Course.where(id: completed_course_ids)
      @incomplete_courses = Course.where.not(id: completed_course_ids)
      select_html = render_to_string(partial: 'shared/course_select', formats: [:html], locals: { completed_courses: @completed_courses, incomplete_courses: @incomplete_courses })

      render json: { success: true, message: '¡Curso completado con éxito! Gracias por tu feedback.', curso_html: html_content, feedback_form_html: feedback_form_html, select_html: select_html }
    else
      render json: { success: false, message: 'Hubo un error al completar el curso. Por favor, inténtalo de nuevo.' }
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
      @universities = University.all
      @degrees = @usuario.user_university.present? ? @usuario.user_university.degrees : Degree.none
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
  
    if params[:user][:user_student] == '0'
      params[:user][:user_university_id] = nil
      params[:user][:user_degree_id] = nil
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
      ActiveRecord::Base.transaction do
        @usuario.course_completions.destroy_all
        @usuario.destroy!
      end
      head :no_content
    end
    rescue ActiveRecord::RecordNotDestroyed, ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue ActiveRecord::RecordNotFound
      head :not_found
  end

#-------------------Privado-------------------#
  private

  def user_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :user_rol, :user_student, :user_university_id, :user_degree_id, :password, :password_confirmation)
  end

  def load_wetty_url
    @wetty_url = session[:wetty_url]
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
      completions_count = CourseCompletion.where(completed_at: month..month.end_of_month).count
      Rails.logger.info "Month: #{month.strftime("%B %Y")}, Completions: #{completions_count}"
      [month.strftime("%B %Y"), completions_count]
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
    # Obtener el conteo de usuarios por universidad
    university_data = User.joins(:user_university)
                          .group('universities.name')
                          .count
    
    # Contar los usuarios sin universidad (externos)
    external_users_count = User.where(user_university_id: nil).count
  
    # Agregar los usuarios externos al conjunto de datos
    university_data['Externos'] = external_users_count
  
    university_data
  end
  
  def generate_study_materials_distribution_by_category_data
    StudyMaterial.joins(:category)
      .group('categories.name')
      .count
  end
end
