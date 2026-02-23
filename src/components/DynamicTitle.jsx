import { useEffect, useState, useRef } from 'react'

const verbs = ['DESIGNING', 'BUILDING', 'DEPLOYING', 'DRAWING', 'DANCING', 'MAKING MUSIC']

function DynamicTitle() {
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    // Clear any existing intervals/timeouts
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const currentVerb = verbs[currentVerbIndex]
    
    // Type out the verb
    let charIndex = 0
    
    intervalRef.current = setInterval(() => {
      if (charIndex < currentVerb.length) {
        setDisplayText(currentVerb.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(intervalRef.current)
        
        // Wait a bit before deleting
        timeoutRef.current = setTimeout(() => {
          // Start deleting
          let deleteIndex = currentVerb.length
          
          intervalRef.current = setInterval(() => {
            if (deleteIndex > 0) {
              setDisplayText(currentVerb.slice(0, deleteIndex - 1))
              deleteIndex--
            } else {
              clearInterval(intervalRef.current)
              
              // Move to next verb after deletion is complete
              timeoutRef.current = setTimeout(() => {
                setCurrentVerbIndex((prev) => (prev + 1) % verbs.length)
              }, 200) // Brief pause before next word
            }
          }, 50) // Faster deletion speed
        }, 2000) // Show full word for 2 seconds before deleting
      }
    }, 100) // Typing speed

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentVerbIndex])


  return (
    <span ref={textRef} className="font-light inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default DynamicTitle
