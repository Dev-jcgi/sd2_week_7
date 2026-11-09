package sd2.vivo;

import java.net.InetSocketAddress;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.exceptions.InvalidDataException;
import org.java_websocket.framing.CloseFrame;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.handshake.ServerHandshakeBuilder;
import org.java_websocket.server.WebSocketServer;
import org.json.JSONObject;

/**
 * Clase en vivo: servidor WebSocket de la sesión (DS2 · Semana 7).
 *
 * Cada celular se conecta UNA vez (QR → #/vivo) y por esa conexión le llegan todas las preguntas.
 * El profesor entra con su clave (#/profesor), lanza y revela las preguntas, y al final cierra la sesión.
 * La librería llama por nosotros a onOpen, onMessage, onClose y onError.
 */
public class ClaseServer extends WebSocketServer {

    /** Tamaño máximo de un mensaje: 16 KB. Uno más grande se cierra con el código 1009. */
    static final int MAX_BYTES = 16 * 1024;
    /** Si un cliente no responde el ping en 30 s, se da por perdido. */
    static final int LATIDO_SEGUNDOS = 30;

    private final Set<String> origenesPermitidos;
    private final String claveProfesor;
    final Juego juego;

    public ClaseServer(int puerto, String claveProfesor, Set<String> origenesPermitidos, List<JSONObject> preguntas) {
        super(new InetSocketAddress(puerto), List.<Draft>of(new Draft_6455(Collections.emptyList(), MAX_BYTES)));
        this.claveProfesor = claveProfesor;
        this.origenesPermitidos = origenesPermitidos;
        this.juego = new Juego(preguntas);
        setConnectionLostTimeout(LATIDO_SEGUNDOS); // ping/pong automático (latido)
        setReuseAddr(true);
    }

    /* ─────────── Handshake: revisar el Origin antes de aceptar la conexión ─────────── */
    @Override
    public ServerHandshakeBuilder onWebsocketHandshakeReceivedAsServer(
            WebSocket conn, Draft draft, ClientHandshake request)
            throws InvalidDataException {
        String origen = request.getFieldValue("Origin");
        // Una página ajena no puede abrir una conexión en nombre del estudiante.
        if (!origen.isEmpty() && !origenesPermitidos.isEmpty() && !origenesPermitidos.contains(origen)) {
            Log.info("Rechazado: origen no permitido " + origen);
            throw new InvalidDataException(CloseFrame.POLICY_VALIDATION, "Origen no permitido");
        }
        return super.onWebsocketHandshakeReceivedAsServer(conn, draft, request);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        conn.setAttachment(new Cliente()); // todavía anónimo: debe presentarse con "hola"
        Log.info("Conexión abierta desde " + conn.getRemoteSocketAddress());
    }

    @Override
    public synchronized void onMessage(WebSocket conn, String texto) {
        Cliente cliente = conn.getAttachment();

        // Protección: máximo 15 mensajes por segundo por conexión.
        if (!cliente.limite.permitir()) {
            Log.info("Cerrada por exceso de mensajes: " + cliente.nombre);
            conn.close(CloseFrame.POLICY_VALIDATION, "Demasiados mensajes por segundo");
            return;
        }

        JSONObject msg;
        try {
            msg = new JSONObject(texto);
        } catch (Exception e) {
            enviar(conn, Mensajes.error("El mensaje no es JSON válido"));
            return;
        }
        String tipo = msg.optString("tipo");

        if (cliente.rol == Rol.ANONIMO && !tipo.equals("hola")) {
            enviar(conn, Mensajes.error("Primero envía {\"tipo\":\"hola\"}"));
            return;
        }

        switch (tipo) {
            case "hola" -> hola(conn, cliente, msg);
            case "reaccion" -> reaccion(cliente, msg);
            case "respuesta" -> responder(cliente, msg);
            // Solo el profesor:
            case "lanzar", "revelar", "ranking", "reiniciar", "finalizar" -> {
                if (cliente.rol != Rol.PROFESOR) { enviar(conn, Mensajes.error("Solo el profesor puede hacer eso")); return; }
                profesor(tipo, msg);
            }
            default -> enviar(conn, Mensajes.error("Tipo de mensaje desconocido: " + tipo));
        }
    }

    @Override
    public void onClose(WebSocket conn, int codigo, String razon, boolean remoto) {
        Cliente cliente = conn.getAttachment();
        Log.info("Cerrada (" + codigo + " " + razon + "): " + (cliente == null ? "?" : cliente.nombre));
        broadcast(Mensajes.conectados(contarEstudiantes()));
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        Log.info("Error: " + ex.getMessage());
    }

    @Override
    public void onStart() {
        Log.info("Clase en vivo escuchando en el puerto " + getPort());
    }

    /* ─────────── lo que hace cada tipo de mensaje ─────────── */

