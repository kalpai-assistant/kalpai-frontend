import { useQuery } from "react-query";
import { BusinessQueryNames } from "../../../../api/requests_responses/business";
import { businessChatLinkPath } from "../../../../api/business";
import { useRef, useState } from "react";
import {
  ActionIcon,
  CopyButton,
  Flex,
  Loader,
  Text,
  Tooltip,
} from "@mantine/core";
import { QRCodeCanvas } from "qrcode.react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { FaDownload } from "react-icons/fa";
import styles from "./BusinessQRCode.module.scss";
import jsPDF from "jspdf";
import { RefetchButton } from "../CommonUtils";

const QRCode: React.FC = () => {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [chatLink, setChatLink] = useState("");
  const { isLoading, refetch } = useQuery(
    BusinessQueryNames.CHAT_LINK_PATH,
    () => businessChatLinkPath(),
    {
      onSuccess: (data) => {
        if (data.data.chat_link_path)
          setChatLink(`${window.location.origin}${data.data.chat_link_path}`);
      },
      refetchOnWindowFocus: false,
    },
  );

  const downloadQRCode = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    // Extract QR code as image data from the canvas
    const image = canvas.toDataURL("image/png");

    // Initialize jsPDF
    const pdf = new jsPDF();

    // Add title and center the QR code
    const pageWidth = pdf.internal.pageSize.getWidth();
    const qrCodeSize = 50; // Size of QR code in PDF
    const xPos = (pageWidth - qrCodeSize) / 2; // Center horizontally
    const yPos = 40; // Vertical position

    pdf.setFontSize(16);
    pdf.text("Your QR Code", pageWidth / 2, 20, { align: "center" });
    pdf.addImage(image, "PNG", xPos, yPos, qrCodeSize, qrCodeSize);

    // Save the PDF
    pdf.save("QRCode.pdf");
  };

  return (
    <Flex direction="column" align="center" justify="center" gap="md">
      <RefetchButton refetch={refetch} isLoading={isLoading} />
      <div className={styles.QRContainer}>
        {!isLoading && chatLink ? (
          <QRCodeCanvas
            ref={qrRef}
            value={chatLink}
            title={chatLink}
            size={128}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            imageSettings={{
              src: "/public/aria-logo.jpeg",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              opacity: 1,
              excavate: true,
            }}
          />
        ) : (
          <Loader />
        )}
      </div>
      <Flex w="100%" justify="space-between" align="center" gap="lg">
        <CopyButton value={chatLink} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied" : "Copy"}
              withArrow
              position="right"
            >
              <Flex
                align="center"
                gap="sm"
                justify="center"
                className={styles.bottomButtons}
                onClick={copy} // Trigger copy on Flex click
                style={{ cursor: "pointer" }} // Indicate it's clickable
              >
                <Text c="gray">Assistant URL</Text>
                <ActionIcon color={copied ? "teal" : "gray"} variant="subtle">
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Flex>
            </Tooltip>
          )}
        </CopyButton>
        <Flex
          align="center"
          gap="sm"
          justify="center"
          className={styles.bottomButtons}
          onClick={downloadQRCode}
        >
          <Text c="gray">Download QR Code</Text>
          <ActionIcon variant="subtle">
            <FaDownload color="gray" />
          </ActionIcon>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default QRCode;
