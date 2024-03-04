class StudentsController < ApplicationController
  include MarkdownHelper # Incluye el módulo para usarlo en las vistas si es necesario

  before_action :authenticate_user!

  def dashboard
    @cursos = Course.all
    # Aquí se prepara la variable @cursos para usar en la vista dashboard
  end

  def mostrar_curso
    curso = Course.find(params[:course_id])
    markdown_content = curso.file.download
    html_content = MarkdownHelper.markdown_to_html(markdown_content)
    render json: { content: html_content }
  end
  
end
