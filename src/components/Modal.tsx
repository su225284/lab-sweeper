import type { ReactNode } from 'react'
import Button from './Button'

type ModalProps = {
  title: string
  children: ReactNode
  onClose: () => void
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="modal-x-button"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>

        <h2 className="modal-title">{title}</h2>

        {children}

        <Button variant="secondary" onClick={onClose}>
          閉じる
        </Button>
      </section>
    </div>
  )
}

export default Modal