class Users::PasswordsController < Devise::PasswordsController
  # GET /resource/password/new
  def new

    super

    @admin_emails = User.where(user_rol: User.user_rols[:admin]).pluck(:email)
  end
end
