
# db/seeds.rb

# Crear universidades
universities = University.create([
  { name: 'Universidad de Chile' },
  { name: 'Pontificia Universidad Católica de Chile' },
  { name: 'Universidad de Concepción' },
  { name: 'Universidad Técnica Federico Santa María' }
])

# Crear carreras para las universidades
degrees = Degree.create([
  { name: 'Ingeniería Civil', university: universities[0] },
  { name: 'Medicina', university: universities[1] },
  { name: 'Arquitectura', university: universities[2] },
  { name: 'Ingeniería Electrónica', university: universities[3] },
  # Agrega más carreras según sea necesario
])


puts 'Seeds ejecutadas con éxito!'