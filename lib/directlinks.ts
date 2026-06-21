// Direct Links de Monetag
export const DIRECT_LINKS = {
  principal: 'https://omg10.com/4/11182135',
}

// Abre el direct link en nueva pestaña
export function abrirAnuncio() {
  window.open(DIRECT_LINKS.principal, '_blank', 'noopener')
}
