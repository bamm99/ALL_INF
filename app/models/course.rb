class Course < ApplicationRecord
    mount_uploader :file, CourseFileUploader
end
