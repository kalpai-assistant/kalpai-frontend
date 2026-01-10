import React from "react";
import { Tile } from "../../../utilComponents/Tile";
import { BarChart } from "@mantine/charts";
import { MantineColor } from "@mantine/core";

const BarColor: {
  PRIMARY_1: MantineColor;
  PRIMARY_2: MantineColor;
  SECONDARY: MantineColor;
  DANGER: MantineColor;
  SUCCESS: MantineColor;
} = {
  PRIMARY_1: "gray.4",
  PRIMARY_2: "gray.6",
  SECONDARY: "secondary",
  DANGER: "danger",
  SUCCESS: "green",
};

const InteractionsTrend: React.FC = () => {
  const data = [
    { month: "January", Total: 900, Unique: 200 },
    { month: "February", Total: 1200, Unique: 400 },
    { month: "March", Total: 1000, Unique: 200 },
    { month: "April", Total: 200, Unique: 800 },
    { month: "May", Total: 1400, Unique: 1200 },
    { month: "June", Total: 600, Unique: 1000 },
  ];
  return (
    <Tile title="Interactions Trend">
      <BarChart
        h={300}
        data={data}
        dataKey="month"
        withLegend
        legendProps={{ verticalAlign: "top", height: 50 }}
        series={[
          { name: "Total", color: BarColor.PRIMARY_1 },
          { name: "Unique", color: BarColor.PRIMARY_2 },
        ]}
      />
    </Tile>
  );
};

export default InteractionsTrend;
