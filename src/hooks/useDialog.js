import { useState, useRef } from 'react'

export function useDialog() {
  const [dialog, setDialog] = useState(null)
  const resolveRef = useRef(null)

  function showConfirm(message, { confirmLabel = 'Confirm', title } = {}) {
    return new Promise(resolve => {
      setDialog({ type: 'confirm', message, confirmLabel, title })
      resolveRef.current = resolve
    })
  }

  function showAlert(message, { title } = {}) {
    return new Promise(resolve => {
      setDialog({ type: 'alert', message, title })
      resolveRef.current = resolve
    })
  }

  function handleConfirm() {
    setDialog(null)
    resolveRef.current?.(true)
  }

  function handleCancel() {
    setDialog(null)
    resolveRef.current?.(false)
  }

  return { dialog, showConfirm, showAlert, handleConfirm, handleCancel }
}
