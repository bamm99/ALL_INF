Rails.application.routes.draw do

  get '/admin/dashboard', to: 'admin#dashboard', as: 'admin_dashboard'
  get '/admin/usuarios', to: 'admin#usuarios', as: 'admin_usuarios'
  get 'admin/user_info/:id', to: 'admin#user_info', as: 'admin_user_info'
  delete '/admin/users/:id', to: 'admin#destroy', as: 'admin_destroy_user'
  get '/admin/edit_user/:id', to: 'admin#edit_user', as: 'admin_edit_user'
  patch '/admin/users/:id', to: 'admin#update_user', as: 'admin_update_user'
  get '/admin/cursos', to: 'admin#cursos', as: 'admin_cursos'
  post '/admin/courses/create', to: 'admin#create_course', as: 'admin_create_course'
  patch '/admin/courses/:id', to: 'admin#update_course', as: 'admin_update_course'
  get '/admin/courses/edit/:id', to: 'admin#edit_course', as: 'edit_admin_course'
  delete '/admin/courses/:id', to: 'admin#delete_course', as: 'admin_course'

  get '/student_dashboard', to: 'students#dashboard'
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    passwords: 'users/passwords',
    confirmations: 'users/confirmations',
    unlocks: 'users/unlocks'
  }
  devise_scope :user do
    get '/users/sign_out' => 'users/sessions#destroy'
  end

  get 'home/index'
  get 'degrees/by_university', to: 'degrees#by_university'

  root 'home#index'

  get "up" => "rails/health#show", as: :rails_health_check
end
