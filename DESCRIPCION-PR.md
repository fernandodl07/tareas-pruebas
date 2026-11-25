## Semana 15 · Calidad y pruebas

```
T+ L+ U+ I+ C+ M+ E+   bd99473a7be6   2026-11-25 02:28 UTC
```

- Captura de `pnpm pruebas` en verde: _(pegar)_
- Captura de `pnpm mutantes` con 6 de 6: _(pegar)_
- GitHub Actions en verde: _(pegar enlace)_

### Los seis errores

1. **`diasEntre`** sumaba `+ 1` y contaba también el último día; lo delató «cuenta el primer día y no cuenta el último» (esperaba 30, recibía 31).
2. **`aplicarCupon`** restaba el descuento sin piso en cero, así que un cupón fijo más grande que la factura dejaba el cobro en negativo; lo delató «nunca deja el cobro en negativo» (esperaba 0, recibía −3000).
3. **`calcularTotal`** calculaba el IVA sobre el subtotal y descontaba el cupón después, cuando debe descontar primero y cobrar IVA sobre lo que de verdad se paga; lo delataron «con cupón de porcentaje, el desglose completo cuadra» y «el IVA se calcula sobre lo que de verdad se cobra» (la de solo el total pasaba en verde).
4. **`suscripcionesActivas`** no filtraba por `estado = 'activa'` y devolvía también las canceladas y morosas; lo delató «devuelve solo las activas del equipo» (esperaba 1 fila, recibía 3).
5. **`canjearCupon`** leía el cupo con un `SELECT` y escribía después con un `UPDATE`, y en medio se colaban los demás; ahora es un solo `UPDATE … WHERE usos < limite_usos RETURNING` dentro de una transacción con el `INSERT` del canje; lo delató «respeta el límite cuando llegan diez al mismo tiempo» (esperaba 3 canjes, dejaba pasar más).
6. **`app/checkout/page.tsx`** mostraba como total `subtotal + iva`, ignorando el descuento, aunque el servidor cobraba bien `desglose.total`; lo delató el E2E «el total que ve el cliente es el total que se le cobra» (esperaba Q212.80, veía Q262.80).

### Lo que escribí yo

- `pruebas/unidad/cupones.test.ts`: once pruebas, una por regla y por cada borde (dos letras, cinco dígitos, el instante exacto del vencimiento, el último uso disponible, minúsculas, espacios). Cada rechazo compara también la `razon`, no solo `ok: false`.
- `e2e/cupon-rechazado.spec.ts`: los tres casos (vencido, agotado, formato), cada uno revisa el mensaje y que el desglose quede en Q240.00 / −Q0.00 / Q28.80 / Q268.80.
