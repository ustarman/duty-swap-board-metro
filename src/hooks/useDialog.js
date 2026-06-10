import { useState, useRef } from 'react'

export function useDialog() {
  const [dialog, setDialog] = useState(null)
  const [inputValue, setInputValue] = useState('')
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

  function showInput(message, { confirmLabel = 'Submit', title, placeholder = '' } = {}) {
    return new Promise(resolve => {
      setInputValue('')
      setDialog({ type: 'input', message, confirmLabel, title, placeholder })
      resolveRef.current = resolve
    })
  }

  function handleConfirm() {
    const value = dialog?.type === 'input' ? inputValue.trim() : true
    setDialog(null)
    setInputValue('')
    resolveRef.current?.(value)
  }

  function handleCancel() {
    setDialog(null)
    setInputValue('')
    resolveRef.current?.(false)
  }

  return { dialog, inputValue, setInputValue, showConfirm, showAlert, showInput, handleConfirm, handleCancel }
}
