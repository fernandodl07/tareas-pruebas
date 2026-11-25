import { describe, it, expect } from 'vitest';
import { validarCupon, type CuponGuardado } from '../../lib/cupones';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const AHORA = d('2026-10-24');

/** Un cupón de catálogo, con lo que quieras cambiado encima. */
const guardado = (extra: Partial<CuponGuardado> = {}): CuponGuardado => ({
  codigo: 'USP-2026',
  tipo: 'porcentaje',
  valor: 50,
  venceEn: d('2026-12-31'),
  limiteUsos: 100,
  usos: 0,
  ...extra,
});

const CATALOGO = [guardado()];

describe('validarCupon', () => {
  // ── Esta te la regalo, para que veas la forma ──────────────────────────────
  it('acepta un código que existe y está vigente', () => {
    const r = validarCupon('USP-2026', CATALOGO, AHORA);
    expect(r.ok).toBe(true);
  });

  // ── De aquí para abajo te toca a ti ───────────────────────────────────────
  //
  // Escribe las pruebas que hagan falta para que `pnpm mutantes` te dé 6 de 6.
  // Pista: cada mutante rompe UNA regla. Si no tienes una prueba que mire esa
  // regla exacta, el mutante sobrevive.
  //
  // Las seis reglas están en el comentario de arriba de lib/cupones.ts.
  //
  // Un consejo de redacción: el nombre de la prueba debe decir la regla, no
  // la función. «rechaza un código con solo dos letras» sirve;
  // «prueba de validarCupon 3» no le sirve a nadie, ni a ti en tres semanas.

  it('rechaza un código con solo dos letras', () => {
    expect(validarCupon('US-2026', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'formato' });
  });

  it('rechaza un código con más de cuatro dígitos', () => {
    expect(validarCupon('USP-20261', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'formato' });
  });

  it('rechaza un código con menos de cuatro dígitos', () => {
    expect(validarCupon('USP-202', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'formato' });
  });

  it('rechaza un código bien formado que no está en el catálogo', () => {
    expect(validarCupon('ABC-1234', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'inexistente' });
  });

  it('rechaza un cupón cuya fecha ya pasó', () => {
    const catalogo = [guardado({ venceEn: d('2026-10-23') })];
    expect(validarCupon('USP-2026', catalogo, AHORA)).toEqual({ ok: false, razon: 'vencido' });
  });

  it('acepta el cupón en el instante exacto en que vence', () => {
    const catalogo = [guardado({ venceEn: AHORA })];
    const r = validarCupon('USP-2026', catalogo, AHORA);
    expect(r.ok).toBe(true);
  });

  it('rechaza un cupón que ya se usó tantas veces como su límite', () => {
    const catalogo = [guardado({ limiteUsos: 3, usos: 3 })];
    expect(validarCupon('USP-2026', catalogo, AHORA)).toEqual({ ok: false, razon: 'agotado' });
  });

  it('acepta un cupón al que todavía le queda un uso', () => {
    const catalogo = [guardado({ limiteUsos: 3, usos: 2 })];
    expect(validarCupon('USP-2026', catalogo, AHORA).ok).toBe(true);
  });

  it('acepta el código aunque venga en minúsculas', () => {
    const r = validarCupon('usp-2026', CATALOGO, AHORA);
    expect(r).toEqual({ ok: true, cupon: CATALOGO[0] });
  });

  it('acepta el código aunque venga con espacios en los extremos', () => {
    const r = validarCupon('  USP-2026\t ', CATALOGO, AHORA);
    expect(r).toEqual({ ok: true, cupon: CATALOGO[0] });
  });
});
