class RemoveFileFromCourses < ActiveRecord::Migration[7.1]
  def change
    remove_column :courses, :file, :string
  end
end