    private void hola(WebSocket conn, Cliente cliente, JSONObject msg) {
        if ("profesor".equals(msg.optString("rol"))) {
            // La clave vive en una variable de entorno del servidor, nunca en el código.
            if (claveProfesor == null || claveProfesor.isBlank() || !claveProfesor.equals(msg.optString("clave"))) {
                conn.close(CloseFrame.POLICY_VALIDATION, "Clave incorrecta");
                return;
            }
            cliente.rol = Rol.PROFESOR;
            cliente.nombre = "Profesor";
            enviar(conn, Mensajes.bienvenida("profesor", cliente.nombre, contarEstudiantes()));
            enviar(conn, juego.listaParaProfesor());
            enviar(conn, juego.ranking(10));
        } else {
            String nombre = limpiar(msg.optString("nombre"));
            if (nombre.isEmpty()) { enviar(conn, Mensajes.error("Escribe un nombre")); return; }
            cliente.rol = Rol.ESTUDIANTE;
            cliente.nombre = nombre;
            enviar(conn, Mensajes.bienvenida("estudiante", nombre, contarEstudiantes()));
            enviar(conn, Mensajes.puntos(juego.puntosDe(nombre), null));
            // Si entra (o se reconecta) a mitad de una pregunta, se pone al día.
            if (juego.preguntaAbierta() != null) enviar(conn, juego.preguntaAbierta());
        }
        broadcast(Mensajes.conectados(contarEstudiantes()));
        Log.info("Hola de " + cliente.nombre + " (" + cliente.rol + ")");
    }

    private static final Set<String> EMOJIS = Set.of("👍", "🔥", "🤯", "❓", "🚀");

    private void reaccion(Cliente cliente, JSONObject msg) {
        String emoji = msg.optString("emoji");
        if (EMOJIS.contains(emoji)) broadcast(Mensajes.reaccion(emoji, cliente.nombre));
    }

    private void responder(Cliente cliente, JSONObject msg) {
        if (cliente.rol != Rol.ESTUDIANTE) return;
        if (juego.responder(cliente.nombre, msg.optString("id"), msg.opt("valor"))) {
            enviarAProfesores(juego.conteo(contarEstudiantes()));
        }
    }

    private void profesor(String tipo, JSONObject msg) {
        switch (tipo) {
            case "lanzar" -> {
                JSONObject p = juego.lanzar(msg.optString("id"));
                if (p != null) { broadcast(p); enviarAProfesores(juego.conteo(contarEstudiantes())); }
            }
            case "revelar" -> {
                JSONObject r = juego.revelar();
                if (r == null) return;
                broadcast(r);
                // A cada estudiante, sus propios puntos y qué tan bien respondió.
                for (WebSocket c : getConnections()) {
                    Cliente k = c.getAttachment();
                    if (k != null && k.rol == Rol.ESTUDIANTE) enviar(c, Mensajes.puntos(juego.puntosDe(k.nombre), juego.notaDe(k.nombre)));
                }
                broadcast(juego.ranking(10));
            }
            case "ranking" -> broadcast(juego.ranking(10));
            case "reiniciar" -> { juego.reiniciar(); broadcast(juego.ranking(10)); }
            case "finalizar" -> finalizar();
            default -> { }
        }
    }

    /**
     * Fin de la sesión: manda a cada estudiante su resultado final y cierra su conexión con 1000
     * (cierre normal). Los puntos se borran para la siguiente sesión.
     */
    private void finalizar() {
        juego.cerrarPregunta();
        JSONObject ranking = juego.ranking(10);
        for (WebSocket c : getConnections()) {
            Cliente k = c.getAttachment();
            if (k == null || k.rol != Rol.ESTUDIANTE) continue;
            enviar(c, Mensajes.de("fin").put("puntos", juego.puntosDe(k.nombre))
                    .put("lugar", juego.lugarDe(k.nombre)).put("top", ranking.getJSONArray("top")));
            c.close(CloseFrame.NORMAL, "Clase terminada");
        }
        enviarAProfesores(Mensajes.de("fin").put("top", ranking.getJSONArray("top")));
        Log.info("Sesión finalizada por el profesor");
        juego.reiniciar();
    }

    /* ─────────── utilidades ─────────── */

    void broadcast(JSONObject msg) { broadcast(msg.toString()); }

    void enviar(WebSocket conn, JSONObject msg) { if (conn.isOpen()) conn.send(msg.toString()); }

    private void enviarAProfesores(JSONObject msg) {
        for (WebSocket c : getConnections()) {
            Cliente k = c.getAttachment();
            if (k != null && k.rol == Rol.PROFESOR) enviar(c, msg);
        }
    }

    int contarEstudiantes() {
        int n = 0;
        for (WebSocket c : getConnections()) {
            Cliente k = c.getAttachment();
            if (c.isOpen() && k != null && k.rol == Rol.ESTUDIANTE) n++;
        }
        return n;
    }

    /** Sin etiquetas HTML, sin espacios de sobra y máximo 20 caracteres. */
    static String limpiar(String s) {
        String t = s.replaceAll("[<>\"'&]", "").strip().replaceAll("\\s+", " ");
        return t.length() > 20 ? t.substring(0, 20) : t;
    }

    public static void main(String[] args) throws Exception {
        int puerto = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        String clave = System.getenv("PROFESOR_CLAVE");
        Set<String> origenes = Arrays.stream(System.getenv().getOrDefault("ORIGENES_PERMITIDOS", "").split(","))
                .map(String::strip).filter(s -> !s.isEmpty()).collect(Collectors.toSet());
        if (clave == null || clave.isBlank()) Log.info("AVISO: falta la variable PROFESOR_CLAVE; nadie podrá entrar como profesor.");
        if (origenes.isEmpty()) Log.info("AVISO: ORIGENES_PERMITIDOS vacío; se acepta cualquier origen (solo para desarrollo).");
        new ClaseServer(puerto, clave, origenes, Preguntas.cargar()).start();
    }
}
