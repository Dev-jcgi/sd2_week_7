package sd2.vivo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Las preguntas de las actividades y los puntos de cada estudiante.
 * El servidor es quien califica: la respuesta correcta nunca viaja al celular antes de revelar.
 *
 * Formatos de pregunta (campo "formato"; "tipo" queda reservado para el tipo de mensaje):
 *   quiz / tf  → "respuesta" es un número (la opción elegida); "correcta" es un número
 *   classify   → "respuesta" es una lista con la categoría (índice de "bins") de cada tarjeta
 *   order      → "respuesta" es una lista con los índices de "opciones" en el orden elegido
 *   scale      → termómetro: un valor de 1 a 5 por tema; no tiene respuesta correcta ni puntos
 */
class Juego {
    static final int PUNTOS_ACIERTO = 500, PUNTOS_RAPIDEZ = 500;

    private final Map<String, JSONObject> preguntas = new LinkedHashMap<>();
    private final Map<String, Integer> puntos = new HashMap<>();
    private final Map<String, Double> notaUltima = new HashMap<>(); // 0..1 de la última pregunta revelada

    private JSONObject abierta;            // pregunta en curso (sin la respuesta)
    private long abiertaEn;
    private final Map<String, JSONArray> respuestas = new LinkedHashMap<>(); // nombre → respuesta (como lista)

    Juego(List<JSONObject> lista) { lista.forEach(p -> preguntas.put(p.getString("id"), p)); }

    synchronized JSONObject listaParaProfesor() {
        JSONArray arr = new JSONArray();
        preguntas.values().forEach(p -> arr.put(new JSONObject().put("id", p.getString("id"))
                .put("actividad", p.optInt("actividad", 1)).put("formato", tipo(p)).put("texto", p.getString("texto"))));
        return Mensajes.de("preguntas").put("lista", arr);
    }

    synchronized JSONObject lanzar(String id) {
        JSONObject p = preguntas.get(id);
        if (p == null) return null;
        respuestas.clear();
        notaUltima.clear();
        abiertaEn = System.currentTimeMillis();
        abierta = Mensajes.de("pregunta").put("id", id).put("actividad", p.optInt("actividad", 1)).put("formato", tipo(p))
                .put("texto", p.getString("texto")).put("opciones", p.getJSONArray("opciones"))
                .put("segundos", p.optInt("segundos", 20));
        if (p.has("bins")) abierta.put("bins", p.getJSONArray("bins"));
        if (p.has("lo")) abierta.put("lo", p.getString("lo")).put("hi", p.optString("hi"));
        return abierta;
    }

    synchronized JSONObject preguntaAbierta() { return abierta; }

    /** Cierra la pregunta en curso sin revelarla. */
    synchronized void cerrarPregunta() { abierta = null; respuestas.clear(); }

    /**
     * Guarda la primera respuesta válida de cada estudiante y suma sus puntos.
     * "valor" es un número (quiz, tf) o una lista (classify, order, scale). Devuelve true si se aceptó.
     */
    synchronized boolean responder(String nombre, String id, Object valor) {
        if (abierta == null || !abierta.getString("id").equals(id) || respuestas.containsKey(nombre)) return false;
        JSONObject p = preguntas.get(id);
        JSONArray r = normalizar(p, valor);
        if (r == null) return false;
        respuestas.put(nombre, r);
        double nota = nota(p, r);
        notaUltima.put(nombre, nota);
        if (nota > 0) {
            // Puntos: hasta 500 por acertar + hasta 500 por rapidez, en proporción a lo acertado.
            double segundos = p.optInt("segundos", 20);
            double usado = (System.currentTimeMillis() - abiertaEn) / 1000.0;
            double rapidez = Math.max(0, 1 - usado / segundos);
            sumar(nombre, (int) Math.round(nota * (PUNTOS_ACIERTO + PUNTOS_RAPIDEZ * rapidez)));
        }
        return true;
    }

    /** Revisa que la respuesta tenga la forma que pide el tipo de pregunta. Devuelve null si no es válida. */
    private static JSONArray normalizar(JSONObject p, Object valor) {
        int n = p.getJSONArray("opciones").length();
        switch (tipo(p)) {
            case "quiz", "tf" -> {
                if (!(valor instanceof Number num)) return null;
                int o = num.intValue();
                return o >= 0 && o < n ? new JSONArray().put(o) : null;
            }
            case "classify" -> {
                int bins = p.getJSONArray("bins").length();
                return listaDeEnteros(valor, n, 0, bins - 1);
            }
            case "order" -> {
                JSONArray r = listaDeEnteros(valor, n, 0, n - 1);
                if (r == null) return null;
                boolean[] visto = new boolean[n];
                for (int i = 0; i < n; i++) { if (visto[r.getInt(i)]) return null; visto[r.getInt(i)] = true; }
                return r;
            }
            case "scale" -> { return listaDeEnteros(valor, n, 1, 5); }
            default -> { return null; }
        }
    }

