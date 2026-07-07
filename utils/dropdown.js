/**
 * Binds a toggle button to a dropdown menu. Closes on outside click or item select.
 */
export function bindDropdown(container, { toggleSelector, menuSelector, onSelect }) {
  const toggle = container.querySelector(toggleSelector)
  const menu = container.querySelector(menuSelector)
  if (!toggle || !menu) return

  const close = () => menu.classList.remove('is-open')

  toggle.addEventListener('click', (e) => {
    e.stopPropagation()
    menu.classList.toggle('is-open')
  })

  menu.querySelectorAll('[data-dropdown-action]').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation()
      onSelect?.(item.dataset.dropdownAction)
      close()
    })
  })

  document.addEventListener('click', close)
}
