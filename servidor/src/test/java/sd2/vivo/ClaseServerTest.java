package sd2.vivo;

import static org.junit.jupiter.api.Assertions.*;

import java.net.ServerSocket;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletionException;

import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Pruebas de integración: levantan el servidor de verdad en un puerto libre
 * y se conectan como lo haría un navegador.
 */
class ClaseServerTest {
    static final String ORIGEN = "https://jcgi.lat";
    ClaseServer servidor;
    int puerto;

    @BeforeEach
    void arrancar() throws Exception {
        try (ServerSocket s = new ServerSocket(0)) { puerto = s.getLocalPort(); }
        List<JSONObject> preguntas = Preguntas.leer("""
            [{"id":"q","actividad":1,"formato":"quiz","segundos":20,"texto":"¿2+2?","opciones":["3","4"],"correcta":1,"explicacion":"Cuatro"},
             {"id":"c","actividad":1,"formato":"classify","segundos":30,"texto":"Clasifica","opciones":["a","b","c","d"],"bins":["X","Y"],"correcta":[0,1,0,1]},
             {"id":"o","actividad":2,"formato":"order","segundos":30,"texto":"Ordena","opciones":["2","3","1"],"correcta":[2,0,1]},
             {"id":"s","actividad":2,"formato":"scale","segundos":30,"texto":"Termómetro","opciones":["TDD","JaCoCo"],"lo":"nada","hi":"mucho"}]
            """);
        servidor = new ClaseServer(puerto, "secreta", Set.of(ORIGEN), preguntas);
        servidor.start();
        Thread.sleep(300);
    }

    @AfterEach
    void detener() throws Exception { servidor.stop(500); }

    ClientePrueba estudiante(String nombre) throws Exception {
        ClientePrueba c = ClientePrueba.conectar(puerto, ORIGEN);
        c.enviar("{\"tipo\":\"hola\",\"rol\":\"estudiante\",\"nombre\":\"" + nombre + "\"}");
        c.esperar("bienvenida");
        return c;
    }

    ClientePrueba profesor() throws Exception {
        ClientePrueba c = ClientePrueba.conectar(puerto, ORIGEN);
        c.enviar("{\"tipo\":\"hola\",\"rol\":\"profesor\",\"clave\":\"secreta\"}");
        c.esperar("bienvenida");
        return c;
    }

    /** Lanza una pregunta, el estudiante responde y el profesor revela. Devuelve el mensaje de puntos del estudiante. */
    JSONObject jugar(ClientePrueba prof, ClientePrueba est, String id, String valor) throws Exception {
        prof.enviar("{\"tipo\":\"lanzar\",\"id\":\"" + id + "\"}");
        est.esperar("pregunta");
        est.enviar("{\"tipo\":\"respuesta\",\"id\":\"" + id + "\",\"valor\":" + valor + "}");
        JSONObject conteo;
        do { conteo = prof.esperar("conteo"); } while (conteo.getInt("respondieron") == 0);
        prof.enviar("{\"tipo\":\"revelar\"}");
        est.esperar("resultado");
        return est.esperar("puntos");
    }

