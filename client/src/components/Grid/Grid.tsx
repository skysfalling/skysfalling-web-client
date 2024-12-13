import React, { ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  gap?: [number, number];
  itemSize?: [number, number];
  gridWidthBounds?: [number, number];
}

function Grid({
  children,
  gap = [8, 16],
  itemSize = [300, 100],
  gridWidthBounds = [100, 1200],
}: GridProps) {
  // ================ << CONTAINER STYLE >> ================ //
  const containerStyle: React.CSSProperties = {
    display: "flex",
    position: "relative",
    justifyContent: "center",

    // ( Size ) --------- >>
    inlineSize: `100%`,
    blockSize: `100%`,

    boxSizing: "border-box",
  };

  // ================ << GRID STYLE >> ================ //
  const gridStyle: React.CSSProperties = {
    display: "grid",
    position: "relative",
    justifyItems: "center",

    // ( Size ) --------- >>
    inlineSize: `100%`,
    blockSize: `100%`,
    minInlineSize: `${gridWidthBounds[0]}px`,
    maxInlineSize: `${gridWidthBounds[1]}px`,

    // ( Gap ) --------- >>
    gridColumnGap: `${gap[0]}px`, // Horizontal gap
    gridRowGap: `${gap[1]}px`, // Vertical gap

    // ( Template ) --------- >>
    gridTemplateColumns: `repeat(auto-fill, minmax(${itemSize[0]}px, 1fr))`,
  };

  // ================ << ITEM STYLE >> ================ //
  const itemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",

    // ( Size ) --------- >>
    inlineSize: `${itemSize[0]}px`,
    blockSize: `${itemSize[1]}px`,

    
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {React.Children.map(children, (child) => (
          <div
            style={itemStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Grid };
