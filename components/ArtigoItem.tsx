import { Dispositivo } from "@/database/types";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  item: Dispositivo;
  busca: string;
  isSelected: boolean;
  algumSelecionado: boolean;
  onPress: (id: number, x: number, y: number) => void; // envia id + coordenadas para menu
};

function ArtigoItem({
  item,
  busca,
  isSelected,
  algumSelecionado,
  onPress,
}: Props) {

  const estilo = item.estilo as keyof typeof styles;
  const opacity = useRef(new Animated.Value(1)).current;

  // guarda layout do texto
  const [textLayout, setTextLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isSelected || !algumSelecionado ? 1 : 0.4,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelected, algumSelecionado]);

  const textoHighlight = useMemo(() => {
    if (!busca) return <Text>{item.texto}</Text>;

    const partes = item.texto.split(new RegExp(`(${busca})`, "i"));

    return partes.map((parte, index) => {
      const isMatch = parte.toLowerCase() === busca.toLowerCase();
      return (
        <Text key={index} style={isMatch ? styles.highlight : undefined}>
          {parte}
        </Text>
      );
    });
  }, [item.texto, busca]);

  return (
    <Pressable
      onPress={event => {
        // pega posição absoluta do Pressable
        const { pageX: px, pageY: py } = event.nativeEvent;

        // envia para abrir menu na base do texto
        onPress(item.id, px, py); 
      }}
    >
      <Animated.Text
        style={[styles[estilo], { opacity }]}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          setTextLayout({ width, height }); // guarda altura real do texto
        }}
      >
        {textoHighlight}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  normal: { fontSize: 18, textAlign: "justify", marginBottom: 15,},
  titulo: { fontWeight: "bold", textAlign: "center", fontSize: 18, marginBottom: 15,},
  subtitulo: { fontWeight: "bold", textAlign:"center", fontSize: 18, marginBottom: 15,},
  ementa: { fontWeight: "bold" },
  highlight: { backgroundColor: "yellow" },
});

export default memo(ArtigoItem);
