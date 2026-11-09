package sd2.vivo;

import org.json.JSONObject;

/**
 * Todos los mensajes que el servidor envía. Cada uno es un JSON con un campo "tipo".
 * Tenerlos en un solo lugar es el "protocolo" de la aplicación: el cliente sabe qué esperar.
 */
final class Mensajes {
    private Mensajes() {}

    static JSONObject de(String tipo) { return new JSONObject().put("tipo", tipo); }

    static JSONObject bienvenida(String rol, String nombre, int conectados) {
        return de("bienvenida").put("rol", rol).put("nombre", nombre).put("conectados", conectados);
    }

    static JSONObject conectados(int total) { return de("conectados").put("total", total); }

    static JSONObject reaccion(String emoji, String de) { return de("reaccion").put("emoji", emoji).put("de", de); }

    /** Puntos totales y, después de revelar, la nota de la última pregunta (0..1; ausente si no respondió). */
    static JSONObject puntos(int total, Double nota) {
        JSONObject m = de("puntos").put("total", total);
        if (nota != null) m.put("nota", nota.doubleValue()).put("acerto", nota == 1.0);
        return m;
    }

    static JSONObject traza(String de, JSONObject mensaje) { return de("traza").put("de", de).put("mensaje", mensaje); }

    static JSONObject error(String texto) { return de("error").put("mensaje", texto); }
}
