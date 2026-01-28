import ArtigoItem from "@/components/ArtigoItem";
import { Dispositivo } from "@/database/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  Ionicons.loadFont();
  const db = useSQLiteContext();
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [menuVisible, setMenuVisible] = useState<{id: number, x: number, y: number} | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    async function carregarDispositivos() {
      try {
        const response = await db.getAllAsync("SELECT * FROM dispositivos");
        setDispositivos(response as Dispositivo[]);
      } catch (error) {
        console.error("Erro ao carregar dispositivos:", error);
      }
    }
    carregarDispositivos();
  }, [db]);

  const mostrarFeedbackCopiado = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
  }, [fadeAnim, scaleAnim]);

  const dispositivosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return dispositivos.filter(d => d.texto.toLowerCase().includes(termo));
  }, [busca, dispositivos]);

  const limparSelecao = useCallback(() => {
    setSelecionadoId(null);
    setMenuVisible(null);
  }, []);

  const handlePress = useCallback((id: number, x: number, y: number) => {
    setSelecionadoId(id);
    
    const menuWidth = 80; // Largura do menu
    const menuHeight = 60; // Altura aproximada do menu
    
    // Ajusta posição X (laterais)
    let adjustedX = x;
    if (x + menuWidth > screenWidth) {
      adjustedX = x - menuWidth;
    }
    // Garante que não fique muito à esquerda
    if (adjustedX < 10) {
      adjustedX = 10;
    }
    
    // Ajusta posição Y (parte inferior)
    let adjustedY = y;
    if (y + menuHeight > screenHeight - 50) { // -50 para margem de segurança
      // Se vai sair pela parte de baixo, mostra acima do clique
      adjustedY = y - menuHeight - 30; // 30 é a altura aproximada do item
    }
    
    setMenuVisible({ id, x: adjustedX, y: adjustedY });
  }, [screenWidth, screenHeight]);

  const copiarTexto = useCallback(async () => {
    if (!menuVisible) return;
    
    const artigo = dispositivos.find(d => d.id === menuVisible.id);
    if (artigo) {
      try {
        await Clipboard.setStringAsync(artigo.texto);
        mostrarFeedbackCopiado();
      } catch (error) {
        console.error("Erro ao copiar texto:", error);
      }
    }
    limparSelecao();
  }, [dispositivos, menuVisible, limparSelecao, mostrarFeedbackCopiado]);

  const renderItem = useCallback(
    ({ item }: { item: Dispositivo }) => (
      <ArtigoItem
        item={item}
        busca={busca}
        isSelected={item.id === selecionadoId}
        algumSelecionado={selecionadoId !== null}
        onPress={handlePress}
      />
    ),
    [busca, selecionadoId, handlePress]
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
          onChangeText={text => { 
            setBusca(text); 
            setSelecionadoId(null); 
            setMenuVisible(null);
          }}
        />
        <Pressable 
          onPress={() => { 
            setBusca(""); 
            setSelecionadoId(null);
            setMenuVisible(null);
          }}
          style={styles.buscaBotao}
        >
          <Ionicons name="close" size={25} color="gray" />
        </Pressable>
      </View>

      {/* Lista */}
      <FlatList
        data={dispositivosFiltrados}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nada encontrado</Text>}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        onScrollBeginDrag={limparSelecao}
        showsVerticalScrollIndicator={false}
      />

      {/* Menu Contextual */}
      {menuVisible && (
        <>
          <Pressable 
            style={styles.overlay}
            onPress={limparSelecao}
          />
          
          <View style={[
            styles.menuContainer,
            {
              top: menuVisible.y,
              left: menuVisible.x,
            }
          ]}>
            <Pressable 
              onPress={copiarTexto}
              style={styles.menuBotao}
            >
              <Ionicons name="copy-outline" size={24} color={"black"}/>
            </Pressable>
            <Pressable 
              onPress={limparSelecao}
              style={styles.menuBotao}
            >
              <Ionicons name="close-circle-outline" size={24} color={"black"}/>
            </Pressable>
          </View>
        </>
      )}

      {/* Notificação */}
      <Animated.View 
        style={[
          styles.notificacaoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
        pointerEvents="none"
      >
        <View style={styles.notificacao}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.notificacaoTexto}>Copiado</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  buscaContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    borderWidth: 1, 
    borderColor: "gray", 
    borderRadius: 6, 
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  busca: { 
    fontSize: 16, 
    flex: 1, 
    paddingVertical: 10,
  },
  buscaBotao: {
    padding: 4,
  },
  lista: { 
    marginTop: 15,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "row",
    gap: 10,
    zIndex: 1000,
  },
  menuBotao: {
    padding: 4,
  },
  notificacaoContainer: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    zIndex: 2000,
  },
  notificacao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: "center",
  },
  notificacaoTexto: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
});