class User < ApplicationRecord
  enum user_rol: { normal: 0, admin: 1 }

  #validates :username, presence: true, length: { minimum: 3, maximum: 25 }
  #validates :email, presence: true, length: { maximum: 105 },
  #                  uniqueness: { case_sensitive: false },
  #                  format: { with: URI::MailTo::EMAIL_REGEXP }
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
