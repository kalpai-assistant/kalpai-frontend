import React from "react";
import { Carousel } from "@mantine/carousel";
import { Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import DocumentPreview from "./DocumentPreview";
import { BusinessDocumentResponse } from "../../api/requests_responses/business";
import styles from "./Document.module.scss";

interface DocumentCarouselProps {
  documents: BusinessDocumentResponse[];
  height?: number;
  slideSize?: string;
  withControls?: boolean;
  withIndicators?: boolean;
  style?: React.CSSProperties;
  initialSlide?: number;
  onSlideChange?: (index: number) => void;
}

const DocumentCarousel: React.FC<DocumentCarouselProps> = ({
  documents,
  height = 350,
  slideSize = "100%",
  withControls = true,
  withIndicators = true,
  style = {},
  initialSlide = 0,
  onSlideChange,
}) => {
  return (
    <Box style={style}>
      <Carousel
        height={height}
        slideSize={slideSize}
        align="center"
        slidesToScroll={1}
        withControls={withControls}
        withIndicators={withIndicators}
        initialSlide={initialSlide}
        onSlideChange={onSlideChange}
        nextControlIcon={<IconChevronRight size={20} />}
        previousControlIcon={<IconChevronLeft size={20} />}
        styles={{
          control: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #e0e0e0",
            color: "#333",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
          },
          indicator: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            "&[data-active]": {
              backgroundColor: "#228be6",
            },
          },
        }}
      >
        {documents.map((document, index) => (
          <Carousel.Slide key={document.id}>
            <Box className={styles.carouselSlide}>
              <DocumentPreview
                fileUrl={document.file_s3_url}
                height={height - 40} // Leave space for metadata
              />
              <Box className={styles.carouselOverlay}>
                <Text size="sm" c="white" fw={500}>
                  {document.file_s3_url.split("/").pop() || "Document"}
                </Text>
                <Text size="xs" c="white" opacity={0.8}>
                  {new Date(document.created_time).toLocaleDateString()}
                </Text>
              </Box>
            </Box>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
};

export default DocumentCarousel;
