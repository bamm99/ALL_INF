class CreateStudyMaterials < ActiveRecord::Migration[7.1]
  def change
    create_table :study_materials do |t|
      t.string :title
      t.string :category
      t.string :file

      t.timestamps
    end
  end
end
