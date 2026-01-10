import { Flex, Title } from "@mantine/core";
import styles from "./Tile.module.scss";

interface TileProps {
  title: string;
  children: React.ReactNode;
}

export const Tile: React.FC<TileProps> = ({ children, title }) => (
  <Flex direction="column" justify="center" pb="sm" pt="sm">
    <Flex className={styles.tile}>
      <Title order={6}>{title}</Title>
      {children}
    </Flex>
  </Flex>
);
