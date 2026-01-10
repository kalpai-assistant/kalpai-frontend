import React from "react";
import { Image, Text, Box } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import styles from "./ImageCarousel.module.scss";

interface ImageCarouselProps {
  images: string[];
  messages?: string[];
  hoverTexts?: string[];
  initialSlide?: number;
  height?: string | number;
  withControls?: boolean;
  withIndicators?: boolean;
  withKeyboardEvents?: boolean;
  slideSize?: string | number;
  slideGap?: string | number;
  align?: "start" | "center" | "end";
  onClick?: (index: number) => void;
  style?: React.CSSProperties;
  getEmblaApi?: (embla: any) => void;
  onSlideChange?: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  messages = [],
  hoverTexts = [],
  initialSlide = 0,
  height = "100%",
  withControls = true,
  withIndicators = true,
  withKeyboardEvents = true,
  slideSize = "100%",
  slideGap = "md",
  align = "center",
  onClick,
  style,
  getEmblaApi,
  onSlideChange,
}) => {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    index: number,
  ) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    const messageDiv = document.createElement("div");
    messageDiv.className = styles.errorMessage;
    messageDiv.textContent = messages[index] || "No message available";
    target.parentNode?.insertBefore(messageDiv, target);
  };

  return (
    <Carousel
      initialSlide={initialSlide}
      slideSize={slideSize}
      height={height}
      withControls={withControls}
      withIndicators={withIndicators}
      withKeyboardEvents={withKeyboardEvents}
      slideGap={slideGap}
      align={align}
      style={style}
      getEmblaApi={getEmblaApi}
      onSlideChange={onSlideChange}
      controlSize={40}
      classNames={{
        controls: styles.controls,
        slide: styles.slide,
      }}
    >
      {images.map((url, index) => (
        <Carousel.Slide key={url} onClick={() => onClick?.(index)}>
          <Box className={styles.slideContent}>
            <Image
              src={url}
              alt="Content"
              className={styles.image}
              onError={(e) => handleImageError(e, index)}
            />
            {hoverTexts[index] && (
              <Text className={styles.hoverText}>{hoverTexts[index]}</Text>
            )}
          </Box>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default ImageCarousel;
