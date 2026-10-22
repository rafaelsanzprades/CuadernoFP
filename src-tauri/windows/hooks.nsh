; Antes de copiar ficheros: cerrar el servidor interno (cuadernofp-backend.exe). Si una actualizacion lo deja abierto,
; mantiene cdd_pro.db y el propio .exe bloqueados y el instalador falla con «Error opening file for writing».
!macro NSIS_HOOK_PREINSTALL
  nsExec::Exec 'taskkill /F /T /IM cuadernofp-backend.exe'
  Sleep 800
!macroend
