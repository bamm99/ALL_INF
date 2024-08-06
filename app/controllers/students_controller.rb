class StudentsController < ApplicationController
  before_action :authenticate_user!

  def clear_flash_messages
    flash.clear
    head :ok
  end

  def dashboard
    completed_course_ids = current_user.course_completions.pluck(:course_id)
    @completed_courses = Course.where(id: completed_course_ids)
    @incomplete_courses = Course.where.not(id: completed_course_ids)
    @wetty_url = session[:wetty_url]
  end

  def mostrar_curso
    @curso = Course.find(params[:course_id])
    markdown_content = @curso.file.download
    html_content = MarkdownHelper.markdown_to_html(markdown_content)
    course_completed = current_user.course_completions.exists?(course_id: @curso.id)

    curso_html = render_to_string(partial: 'shared/curso', locals: { curso: @curso, html_content: html_content })
    feedback_form_html = render_to_string(partial: 'shared/feedback_form', locals: { curso: @curso, course_completed: course_completed })

    render json: { curso_html: curso_html, feedback_form_html: feedback_form_html }
  end

  def complete_course
    completion = CourseCompletion.new(course_id: params[:course_id], user_id: current_user.id, feedback: params[:feedback], completed_at: Time.current)

    if completion.save
      flash[:notice] = '¡Curso completado con éxito! Gracias por tu feedback.'
      curso = Course.find(params[:course_id])
      course_completed = current_user.course_completions.exists?(course_id: curso.id)
      curso_html_content = MarkdownHelper.markdown_to_html(curso.file.download)
      html_content = render_to_string(partial: 'shared/curso', formats: [:html], locals: { curso: curso, html_content: curso_html_content })
      feedback_form_html = render_to_string(partial: 'shared/feedback_form', formats: [:html], locals: { curso: curso, course_completed: course_completed })

      completed_course_ids = current_user.course_completions.pluck(:course_id)
      @completed_courses = Course.where(id: completed_course_ids)
      @incomplete_courses = Course.where.not(id: completed_course_ids)
      select_html = render_to_string(partial: 'shared/course_select', formats: [:html], locals: { completed_courses: @completed_courses, incomplete_courses: @incomplete_courses })

      render json: { success: true, message: flash[:notice], curso_html: html_content, feedback_form_html: feedback_form_html, select_html: select_html }
    else
      flash[:error] = 'Hubo un error al completar el curso. Por favor, inténtalo de nuevo.'
      render json: { success: false, message: flash[:error] }
    end
  end
end
