class Course < ApplicationRecord
    has_many :course_completions, dependent: :destroy
    has_many :users, through: :course_completions
    has_one_attached :file
end  