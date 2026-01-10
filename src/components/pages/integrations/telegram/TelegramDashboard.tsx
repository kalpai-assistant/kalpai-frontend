import React, { useRef } from "react";
import {
  Grid,
  Text,
  Button,
  Flex,
  Badge,
  ActionIcon,
  CopyButton,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconDownload,
} from "@tabler/icons-react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { Tile } from "../../../utilComponents/Tile";
import TelegramOverviewStats from "./TelegramOverviewStats";
import { TelegramBotConfig } from "../../../../api/requests_responses/telegram";
import { getUserBusiness } from "../../../../api/business";
import { UserBusinessResponse } from "../../../../api/requests_responses/business";

interface TelegramDashboardProps {
  botConfig?: TelegramBotConfig;
  onReregister: () => void;
}

const TelegramDashboard: React.FC<TelegramDashboardProps> = ({
  botConfig,
  onReregister,
}) => {
  const telegramUrl = botConfig ? `https://t.me/${botConfig.bot_username}` : "";
  const qrRef = useRef<HTMLCanvasElement>(null);

  const downloadTelegramQRCode = async () => {
    const canvas = qrRef.current;
    if (!canvas || !botConfig) return;

    console.log("Starting PDF generation...");

    try {
      // Get business details first
      console.log("Fetching business data...");
      const businessResponse = await getUserBusiness();
      const businessData: UserBusinessResponse = businessResponse.data;
      console.log("Business data received:", businessData);

      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Background gradient effect (simulate with rectangles)
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Header section with Telegram branding
      pdf.setFillColor(0, 136, 204); // Telegram blue
      pdf.rect(0, 0, pageWidth, 60, "F");

      // Business chat head name or fallback to Telegram Bot
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      const headerTitle = businessData.chat_head_name || "📱 Telegram Bot";
      pdf.text(headerTitle, pageWidth / 2, 25, { align: "center" });

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text("Connect with us instantly", pageWidth / 2, 40, {
        align: "center",
      });

      // Function to load business logo
      const loadBusinessLogo = async () => {
        if (!businessData.chat_head_url) {
          console.log("No business logo URL provided");
          return;
        }

        console.log("Loading business logo from:", businessData.chat_head_url);

        try {
          const logoSize = 20;
          const logoX = pageWidth / 2 - 60;
          const logoY = 15;

          console.log(
            "Adding business logo directly from URL (no canvas needed)",
          );

          // Since it's a public S3 bucket, we can directly add the image URL to PDF
          // jsPDF can handle cross-origin images without canvas operations
          try {
            pdf.addImage(
              businessData.chat_head_url,
              "JPEG",
              logoX,
              logoY,
              logoSize,
              logoSize,
            );
            console.log("Business logo added to PDF directly from URL");
          } catch (directError) {
            console.warn(
              "Direct URL method failed, trying with image loading:",
              directError,
            );

            // Fallback: Load image first, then add to PDF
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous"; // This might help with some CORS configurations

            await new Promise<boolean>((resolve) => {
              logoImg.onload = () => {
                try {
                  // Try adding the loaded image directly to PDF (some versions of jsPDF support this)
                  pdf.addImage(
                    logoImg,
                    "JPEG",
                    logoX,
                    logoY,
                    logoSize,
                    logoSize,
                  );
                  console.log("Business logo added to PDF after loading");
                  resolve(true);
                } catch (pdfError) {
                  console.warn(
                    "PDF addImage with loaded image failed:",
                    pdfError,
                  );
                  resolve(false);
                }
              };
              logoImg.onerror = () => {
                console.warn("Image loading failed");
                resolve(false);
              };
            });

            logoImg.src = businessData.chat_head_url;
          }
        } catch (error) {
          console.warn("Could not load business logo:", error);
        }
      };

      // Load business logo first
      await loadBusinessLogo();

      // Main content area
      pdf.setTextColor(51, 51, 51); // Dark gray
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(`@${botConfig.bot_username}`, pageWidth / 2, 80, {
        align: "center",
      });

      // QR Code
      const qrImage = canvas.toDataURL("image/png");
      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = 95;

      // QR Code background
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 8, 8, "F");

      // Add shadow effect
      pdf.setFillColor(0, 0, 0, 0.1);
      pdf.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8, 8, "F");

      // QR Code
      pdf.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);

      // Instructions section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(51, 51, 51);
      pdf.text("How to Connect:", pageWidth / 2, 200, { align: "center" });

      // Steps
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(102, 102, 102);

      const steps = [
        "1. Open Telegram on your phone",
        "2. Scan this QR code with your camera",
        "3. Start chatting with our assistant instantly!",
      ];

      steps.forEach((step, index) => {
        pdf.text(step, pageWidth / 2, 220 + index * 15, { align: "center" });
      });

      // Decorative elements
      pdf.setDrawColor(0, 136, 204);
      pdf.setLineWidth(2);
      pdf.line(50, 185, pageWidth - 50, 185);

      // Footer
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, pageHeight - 50, pageWidth, 50, "F");

      pdf.setFontSize(10);
      pdf.setTextColor(153, 153, 153);
      pdf.text(telegramUrl, pageWidth / 2, pageHeight - 35, {
        align: "center",
      });

      // Contact email
      pdf.setFontSize(9);
      pdf.text(
        `Mail us at ${businessData.email}`,
        pageWidth / 2,
        pageHeight - 25,
        { align: "center" },
      );

      // Add AriaBot logo section
      const logoSize = 3; // Match text size (8pt font ≈ 6pt logo)
      const textY = pageHeight - 15;
      const logoY = textY - 3; // Align logo with text baseline

      // Calculate positions for "Powered by [logo] Kalp AI"
      const poweredByText = "Powered by   ";
      const ariaiText = " Kalp AI";

      pdf.setFontSize(8);
      const poweredByWidth = pdf.getTextWidth(poweredByText);
      const ariaiWidth = pdf.getTextWidth(ariaiText);
      const totalWidth = poweredByWidth + logoSize + ariaiWidth;
      const startX = (pageWidth - totalWidth) / 2;

      try {
        console.log("Loading AriaBot logo...");

        // Add "Powered by" text first
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(poweredByText, startX, textY);

        // For local AriaBot logo, try direct URL method first
        const logoX = startX + poweredByWidth;
        try {
          pdf.addImage(
            "/aria-logo.jpeg",
            "JPEG",
            logoX,
            logoY,
            logoSize,
            logoSize,
          );
          console.log("AriaBot logo added to PDF directly from URL");
        } catch (directError) {
          console.warn(
            "Direct AriaBot logo failed, trying with canvas:",
            directError,
          );

          // Fallback: Load image and use canvas (should work for same-origin)
          const ariaBotImg = new Image();
          await new Promise<boolean>((resolve) => {
            ariaBotImg.onload = () => {
              try {
                console.log("AriaBot logo loaded, adding to PDF");
                const logoCanvas = document.createElement("canvas");
                const ctx = logoCanvas.getContext("2d");
                logoCanvas.width = logoSize;
                logoCanvas.height = logoSize;

                if (ctx) {
                  ctx.drawImage(ariaBotImg, 0, 0, logoSize, logoSize);
                  const logoDataUrl = logoCanvas.toDataURL("image/jpeg");
                  pdf.addImage(
                    logoDataUrl,
                    "JPEG",
                    logoX,
                    logoY,
                    logoSize,
                    logoSize,
                  );
                  console.log("AriaBot logo added to PDF via canvas");
                }
                resolve(true);
              } catch (err) {
                console.warn("Error processing AriaBot logo:", err);
                resolve(false);
              }
            };
            ariaBotImg.onerror = () => {
              console.warn("Could not load AriaBot logo, using text only");
              resolve(false);
            };
          });

          ariaBotImg.src = "/aria-logo.jpeg";
        }

        // Add "Kalp AI" text after logo
        const ariaiX = logoX + logoSize;
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(ariaiText, ariaiX, textY);
      } catch (error) {
        console.warn("AriaBot logo loading failed:", error);
        // Fallback to text only (centered)
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("Powered by Kalp AI", pageWidth / 2, textY, {
          align: "center",
        });
      }

      console.log("Saving PDF...");
      // Save the PDF
      pdf.save(`telegram-bot-${botConfig.bot_username}.pdf`);
      console.log("PDF saved successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback: create PDF without business data
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFontSize(16);
      pdf.text("Telegram QR Code", pageWidth / 2, 30, { align: "center" });

      const qrImage = canvas.toDataURL("image/png");
      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      pdf.addImage(qrImage, "PNG", qrX, 50, qrSize, qrSize);

      pdf.save(`telegram-bot-${botConfig.bot_username}.pdf`);
    }
  };

  return (
    <Grid gutter="md">
      {/* Left Column */}
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Tile title="Telegram Stats">
          <TelegramOverviewStats />
        </Tile>

        <Tile title="Bot Information">
          <Flex direction="column" gap="md">
            <Flex justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Status:
              </Text>
              <Badge
                color={botConfig?.is_active ? "green" : "red"}
                variant="filled"
              >
                {botConfig?.is_active ? "Active" : "Inactive"}
              </Badge>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Bot Username:
              </Text>
              <Text size="sm" fw={500}>
                @{botConfig?.bot_username}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Created:
              </Text>
              <Text size="sm">
                {botConfig?.created_time
                  ? new Date(botConfig.created_time).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Flex>

            <Flex justify="space-between">
              <Text size="sm" c="dimmed">
                Last Updated:
              </Text>
              <Text size="sm">
                {botConfig?.updated_time
                  ? new Date(botConfig.updated_time).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Flex>

            <Button
              variant="outline"
              color="blue"
              onClick={onReregister}
              fullWidth
              mt="md"
            >
              Re-register Bot
            </Button>
          </Flex>
        </Tile>
      </Grid.Col>

      {/* Right Column */}
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Tile title="Telegram Bot QR Code">
          <Flex direction="column" align="center" gap="md">
            {telegramUrl ? (
              <>
                <QRCodeCanvas
                  ref={qrRef}
                  value={telegramUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />

                <Flex align="center" gap="sm" w="100%" justify="space-between">
                  <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                    {telegramUrl}
                  </Text>

                  <CopyButton value={telegramUrl} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied" : "Copy URL"}>
                        <ActionIcon
                          color={copied ? "teal" : "gray"}
                          variant="subtle"
                          onClick={copy}
                        >
                          {copied ? (
                            <IconCheck size="1rem" />
                          ) : (
                            <IconCopy size="1rem" />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>

                  <Tooltip label="Open in Telegram">
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={() => window.open(telegramUrl, "_blank")}
                    >
                      <IconExternalLink size="1rem" />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Download QR Code">
                    <ActionIcon
                      color="green"
                      variant="subtle"
                      onClick={downloadTelegramQRCode}
                    >
                      <IconDownload size="1rem" />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
              </>
            ) : (
              <Text c="dimmed">No bot configured</Text>
            )}
          </Flex>
        </Tile>
      </Grid.Col>
    </Grid>
  );
};

export default TelegramDashboard;
