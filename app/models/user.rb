class User < ApplicationRecord
  enum user_rol: { normal: 0, admin: 1 }

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Haz que las asociaciones sean opcionales
  belongs_to :user_university, class_name: 'University', foreign_key: 'user_university_id', optional: true
  belongs_to :user_degree, class_name: 'Degree', foreign_key: 'user_degree_id', optional: true

  # Validaciones condicionales
  validates :user_university_id, presence: true, if: :user_student?
  validates :user_degree_id, presence: true, if: :user_student?

  def user_student?
    user_student == true || user_student == "1"
  end
end
