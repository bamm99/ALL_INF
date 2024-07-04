Rails.application.routes.draw do
  # Rutas de Devise (autenticación)
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    passwords: 'users/passwords',
    confirmations: 'users/confirmations',
    unlocks: 'users/unlocks'
  }

  # Rutas para Admin
  get '/admin', to: 'admin#dashboard', as: 'admin_dashboard'

  # rutas admin/users
  get '/admin/usuarios', to: 'admin#usuarios', as: :admin_users
  get '/admin_user_info/:id', to: 'admin#user_info', as: :admin_user_info
  get '/admin_edit_user/:id', to: 'admin#edit_user', as: :admin_edit_user
  delete '/admin_delete_user/:id', to: 'admin#destroy', as: :admin_delete_user
  patch '/admin_update_user/:id', to: 'admin#update_user', as: :admin_update_user

  # rutas admin/courses
  get 'admin/cursos', to: 'admin#cursos', as: 'admin_cursos'
  get 'admin/cursos/nuevo', to: 'admin#nuevo_curso', as: 'nuevo_curso_admin'
  post 'admin/cursos', to: 'admin#crear_curso', as: 'crear_curso_admin'
  get 'admin/cursos/:id', to: 'admin#ver_curso', as: 'ver_curso_admin'
  get 'admin/cursos/:id/editar', to: 'admin#editar_curso', as: 'editar_curso_admin'
  patch 'admin/cursos/:id', to: 'admin#actualizar_curso', as: 'actualizar_curso_admin'
  delete 'admin/cursos/:id', to: 'admin#eliminar_curso', as: 'eliminar_curso_admin'
  #feedbacks cursos
  delete 'admin/feedbacks', to: 'admin#eliminar_feedbacks', as: 'eliminar_feedbacks_admin'

# rutas admin/universities
get 'admin/universidades', to: 'admin#universidades', as: 'admin_universidades'
get 'admin/universidades/nuevo', to: 'admin#nuevo_universidad', as: 'nuevo_universidad_admin'
post 'admin/universidades', to: 'admin#crear_universidad', as: 'crear_universidad_admin'
get 'admin/universidades/:id', to: 'admin#ver_universidad', as: 'ver_universidad_admin'
get 'admin/universidades/:id/editar', to: 'admin#editar_universidad', as: 'editar_universidad_admin'
patch 'admin/universidades/:id', to: 'admin#actualizar_universidad', as: 'actualizar_universidad_admin'
delete 'admin/universidades/:id', to: 'admin#eliminar_universidad', as: 'eliminar_universidad_admin'
delete 'admin/universidades/:id/carreras', to: 'admin#eliminar_carreras', as: 'eliminar_carreras_admin'
post 'admin/universidades/:id/agregar_carrera', to: 'admin#agregar_carrera', as: 'agregar_carrera_admin'

  # ruta student_view para admin
  get '/admin/student_view', to: 'admin#student_view', as: 'admin_student_view'

  # Rutas de Estudiantes
  get '/student_dashboard', to: 'students#dashboard', as: 'student_dashboard'
  get 'student_dashboard/mostrar_cursos', to: 'students#mostrar_curso', as: 'mostrar_curso'
  post 'students/complete_course', to: 'students#complete_course', as: 'complete_course'

  # Rutas adicionales
  get 'home/index', as: 'home'
  get 'degrees/by_university', to: 'degrees#by_university', as: 'degrees_by_university'

  # Ruta raíz
  root 'home#index'

  # Ruta de chequeo de salud
  get "up" => "rails/health#show", as: :rails_health_check
end