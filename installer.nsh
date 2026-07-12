!macro customWelcomePage
  # Custom welcome page is handled by electron-builder
!macroend

!macro customInstall
  # Add registry entry for default browser capability
  WriteRegStr HKCU "Software\Cove Browser" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\Cove Browser" "Version" "1.0.0"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Cove Browser"
!macroend
