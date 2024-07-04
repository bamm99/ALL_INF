class StudentsController < ApplicationController
  include MarkdownHelper # Incluye el módulo para usarlo en las vistas si es necesario

  before_action :authenticate_user!

  def dashboard
    @cursos = Course.all
    # Aquí se prepara la variable @cursos para usar en la vista dashboard
  end
  
  def mostrar_curso
    @curso = Course.find(params[:course_id])
    markdown_content = @curso.file.download
    html_content = MarkdownHelper.markdown_to_html(markdown_content) # Asegúrate de que esta llamada sea correcta.
  
    curso_html = render_to_string(partial: 'shared/curso', locals: { curso: @curso, html_content: html_content })
    feedback_form_html = render_to_string(partial: 'shared/feedback_form', locals: { curso: @curso })
    
    render json: { curso_html: curso_html, feedback_form_html: feedback_form_html }
  end

  def complete_course
    # Crea un nuevo registro de CourseCompletion con el ID del curso, el ID del usuario actual y el feedback (si lo hay)
    completion = CourseCompletion.new(course_id: params[:course_id], user_id: current_user.id, feedback: params[:feedback], completed_at: Time.current)

    if completion.save
      # Si el registro se guarda correctamente, redirige al usuario con un mensaje de éxito.
      redirect_to student_dashboard_path, notice: '¡Curso completado con éxito! Gracias por tu feedback.'
    else
      # Si hay un error al guardar, redirige al usuario con un mensaje de error.
      redirect_to student_dashboard_path, alert: 'Hubo un error al completar el curso. Por favor, inténtalo de nuevo.'
    end
  end
  
end