    private static JSONArray listaDeEnteros(Object valor, int largo, int min, int max) {
        if (!(valor instanceof JSONArray arr) || arr.length() != largo) return null;
        JSONArray r = new JSONArray();
        for (int i = 0; i < largo; i++) {
            if (!(arr.opt(i) instanceof Number num)) return null;
            int v = num.intValue();
            if (v < min || v > max) return null;
            r.put(v);
        }
        return r;
    }

    /** Qué tan correcta es una respuesta, de 0 a 1. El termómetro siempre da 0 (no suma puntos). */
    static double nota(JSONObject p, JSONArray r) {
        switch (tipo(p)) {
            case "quiz", "tf" -> { return r.getInt(0) == p.getInt("correcta") ? 1 : 0; }
            case "classify" -> {
                JSONArray ok = p.getJSONArray("correcta");
                int bien = 0;
                for (int i = 0; i < ok.length(); i++) if (r.getInt(i) == ok.getInt(i)) bien++;
                return (double) bien / ok.length();
            }
            case "order" -> {
                JSONArray ok = p.getJSONArray("correcta");
                for (int i = 0; i < ok.length(); i++) if (r.getInt(i) != ok.getInt(i)) return 0;
                return 1;
            }
            default -> { return 0; }
        }
    }

    synchronized JSONObject conteo(int conectados) {
        return Mensajes.de("conteo").put("id", abierta == null ? "" : abierta.getString("id"))
                .put("respondieron", respuestas.size()).put("conectados", conectados);
    }

    /** Cierra la pregunta y arma el resultado: la respuesta correcta y cómo respondió el grupo. */
    synchronized JSONObject revelar() {
        if (abierta == null) return null;
        String id = abierta.getString("id");
        JSONObject p = preguntas.get(id);
        int n = p.getJSONArray("opciones").length();
        JSONObject res = Mensajes.de("resultado").put("id", id).put("formato", tipo(p))
                .put("respuestas", respuestas.size()).put("explicacion", p.optString("explicacion"));
        switch (tipo(p)) {
            case "quiz", "tf" -> {
                int[] votos = new int[n];
                respuestas.values().forEach(r -> votos[r.getInt(0)]++);
                res.put("correcta", p.getInt("correcta")).put("votos", new JSONArray(votos));
            }
            case "classify" -> {
                // Para cada tarjeta, cuántos la pusieron en la categoría correcta.
                JSONArray ok = p.getJSONArray("correcta");
                int[] aciertos = new int[n];
                respuestas.values().forEach(r -> { for (int i = 0; i < n; i++) if (r.getInt(i) == ok.getInt(i)) aciertos[i]++; });
                res.put("correcta", ok).put("aciertos", new JSONArray(aciertos));
            }
            case "order" -> {
                long bien = respuestas.values().stream().filter(r -> nota(p, r) == 1).count();
                res.put("correcta", p.getJSONArray("correcta")).put("bien", bien);
            }
            case "scale" -> {
                double[] suma = new double[n];
                respuestas.values().forEach(r -> { for (int i = 0; i < n; i++) suma[i] += r.getInt(i); });
                List<Double> promedios = new ArrayList<>();
                for (double s : suma) promedios.add(respuestas.isEmpty() ? 0 : Math.round(10 * s / respuestas.size()) / 10.0);
                res.put("promedios", new JSONArray(promedios));
            }
            default -> { }
        }
        abierta = null;
        return res;
    }

    /** Nota (0..1) del estudiante en la última pregunta revelada; null si no respondió. */
    synchronized Double notaDe(String nombre) { return notaUltima.get(nombre); }

    synchronized void sumar(String nombre, int pts) { puntos.merge(nombre, pts, Integer::sum); }

    synchronized int puntosDe(String nombre) { return puntos.getOrDefault(nombre, 0); }

    /** Lugar en el ranking (1 = primero); 0 si no tiene puntos. */
    synchronized int lugarDe(String nombre) {
        Integer mios = puntos.get(nombre);
        if (mios == null) return 0;
        return 1 + (int) puntos.values().stream().filter(p -> p > mios).count();
    }

    synchronized JSONObject ranking(int max) {
        JSONArray top = new JSONArray();
        puntos.entrySet().stream().sorted((a, b) -> b.getValue() - a.getValue()).limit(max)
                .forEach(e -> top.put(new JSONObject().put("nombre", e.getKey()).put("puntos", e.getValue())));
        return Mensajes.de("ranking").put("top", top);
    }

    synchronized void reiniciar() { puntos.clear(); notaUltima.clear(); respuestas.clear(); abierta = null; }

    private static String tipo(JSONObject p) { return p.optString("formato", "quiz"); }
}
