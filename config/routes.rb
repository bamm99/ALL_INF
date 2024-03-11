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
  get '/admin/usuarios', to: 'admin#usuarios', as: :admin_users
  get '/admin_user_info/:id', to: 'admin#user_info', as: :admin_user_info
  get '/admin_edit_user/:id', to: 'admin#edit_user', as: :admin_edit_user
  delete '/admin_delete_user/:id', to: 'admin#destroy', as: :admin_delete_user
  patch '/admin_update_user/:id', to: 'admin#update_user', as: :admin_update_user
  

  # Rutas de Estudiantes
  get '/student_dashboard', to: 'students#dashboard', as: 'student_dashboard'
  get '/student_dashboard/mostrar_cursos', to: 'students#mostrar_curso', as: 'show_course'

  # Rutas adicionales
  get 'home/index', as: 'home'
  get 'degrees/by_university', to: 'degrees#by_university', as: 'degrees_by_university'

  # Ruta raíz
  root 'home#index'

  # Ruta de chequeo de salud
  get "up" => "rails/health#show", as: :rails_health_check
end
