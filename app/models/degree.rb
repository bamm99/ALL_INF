class Degree < ApplicationRecord
  belongs_to :university
  has_many :users, foreign_key: 'user_degree_id'
end
