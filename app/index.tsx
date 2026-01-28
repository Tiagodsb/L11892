import { Dispositivo } from "@/database/types";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");

  const db = useSQLiteContext();

  useEffect(() => {
    async function carregarDispositivos() {
      const response = await db.getAllAsync("SELECT * FROM dispositivos");
      setDispositivos(response as Dispositivo[]);
    }
    carregarDispositivos();
  }, []);
  
  function highlightText(texto: string, busca: string) {
    if (!busca) return <Text>{texto}</Text>;

    const regex = new RegExp(`(${busca})`, "gi"); // 'gi' = case insensitive
    const partes = texto.split(regex);

    return partes.map((parte, index) => 
      regex.test(parte) ? (
        <Text key={index} style={{ backgroundColor: "yellow" }}>{parte}</Text>
      ) : (
        <Text key={index}>{parte}</Text>
      )
    );
  }

  const buscarDispositivos = dispositivos.filter(dispositivo => 
    dispositivo.texto.toLocaleLowerCase().includes(busca.toLocaleLowerCase()));

  return (
    <View style={styles.container}>
      <TextInput style={styles.busca} value={busca} onChangeText={setBusca} placeholder="Faça uma busca na lei"/>
      <ScrollView>
        {buscarDispositivos.length > 0 ? (buscarDispositivos.map(d => {

          const estilo = d.estilo as keyof typeof styles;
          const isSelected = d.id === selecionadoId;
          const algumSelecionado = selecionadoId !== null;

          return <Pressable key={d.id} onPress={() => {
              if(algumSelecionado && selecionadoId === d.id) {
                setSelecionadoId(null);
                return;
              }
              setSelecionadoId(d.id)
            }}>
              <Text 
                selectable 
                style={[styles[estilo], 
                  {opacity: isSelected ? 1 : algumSelecionado ? 0.4 : 1}]}
                >{highlightText(d.texto, busca)}</Text>
            </Pressable>
        
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