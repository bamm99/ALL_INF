class ModifyStudyMaterials < ActiveRecord::Migration[7.1]
  def change
    # Eliminar el campo de categoría actual
    remove_column :study_materials, :category, :string

    # Agregar el campo de descripción
    add_column :study_materials, :description, :text

    # Agregar la referencia a la tabla de categorías
    add_reference :study_materials, :category, foreign_key: true
  end
end
