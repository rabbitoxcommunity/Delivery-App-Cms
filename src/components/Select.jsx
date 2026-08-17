import ReactSelect from 'react-select'

/**
 * Shared react-select wrapper.
 *
 * Deliberately keeps the native <select> contract — a raw string `value` in,
 * a raw string out of `onChange` — so call sites keep their existing state
 * shape. react-select's own contract is `{value,label}` objects both ways,
 * and threading that through every screen would have meant rewriting state,
 * effects and submit handlers at 11 sites for no gain.
 *
 * `variant` covers the three looks already in the app:
 *   field — full-width form control (Add product/category, Staff, modals)
 *   pill  — compact toolbar filter (Products, Orders History)
 *   tone  — the coloured stock pill, whose colours track the value
 */

const BORDER = '#E4EADF'
const INK = '#37413A'
const MUTED = '#7B857F'
const GREEN = '#47BB1C'

const baseControl = {
  minHeight: 0,
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'border-color .15s ease',
}

function buildStyles({ variant, tone, invalid }) {
  const pill = variant === 'pill'
  const toned = variant === 'tone'

  return {
    control: (css_, state) => ({
      ...css_,
      ...baseControl,
      backgroundColor: toned ? tone?.bg : '#FFFFFF',
      borderColor: invalid ? '#E7998F' : state.isFocused ? GREEN : toned ? 'transparent' : BORDER,
      borderWidth: toned ? 0 : 1,
      borderRadius: toned ? 9 : pill ? 12 : 12,
      padding: toned ? '0 2px' : pill ? '2px 2px' : '4px 4px',
      fontSize: toned ? 12.5 : pill ? 14 : 15,
      fontWeight: 800,
      width: '100%',
    }),
    valueContainer: (css_) => ({ ...css_, padding: toned ? '2px 6px' : '6px 8px' }),
    singleValue: (css_) => ({
      ...css_,
      color: toned ? tone?.fg : INK,
      fontWeight: toned ? 800 : variant === 'field' ? 700 : 700,
    }),
    placeholder: (css_) => ({ ...css_, color: MUTED, fontWeight: 700 }),
    input: (css_) => ({ ...css_, color: INK, fontWeight: 700, margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (css_) => ({
      ...css_,
      color: toned ? tone?.fg : MUTED,
      padding: toned ? '2px 4px' : '4px 6px',
    }),
    clearIndicator: (css_) => ({ ...css_, color: MUTED, padding: '4px 2px' }),
    menu: (css_) => ({
      ...css_,
      borderRadius: 14,
      border: `1px solid ${BORDER}`,
      boxShadow: '0 12px 32px rgba(15,26,18,.12)',
      overflow: 'hidden',
      zIndex: 40,
      marginTop: 6,
      minWidth: 'max-content',
    }),
    // Menus live inside cards with overflow:auto (tables, modals); without a
    // portal the list is clipped by the card instead of floating over it.
    menuPortal: (css_) => ({ ...css_, zIndex: 9999 }),
    menuList: (css_) => ({ ...css_, padding: 6, maxHeight: 280 }),
    option: (css_, state) => ({
      ...css_,
      borderRadius: 9,
      padding: '10px 12px',
      fontSize: 14,
      fontWeight: state.isSelected ? 800 : 600,
      color: state.isSelected ? '#2E7A12' : INK,
      backgroundColor: state.isSelected ? '#E6F6DE' : state.isFocused ? '#F3F6F1' : 'transparent',
      cursor: 'pointer',
      ':active': { backgroundColor: '#E6F6DE' },
    }),
    noOptionsMessage: (css_) => ({ ...css_, fontSize: 13.5, fontWeight: 700, color: MUTED }),
  }
}

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  ariaLabel,
  variant = 'field',
  tone,
  invalid = false,
  isSearchable,
  isDisabled = false,
  isClearable = false,
  name,
  inputId,
}) {
  // Long lists (the category picker is ~90 rows) are the main reason for this
  // change, so searching is on by default once a list is big enough to warrant
  // it, and off for 2–4 option toggles where a text caret just looks odd.
  const searchable = isSearchable ?? options.length > 8

  const selected = options.find((o) => String(o.value) === String(value ?? '')) ?? null

  return (
    <ReactSelect
      inputId={inputId}
      name={name}
      aria-label={ariaLabel}
      value={selected}
      options={options}
      onChange={(opt) => onChange?.(opt ? opt.value : '')}
      placeholder={placeholder}
      isSearchable={searchable}
      isDisabled={isDisabled}
      isClearable={isClearable}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      menuPlacement="auto"
      styles={buildStyles({ variant, tone, invalid })}
      theme={(t) => ({ ...t, colors: { ...t.colors, primary: GREEN, primary25: '#F3F6F1' } })}
    />
  )
}
