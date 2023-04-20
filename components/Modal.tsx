import React, { useEffect } from 'react'

interface Props {
    children: React.ReactNode
    isVisible: boolean
}

const Modal = (props: Props) => {

  const { children, isVisible } = props

  const [showModal, setShowModal] = React.useState(false)
  const [fadeEffect, setFadeEffect] = React.useState('fade-out')

  const closeModal = () => {
    setFadeEffect('fade-out')
    setTimeout(() => {
      document.body.style.overflow = 'visible'
      setShowModal(false)
    }, 500)
    return
  }

  const openModal = () => {
    document.body.style.overflow = "hidden"

    setFadeEffect('fade-in')
    setShowModal(true)
  }

  useEffect(() => {
    if (isVisible) {
      openModal()
    } else {
      closeModal()
    }
  }, [isVisible])

  if (!showModal) return null
    
  return (
    <div className={`fixed inset-0  backdrop-blur-sm  bg-gray-500 bg-opacity-40 z-50 flex items-center justify-center`} style={{zIndex: 1000000}}>
      <div className={`${fadeEffect} bg-white w-11/12 md:w-1/2 lg:w-1/3 rounded-lg shadow-lg py-3 px-4`}>
      {/* render children */}
      {children}
      </div>
    </div>
  )
}

export default Modal