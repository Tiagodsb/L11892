import { Dispositivo } from "@/database/types";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [busca, setBusca] = useState("");

  const db = useSQLiteContext();

  useEffect(() => {
    async function carregarDispositivos() {
      const response = await db.getAllAsync("SELECT * FROM dispositivos");
      setDispositivos(response as Dispositivo[]);
    }
    carregarDispositivos();
  }, []);
  
  const buscarDispositivos = dispositivos.filter(dispositivo => 
    dispositivo.texto.toLocaleLowerCase().includes(busca.toLocaleLowerCase()));

  return (
    <View style={styles.container}>
      <TextInput style={styles.busca} value={busca} onChangeText={setBusca} placeholder="Faça uma busca na lei"/>
      <ScrollView>
        {buscarDispositivos.length > 0 ? (buscarDispositivos.map(d => {
          const estilo = d.estilo as keyof typeof styles;
          return <Text selectable key={d.id} style={styles[estilo]}>{d.texto}</Text>
        })):(<Text>Nada encontrado</Text>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  normal: {
    fontSize: 18,
    textAlign: "justify",
    marginBottom: 15,
  },
  titulo: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    marginBottom: 15
  },
  subtitulo: {
    fontWeight: "bold",
    textAlign:"center",
    fontSize: 18,
    marginBottom: 15
  },
  ementa: {
    fontWeight: "bold"
  },
  container: {
    padding: 15,
  },
  paragrafo: {
    marginBottom: 15
  },
  revogado: {
    textDecorationLine: 'line-through'
  },
  busca: {
    borderWidth: 1,
    borderColor: "gray",
    width: "100%",
    marginBottom: 15,
    borderRadius: 6
  }
})