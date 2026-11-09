import { useEffect, useState } from 'react';

/* Las preguntas de la clase en vivo, en sus cinco formatos (quiz, tf, classify, order, scale).
   - Entrada: lo que ve y toca el estudiante en su celular.
   - Proyeccion: la pregunta en la pantalla del salón (sin la respuesta).
   - Resultado: la respuesta y cómo respondió el grupo, después de revelar.
   La respuesta correcta solo llega con el mensaje "resultado": el servidor califica. */
export const LETRAS = ['A', 'B', 'C', 'D', 'E'];
const TILE = ['tA', 'tB', 'tC', 'tD', 'tE'];
export const BIN_C = ['#15A26B', '#E8672E', '#0E9DB0', '#D9930F', '#7C5CE6'];
export const FORMATO = { quiz: 'Quiz', tf: 'Verdadero o falso', classify: 'Clasifica', order: 'Ordena', scale: 'Termómetro' };

export function useCuenta(desde, segundos) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setAhora(Date.now()), 250); return () => clearInterval(id); }, [desde]);
  return Math.max(0, Math.ceil(segundos - (ahora - desde) / 1000));
}

/** Celular: el estudiante arma su respuesta y la envía una sola vez. */
export function Entrada({ p, enviada, onEnviar }) {
  const n = p.opciones.length;
  const [r, setR] = useState(() => (p.formato === 'classify' ? Array(n).fill(-1) : p.formato === 'scale' ? Array(n).fill(0) : p.formato === 'order' ? [] : null));
  const [sel, setSel] = useState(0);
  const resta = useCuenta(p.recibidaEn, p.segundos);
  const bloqueado = enviada || resta === 0;
  const completo = p.formato === 'classify' ? r.every((x) => x > -1) : p.formato === 'scale' ? r.every((x) => x > 0) : p.formato === 'order' ? r.length === n : r != null;

  let cuerpo;
  if (p.formato === 'quiz' || p.formato === 'tf') {
    cuerpo = (
      <div className={`tiles ${n === 2 ? 'two' : ''}`}>
        {p.opciones.map((o, i) => (
          <button key={i} className={`tile ${TILE[i]} ${r === i ? 'picked' : enviada ? 'dim' : ''}`} disabled={bloqueado}
            onClick={() => { setR(i); onEnviar(i); }}><span className="L">{LETRAS[i]}</span><span>{o}</span></button>
        ))}
      </div>
    );
  } else if (p.formato === 'classify') {
    cuerpo = (
      <div className="cls-in">
        {!bloqueado && <p className="note mono">Toca una tarjeta y luego su categoría</p>}
        <div className="cls-cards">
          {p.opciones.map((o, i) => (
            <button key={i} className={`cls-card ${!bloqueado && sel === i ? 'sel' : ''}`} disabled={bloqueado} onClick={() => setSel(i)}
              style={r[i] > -1 ? { borderColor: BIN_C[r[i]] } : undefined}>
              <span>{o}</span>{r[i] > -1 && <em className="mono" style={{ background: BIN_C[r[i]] }}>{p.bins[r[i]]}</em>}
            </button>
          ))}
        </div>
        {!bloqueado && (
          <div className="cls-bins" style={{ gridTemplateColumns: `repeat(${p.bins.length}, minmax(0, 1fr))` }}>
            {p.bins.map((b, j) => <button key={b} style={{ background: BIN_C[j] }} onClick={() => {
              const nr = r.map((x, i) => (i === sel ? j : x)); setR(nr); const sig = nr.findIndex((x) => x === -1); if (sig > -1) setSel(sig);
            }}>{b}</button>)}
          </div>
        )}
      </div>
    );
  } else if (p.formato === 'order') {
    cuerpo = (
      <div className="order">
        {p.opciones.map((o, i) => {
          const pos = r.indexOf(i);
          return <button key={i} className={`ord ${pos > -1 ? 'on' : ''}`} disabled={bloqueado} onClick={() => !r.includes(i) && setR([...r, i])}>
            <span className="n">{pos > -1 ? pos + 1 : ''}</span><span>{o}</span></button>;
        })}
        {!bloqueado && r.length > 0 && <button className="btn ghost" onClick={() => setR([])}>Reiniciar orden</button>}
      </div>
    );
  } else {
    cuerpo = (
      <div className="scale-in">
        <p className="note mono">1 = {p.lo} · 5 = {p.hi}</p>
        {p.opciones.map((o, i) => (
          <div key={i} className="srow"><span>{o}</span>
            <div className="sbtns">{[1, 2, 3, 4, 5].map((v) => <button key={v} className={r[i] === v ? 'on' : ''} disabled={bloqueado}
              onClick={() => setR(r.map((x, j) => (j === i ? v : x)))} aria-label={`${o}: ${v}`}>{v}</button>)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="qcard pregunta">
      <div className="qhead"><span className="chip">Actividad {p.actividad} · {FORMATO[p.formato]}</span><span className="chip mono">{resta > 0 ? `${resta} s` : 'Tiempo'}</span></div>
      <h2 className="qtext">{p.texto}</h2>
      {cuerpo}
      {p.formato !== 'quiz' && p.formato !== 'tf' && !enviada && <button className="btn" disabled={!completo || resta === 0} onClick={() => onEnviar(r)}>Enviar respuesta</button>}
      {enviada && <p className="note center-t">Respuesta enviada. Espera a que el profesor la revele.</p>}
    </div>
  );
}

/** Proyector: la pregunta abierta, sin la respuesta. */
export function Proyeccion({ p, conteo, conectados }) {
  const resta = useCuenta(p.recibidaEn, p.segundos);
  let cuerpo;
  if (p.formato === 'quiz' || p.formato === 'tf') {
    cuerpo = <div className={`tiles ${p.opciones.length === 2 ? 'two' : ''}`}>{p.opciones.map((o, i) => <div key={i} className={`tile ${TILE[i]}`}><span className="L">{LETRAS[i]}</span><span>{o}</span></div>)}</div>;
  } else if (p.formato === 'classify') {
    cuerpo = (
      <>
        <div className="cls-cards">{p.opciones.map((o, i) => <div key={i} className="cls-card"><span>{o}</span></div>)}</div>
        <p className="cls-binsline">{p.bins.map((b, j) => <em key={b} className="mono" style={{ background: BIN_C[j] }}>{b}</em>)}</p>
      </>
    );
  } else if (p.formato === 'order') {
    cuerpo = <div className="order">{p.opciones.map((o, i) => <div key={i} className="ord"><span className="n" /><span>{o}</span></div>)}</div>;
  } else {
    cuerpo = <div className="scale-in"><p className="note mono">1 = {p.lo} · 5 = {p.hi}</p>{p.opciones.map((o) => <div key={o} className="srow"><span>{o}</span></div>)}</div>;
  }
  return (
    <div className="qcard big pregunta">
      <div className="qhead"><span className="chip">Actividad {p.actividad} · {FORMATO[p.formato]}</span><span className="chip mono">{resta > 0 ? `${resta} s` : 'Tiempo'}</span>
        <span className="chip mono">{conteo?.respondieron || 0}/{conectados} respondieron</span></div>
      <div className="timer"><i style={{ transform: `scaleX(${resta / p.segundos})` }} /></div>
      <h2 className="qtext">{p.texto}</h2>
      {cuerpo}
      <p className="note center-t">Responde en tu celular · {location.origin + location.pathname}#/vivo</p>
    </div>
  );
}

/** Después de revelar: la respuesta correcta y el resumen del grupo (proyector y celular). */
export function Resultado({ p, r, grande, previo }) {
  const n = r.respuestas;
  let cuerpo;
  if (r.formato === 'quiz' || r.formato === 'tf') {
    cuerpo = (
      <div className="dist">
        {p.opciones.map((o, i) => (
          <div key={i} className={`dbar ${i === r.correcta ? 'right' : ''}`}>
            <span className="mono">{LETRAS[i]}</span>
            <div className="tr"><i style={{ width: `${n ? (r.votos[i] * 100) / n : 0}%`, background: `var(--tile${LETRAS[i]})` }} /><span className="lbl">{o}</span></div>
            <span className="mono">{r.votos[i]}{i === r.correcta ? ' ✓' : ''}</span>
          </div>
        ))}
      </div>
    );
  } else if (r.formato === 'classify') {
    cuerpo = (
      <div className="cls-res">
        {p.opciones.map((o, i) => (
          <div key={i} className="cls-row"><span>{o}</span>
            <em className="mono" style={{ background: BIN_C[r.correcta[i]] }}>{p.bins[r.correcta[i]]}</em>
            <small className="mono">{n ? Math.round((r.aciertos[i] * 100) / n) : 0} % acertó</small></div>
        ))}
      </div>
    );
  } else if (r.formato === 'order') {
    cuerpo = (
      <div className="order">
        {r.correcta.map((i, k) => <div key={i} className="ord on"><span className="n">{k + 1}</span><span>{p.opciones[i]}</span></div>)}
        <p className="note mono">{r.bien} de {n} lo ordenaron perfecto</p>
      </div>
    );
  } else {
    cuerpo = (
      <div className="scale-in">
        {p.opciones.map((o, i) => (
          <div key={o} className="srow"><span>{o}{previo ? <small className="mono"> · al inicio: {previo[i]}</small> : ''}</span><b className="mono">{r.promedios[i]} / 5</b></div>
        ))}
      </div>
    );
  }
  return (
    <div className={`qcard ${grande ? 'big' : ''} reveal pregunta`}>
      <div className="qhead"><span className="chip">Actividad {p.actividad} · {FORMATO[r.formato]}</span><span className="chip mono">{n} respuestas</span></div>
      <h2 className="qtext small">{p.texto}</h2>
      {cuerpo}
      {r.explicacion && <p className="exp">{r.explicacion}</p>}
    </div>
  );
}
