class DegreesController < ApplicationController
    def by_university
        university = University.find(params[:university_id])
        degrees = university.degrees # Asegúrate de que exista una relación entre universidades y carreras
        render json: degrees
      end
end
