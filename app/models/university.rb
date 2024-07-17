class University < ApplicationRecord
    has_many :users, foreign_key: 'user_university_id'
    has_many :degrees
end
