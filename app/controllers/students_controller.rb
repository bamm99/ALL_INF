class StudentsController < ApplicationController
  before_action :authenticate_user!

  def dashboard
    # Vista para el dashboard del usuario
  end
end
