import { Dispositivo } from "@/database/types";
import Ionicons from '@expo/vector-icons/Ionicons';
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
      <View style={styles.buscaContainer}>
        <TextInput 
          style={styles.busca} 
          value={busca} 
          onChangeText={setBusca} 
          placeholder="Faça uma busca na lei"/>
        <Pressable 
          style={styles.buscaBtn} 
          onPress={() => { setBusca("");}}>
          <Ionicons name="close" size={25} color="gray"/>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll}>
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
    fontSize: 16,
    flex: 1
  }, 
  buscaContainer: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent:"space-between",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 6
  },
  buscaBtn: {
  },
  scroll: {
    marginTop: 15,
  }
})