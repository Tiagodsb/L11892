import ArtigoItem from "@/components/ArtigoItem";
import { Dispositivo } from "@/database/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  Ionicons.loadFont();
  const db = useSQLiteContext();

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [menuVisible, setMenuVisible] = useState<{id: number, x: number, y: number} | null>(null);

  useEffect(() => {
    async function carregarDispositivos() {
      const response = await db.getAllAsync("SELECT * FROM dispositivos");
      setDispositivos(response as Dispositivo[]);
    }
    carregarDispositivos();
  }, [db]);

  const dispositivosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return dispositivos.filter(d => d.texto.toLowerCase().includes(termo));
  }, [busca, dispositivos]);

  const limparSelecao = useCallback(() => {
    setSelecionadoId(null);
    setMenuVisible(null);
  }, []);

  const handlePress = (id: number, x: number, y: number) => {
    setSelecionadoId(id);
    setMenuVisible({ id, x, y });
  };

  const renderItem = useCallback(
    ({ item }: { item: Dispositivo }) => (
      <ArtigoItem
        item={item}
        busca={busca}
        isSelected={item.id === selecionadoId}
        algumSelecionado={selecionadoId !== null}
        onPress={handlePress} // envia id + coordenadas
      />
    ),
    [busca, selecionadoId]
  );

  return (
    <View style={styles.container}>
      {/* Busca */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.busca}
          value={busca}
          placeholder="Faça uma busca na lei"
          onFocus={limparSelecao}
          onChangeText={text => { setBusca(text); setSelecionadoId(null); }}
        />
        <Pressable onPress={() => { 
              setBusca(""); 
              setSelecionadoId(null); 
            }}>
            <Ionicons name="close" size={25} color="gray" />
        </Pressable>
      </View>

      {/* Lista */}
      <FlatList
        data={dispositivosFiltrados}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nada encontrado</Text>}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        onScrollBeginDrag={limparSelecao}
      />

      {/* Menu Contextual */}
      {menuVisible && (
        <View style={{
          position: "absolute",
          top: menuVisible.y,
          left: menuVisible.x,
          backgroundColor: "#fff",
          borderRadius: 6,
          padding: 10,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          flexDirection: "row",
          gap:10
        }}>
            <Pressable onPress={() => {
              const artigo = dispositivos.find(d => d.id === menuVisible.id);
              if (artigo) Clipboard.setStringAsync(artigo.texto);
              limparSelecao();
            }}>

            <Ionicons name="copy-outline" size={24} color={"black"}/>
          </Pressable>
          <Pressable onPress={()=>limparSelecao()}>
            <Ionicons name="close-circle-outline" size={24} color={"black"}/>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  buscaContainer: { flexDirection: "row", alignItems: "center", justifyContent:"space-between", borderWidth:1, borderColor:"gray", borderRadius:6, marginBottom: 15 },
  busca: { fontSize:16, flex:1 },
  lista: { marginTop: 15 },
});
