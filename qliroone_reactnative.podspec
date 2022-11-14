# qliroone_reactnative.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "qliroone_reactnative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  qliroone_reactnative
                   DESC
  s.homepage     = "https://github.com/swacedigital/qliroone_reactnative"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/swacedigital/qliroone_reactnative.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "QliroOne", "2.1.1"
end

