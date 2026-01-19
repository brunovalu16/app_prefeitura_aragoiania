import HomeLastRequestCard from "../HomeLastRequestCard";
import { ListArea, ListScroll } from "./styles";

export default function HomeRequestsList({
  items = [],
  onPressItem,
  onMenuPressItem,
}) {
  return (
    <ListArea>
      <ListScroll showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <HomeLastRequestCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            status={item.status} // ✅ se vier, mostra
            onPress={() => onPressItem?.(item)}
            onMenuPress={() => onMenuPressItem?.(item)}
            // ✅ NÃO passa delete aqui (é lista genérica)
          />
        ))}
      </ListScroll>
    </ListArea>
  );
}
