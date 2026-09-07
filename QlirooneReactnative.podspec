require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "QlirooneReactnative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  # Metadata only. This pod is never published to the CocoaPods trunk: it ships inside the npm
  # package, and the consuming app picks it up through React Native autolinking, which points
  # CocoaPods at node_modules via `:path` and never fetches `s.source`. The URL is the repository
  # this package is actually developed in — the previous value named the pre-rename GitHub repo
  # (qliro/qliroone-in-app-reactNative), which is not where this code lives any more.
  s.source       = { :git => "git@qliro.gitlab.host:web-app/qliro-one-sdks/qliro-one-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.frameworks = "WebKit", "SafariServices" 
  s.private_header_files = "ios/**/*.h"


  s.dependency "QliroOne", "3.0.0-rc.5"
  s.pod_target_xcconfig = {
  'DEFINES_MODULE' => 'YES',
  'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES'
  }
  install_modules_dependencies(s)

end
