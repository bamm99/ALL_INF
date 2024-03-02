Rails.application.routes.draw do

  get '/admin/dashboard', to: 'admin#dashboard', as: 'admin_dashboard'
  get '/admin/usuarios', to: 'admin#usuarios', as: 'admin_usuarios'
  get 'admin/user_info/:id', to: 'admin#user_info', as: 'admin_user_info'
  delete '/admin/users/:id', to: 'admin#destroy', as: 'admin_user'
  get '/admin/edit_user/:id', to: 'admin#edit_user', as: 'admin_edit_user'
  patch '/admin/users/:id', to: 'admin#update_user', as: 'admin_update_user'
  
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
