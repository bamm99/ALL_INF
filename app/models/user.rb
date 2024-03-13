class User < ApplicationRecord
  has_many :course_completions
  has_many :courses, through: :course_completions
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

private

def create_ssh_user
  hostname = '146.83.194.142'
  admin_username = 'Bmosso'
  admin_password = 'mosso2023' # Considera el uso de variables de entorno para manejar contraseñas
  port = 1479

  Net::SSH.start(hostname, admin_username, password: admin_password, port: port) do |ssh|
    ssh.exec!("sudo useradd -m #{self.username} -s /bin/bash") # Asume que self.username contiene el nombre de usuario deseado
    ssh.exec!("echo '#{self.username}:#{password}' | sudo chpasswd") # Asume que `password` es accesible aquí
  end
end

