import { useEffect, useRef, useState } from 'react'
import COUNTRIES, { flagUrl } from '../data/countries.js'

// A dropdown that shows each country's flag image next to its name.
// Plain <select><option> can't render images, so this is a small custom
// dropdown built to look and behave like the rest of the app's form fields.
export default function CountrySelect({ value, onChange, required }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  const selected = COUNTRIES.find((c) => c.name === value)

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="position-relative" ref={boxRef}>
      {/* Hidden input so the browser's native "required" validation still works */}
      <input type="text" value={value} required={required} readOnly tabIndex={-1} className="visually-hidden" />

      <button
        type="button"
        className="form-control d-flex align-items-center justify-content-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="d-flex align-items-center gap-2">
          {selected ? (
            <>
              <img src={flagUrl(selected.code)} alt="" width={20} height={15} style={{ objectFit: 'cover', borderRadius: 2 }} />
              <span>{selected.name}</span>
            </>
          ) : (
            <span className="text-muted">Select your country</span>
          )}
        </span>
        <span className="small text-muted">▾</span>
      </button>

      {open && (
        <ul
          className="list-unstyled border rounded-3 bg-white shadow-sm position-absolute w-100 mt-1 p-1"
          style={{ maxHeight: 220, overflowY: 'auto', zIndex: 20 }}
        >
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 rounded-2"
                onClick={() => {
                  onChange(c.name)
                  setOpen(false)
                }}
              >
                <img src={flagUrl(c.code)} alt="" width={20} height={15} style={{ objectFit: 'cover', borderRadius: 2 }} />
                <span>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