    @Test
    void unEstudianteRecibeBienvenidaYElConteo() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        assertEquals(1, ana.esperar("conectados").getInt("total"));
    }

    @Test
    void elProfesorRecibeLaListaDePreguntasSinRespuestas() throws Exception {
        JSONObject lista = profesor().esperar("preguntas");
        assertEquals(4, lista.getJSONArray("lista").length());
        assertFalse(lista.toString().contains("correcta"));
    }

    @Test
    void seRechazaUnOrigenDesconocido() {
        assertThrows(CompletionException.class, () -> ClientePrueba.conectar(puerto, "https://malicioso.example"));
    }

    @Test
    void unaClaveIncorrectaCierraConElCodigo1008() throws Exception {
        ClientePrueba c = ClientePrueba.conectar(puerto, ORIGEN);
        c.enviar("{\"tipo\":\"hola\",\"rol\":\"profesor\",\"clave\":\"otra\"}");
        assertEquals(1008, c.codigoDeCierre());
    }

    @Test
    void laRespuestaCorrectaNoViajaHastaRevelar() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        prof.enviar("{\"tipo\":\"lanzar\",\"id\":\"c\"}");
        JSONObject pregunta = ana.esperar("pregunta");
        assertFalse(pregunta.has("correcta"));
        assertEquals(2, pregunta.getJSONArray("bins").length());
    }

    @Test
    void unQuizCorrectoDaMasDe500Puntos() throws Exception {
        JSONObject puntos = jugar(profesor(), estudiante("Ana"), "q", "1");
        assertTrue(puntos.getBoolean("acerto"));
        assertTrue(puntos.getInt("total") > 500);
    }

    @Test
    void clasificarLaMitadDaLaMitadDeLaNota() throws Exception {
        JSONObject puntos = jugar(profesor(), estudiante("Ana"), "c", "[0,0,0,0]");
        assertEquals(0.5, puntos.getDouble("nota"));
        assertFalse(puntos.getBoolean("acerto"));
        assertTrue(puntos.getInt("total") >= 250 && puntos.getInt("total") <= 500);
    }

    @Test
    void ordenarSoloSumaSiTodoElOrdenEsCorrecto() throws Exception {
        ClientePrueba prof = profesor();
        assertEquals(0, jugar(prof, estudiante("Ana"), "o", "[0,2,1]").getInt("total"));
        assertTrue(jugar(prof, estudiante("Beto"), "o", "[2,0,1]").getInt("total") > 500);
    }

    @Test
    void unOrdenConRepetidosSeIgnora() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        prof.enviar("{\"tipo\":\"lanzar\",\"id\":\"o\"}");
        ana.esperar("pregunta");
        ana.enviar("{\"tipo\":\"respuesta\",\"id\":\"o\",\"valor\":[1,1,1]}");
        prof.enviar("{\"tipo\":\"revelar\"}");
        assertEquals(0, prof.esperar("resultado").getInt("respuestas"));
    }

    @Test
    void elTermometroDevuelvePromediosYNoDaPuntos() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        JSONObject puntos = jugar(prof, ana, "s", "[2,4]");
        assertEquals(0, puntos.getInt("total"));
        JSONObject r = prof.esperar("resultado");
        assertEquals(2.0, r.getJSONArray("promedios").getDouble(0));
        assertEquals(4.0, r.getJSONArray("promedios").getDouble(1));
    }

    @Test
    void unEstudianteNoPuedeLanzarPreguntas() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        ana.enviar("{\"tipo\":\"lanzar\",\"id\":\"q\"}");
        assertTrue(ana.esperar("error").getString("mensaje").contains("Solo el profesor"));
    }

    @Test
    void quienEntraAMitadDeUnaPreguntaLaRecibe() throws Exception {
        ClientePrueba prof = profesor();
        prof.enviar("{\"tipo\":\"lanzar\",\"id\":\"q\"}");
        prof.esperar("conteo");
        assertEquals("q", estudiante("Tarde").esperar("pregunta").getString("id"));
    }

    @Test
    void demasiadosMensajesCierranLaConexion() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        for (int i = 0; i < 30; i++) ana.enviar("{\"tipo\":\"reaccion\",\"emoji\":\"🚀\"}");
        assertEquals(1008, ana.codigoDeCierre());
    }

    @Test
    void alFinalizarCadaEstudianteRecibeSuResultadoYSeCierraCon1000() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        jugar(prof, ana, "q", "1");
        prof.enviar("{\"tipo\":\"finalizar\"}");
        JSONObject fin = ana.esperar("fin");
        assertEquals(1, fin.getInt("lugar"));
        assertTrue(fin.getInt("puntos") > 500);
        assertEquals(1000, ana.codigoDeCierre());
        prof.esperar("fin");
    }
}
