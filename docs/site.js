// Overworld site: the biome hotbar, its auto-tour and the copy buttons.
// Everything here is progressive: with JavaScript off the page shows Sakura Night and the commands as text.

(() => {
  'use strict'

  // Straight from plugins/overworld/hooks/biomes.ts and palettes.ts.
  // shades: surface-0..2, text primary, secondary, muted. glow: the accent as it reads on a black page.
  const BIOMES = [
    { id: 'sakura', title: 'Sakura Night', blurb: 'Pink · dark. Cherry trees under a pink moon, lanterns and drifting petals.', tint: '#150f14', op: 0.56, accent: '#f4a0c0', glow: '#f4a0c0', add: '#9ed6a6', del: '#ff8a8a', shades: ['#150f14', '#1c141a', '#241a21', '#f6eaf0', '#d6c3cd', '#b39fab'],
      alt: 'Sakura Night: cherry trees under a pink moon, swaying lanterns and drifting petals, a fox and a frog by a pond' },
    { id: 'meadow', title: 'Meadow', blurb: 'Green · light. A sunny morning in the plains, for the light mode people.', tint: '#f2f6f0', op: 0.62, accent: '#1f5e35', glow: '#8fd08a', add: '#1f5e35', del: '#9c2c24', shades: ['#eef3ec', '#f5f8f3', '#ffffff', '#17211a', '#3a4a3e', '#4b5a50'], light: true,
      alt: 'Meadow: a sunny morning in the plains, clouds drifting over green hills, a little house, a cat and a bee' },
    { id: 'desert', title: 'Desert Night', blurb: 'Gold · dark. Stars over the dunes, a temple, and a creeper near a cat.', tint: '#14110b', op: 0.56, accent: '#f0c060', glow: '#f0c060', add: '#9ed6a6', del: '#ff8a8a', shades: ['#14110b', '#1b170f', '#231e14', '#f5ecd9', '#d8cbb0', '#b5a88c'],
      alt: 'Desert Night: a starry sky over the dunes, a temple with candles, cacti, a creeper and a cat' },
    { id: 'aurora', title: 'Aurora', blurb: 'Mint · dark. Northern lights over the snowy taiga.', tint: '#0b1014', op: 0.56, accent: '#8fe8c0', glow: '#8fe8c0', add: '#a6e08a', del: '#ff8a8a', shades: ['#0b1014', '#10171c', '#162026', '#e8f3f2', '#c0d4d2', '#9db5b3'],
      alt: 'Aurora: northern lights rippling over snowy peaks, spruces and an igloo, a snow fox and a wolf in the snow' },
    { id: 'ocean', title: 'Ocean', blurb: 'Blue · dark. Sunbeams on the sea floor, a shipwreck and a glow squid.', tint: '#08111f', op: 0.56, accent: '#7ab8ff', glow: '#7ab8ff', add: '#8fd6a2', del: '#ff8a8a', shades: ['#08111f', '#0d1828', '#122033', '#e8f0fa', '#bfcde0', '#9db0c8'],
      alt: 'Ocean: sunbeams through the water, kelp, coral and a shipwreck on the sea floor, an axolotl and a glow squid' },
    { id: 'end', title: 'The End', blurb: 'Violet · dark. End cities, crystal pillars and a dragon passing over.', tint: '#0e0b16', op: 0.56, accent: '#c7aaff', glow: '#c7aaff', add: '#9ed6a6', del: '#f08a9a', shades: ['#0e0b16', '#14101f', '#1a1528', '#eeeaf7', '#c7bfdc', '#a59cbf'],
      alt: 'The End: glowing end city towers, crystal pillars, chorus plants, a dragon gliding past and two endermen' },
    { id: 'nether', title: 'Nether', blurb: 'Red · dark. A fortress bridge over lava, crimson fungi and a ghast.', tint: '#150c0b', op: 0.56, accent: '#ffa27a', glow: '#ffa27a', add: '#9ed69a', del: '#ff8a8a', shades: ['#150c0b', '#1d1110', '#251715', '#f3e9e6', '#d3c2bd', '#b5a099'],
      alt: 'Nether: a fortress bridge over lava falls, glowing crimson fungi, a ghast in the haze, a strider and a magma cube' },
    { id: 'deep', title: 'Deep Dark', blurb: 'Black · dark. An ancient city, soul lanterns and the warden. Shh.', tint: '#0a0b0c', op: 0.6, accent: '#5fd3c8', glow: '#5fd3c8', add: '#8fd6a2', del: '#f08a8a', shades: ['#0a0b0c', '#101213', '#16191b', '#e8ecec', '#bcc4c5', '#99a3a5'],
      alt: 'Deep Dark: an ancient city lit by soul lanterns and candles, sculk on the floor and the warden standing in the dark' },
  ]

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const root = document.documentElement

  // ------------------------------------------------------------ copy buttons

  const status = document.createElement('p')
  status.className = 'sr'
  status.setAttribute('role', 'status')
  document.body.appendChild(status)

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      let ok = false
      try { ok = document.execCommand('copy') } catch { ok = false }
      area.remove()
      return ok
    }
  }

  document.querySelectorAll('.copy').forEach(btn => {
    btn.hidden = false
    btn.setAttribute('aria-label', `Copy ${btn.dataset.copy}`)
    let timer
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy)
      btn.textContent = ok ? 'Copied' : 'Press ⌘C'
      btn.classList.toggle('is-done', ok)
      status.textContent = ok ? `Copied ${btn.dataset.copy}` : 'Copy failed, select the text and copy it'
      clearTimeout(timer)
      timer = setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done') }, 1800)
    })
  })

  // ------------------------------------------------------------ the biome picker

  const demo = document.getElementById('demo')
  const picker = document.querySelector('.picker')
  if (!demo || !picker) return

  const chips = [...picker.querySelectorAll('[role="radio"]')]
  const tooltip = picker.querySelector('.tooltip')
  const layers = [...demo.querySelectorAll('.layer')]
  const info = document.querySelector('.biome-info')
  const infoCopy = info.querySelector('.copy')
  picker.hidden = false

  let current = 'sakura'
  let ticket = 0

  const hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16)
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
  }

  function paint(b) {
    const [s0, s1, s2, ink, soft, muted] = b.shades
    const s = demo.style
    s.setProperty('--d-accent', b.accent)
    s.setProperty('--d-tint', hexA(b.tint, Math.min(0.86, b.op + 0.2)))
    s.setProperty('--d-s0', s0)
    s.setProperty('--d-s1', s1)
    s.setProperty('--d-s2', s2)
    s.setProperty('--d-ink', ink)
    s.setProperty('--d-soft', soft)
    s.setProperty('--d-muted', muted)
    s.setProperty('--d-add', b.add)
    s.setProperty('--d-del', b.del)
    s.setProperty('--d-edge', b.light ? 'rgba(0, 0, 0, .1)' : 'rgba(255, 255, 255, .09)')
    s.setProperty('--d-bubble', b.light ? 'rgba(255, 255, 255, .78)' : 'rgba(255, 255, 255, .08)')
    s.setProperty('--d-track', b.light ? 'rgba(0, 0, 0, .1)' : 'rgba(255, 255, 255, .12)')
    root.style.setProperty('--accent', b.glow)
  }

  function fillLayer(layer, b) {
    layer.replaceChildren()
    const source = document.createElement('source')
    source.media = '(prefers-reduced-motion: reduce)'
    source.srcset = `biomes/${b.id}-still.svg`
    const img = document.createElement('img')
    img.width = 1600
    img.height = 1000
    img.alt = b.alt
    img.src = `biomes/${b.id}.svg`
    layer.append(source, img)
    return img
  }

  async function show(id) {
    if (id === current) return
    const b = BIOMES.find(x => x.id === id)
    if (!b) return
    current = id
    const mine = ++ticket

    chips.forEach(c => {
      const on = c.dataset.id === id
      c.setAttribute('aria-checked', String(on))
      c.tabIndex = on ? 0 : -1
    })
    tooltip.textContent = b.title
    tooltip.classList.remove('is-new')
    void tooltip.offsetWidth // restart the little pop
    tooltip.classList.add('is-new')
    demo.dataset.biome = id
    demo.querySelectorAll('[data-title]').forEach(el => { el.textContent = b.title })
    info.querySelector('[data-title]').textContent = b.title
    info.querySelector('[data-blurb]').textContent = b.blurb
    info.querySelector('[data-cmd]').textContent = `/overworld ${b.id}`
    infoCopy.dataset.copy = `/overworld ${b.id}`
    infoCopy.setAttribute('aria-label', `Copy /overworld ${b.id}`)

    const on = layers.find(l => l.classList.contains('is-on'))
    const next = layers.find(l => l !== on)
    const img = fillLayer(next, b)
    try { await img.decode() } catch { /* show it anyway */ }
    if (mine !== ticket) return

    paint(b)
    next.classList.add('is-on')
    next.removeAttribute('aria-hidden')
    on.classList.remove('is-on')
    on.setAttribute('aria-hidden', 'true')
    on.querySelector('img')?.setAttribute('alt', '')
  }

  // ------------------------------------------------------------ the auto-tour

  let tour = null
  let toured = !reduce.matches // false = the visitor took over, or asked for less motion
  let visible = false

  function stopTour() {
    clearInterval(tour)
    tour = null
  }
  function startTour() {
    if (tour || !toured || !visible || document.hidden || reduce.matches) return
    tour = setInterval(() => {
      const i = BIOMES.findIndex(b => b.id === current)
      show(BIOMES[(i + 1) % BIOMES.length].id)
    }, 6000)
  }

  function choose(chip, focus) {
    toured = false
    stopTour()
    if (focus) chip.focus()
    show(chip.dataset.id)
  }

  chips.forEach(chip => chip.addEventListener('click', () => choose(chip, false)))

  // Radio-group keys: arrows move along the hotbar (and wrap), Home/End jump to the ends, 1 to 8 pick a slot.
  picker.addEventListener('keydown', e => {
    const i = chips.indexOf(document.activeElement)
    if (i < 0) return
    let n = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % chips.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + chips.length) % chips.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = chips.length - 1
    else if (/^[1-8]$/.test(e.key)) n = Number(e.key) - 1
    if (n < 0) return
    e.preventDefault()
    choose(chips[n], true)
  })

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      visible ? startTour() : stopTour()
    }, { threshold: 0.35 }).observe(demo)
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stopTour() : startTour()))
  reduce.addEventListener?.('change', () => { if (reduce.matches) { toured = false; stopTour() } })
})()
