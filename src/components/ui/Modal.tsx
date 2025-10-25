"use client"
import React from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children?: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full z-10 overflow-auto">
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
