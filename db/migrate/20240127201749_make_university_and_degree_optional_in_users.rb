class MakeUniversityAndDegreeOptionalInUsers < ActiveRecord::Migration[7.0]
  def change
    change_column_null :users, :user_university_id, true
    change_column_null :users, :user_degree_id, true
  end
end
