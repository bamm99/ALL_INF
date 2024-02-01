Rails.application.routes.draw do
  get '/admin_dashboard', to: 'admin#dashboard'
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
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
