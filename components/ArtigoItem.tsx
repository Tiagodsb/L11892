import { Dispositivo } from "@/database/types";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Keyboard, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  item: Dispositivo;
  busca: string;
  isSelected: boolean;
  algumSelecionado: boolean;
  onPress: (id: number, x: number, y: number) => void;
};

function ArtigoItem({
  item,
  busca,
  isSelected,
  algumSelecionado,
  onPress,
}: Props) {
  // Validação segura do estilo
  const getEstiloSeguro = (estilo: string): keyof typeof styles => {
    const estilosValidos = ["normal", "titulo", "subtitulo", "ementa"];
    return estilosValidos.includes(estilo) 
      ? estilo as keyof typeof styles 
      : "normal";
  };

  const estilo = getEstiloSeguro(item.estilo);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isSelected || !algumSelecionado ? 1 : 0.4,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelected, algumSelecionado]);

  const textoHighlight = useMemo(() => {
    if (!busca) return <Text>{item.texto}</Text>;

    // Escapa caracteres especiais para regex seguro
    const termoEscapado = busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${termoEscapado})`, "i");
    const partes = item.texto.split(regex);

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
        const { pageX: px, pageY: py } = event.nativeEvent;
        onPress(item.id, px, py); 
        Keyboard.dismiss();
      }}
    >
      <Animated.Text
        style={[styles[estilo], { opacity }]}
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