class StudentsController < ApplicationController
  before_action :authenticate_user!

  def dashboard
    @cursos = Course.all
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
      curso = Course.find(params[:course_id])
      curso_html_content = MarkdownHelper.markdown_to_html(curso.file.download)
      html_content = render_to_string(partial: 'shared/curso', formats: [:html], locals: { curso: curso, html_content: curso_html_content })
      feedback_form_html = render_to_string(partial: 'shared/feedback_form', formats: [:html], locals: { curso: curso })

      render json: { success: true, message: '¡Curso completado con éxito! Gracias por tu feedback.', curso_html: html_content, feedback_form_html: feedback_form_html }
    else
      render json: { success: false, message: 'Hubo un error al completar el curso. Por favor, inténtalo de nuevo.' }
    end
  end

private


  def set_curso
    @curso = Course.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      redirect_to admin_cursos_path, alert: 'Curso no encontrado.'
  end
end
