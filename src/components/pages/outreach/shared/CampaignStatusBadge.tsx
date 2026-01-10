import React from "react";
import { Badge } from "@mantine/core";
import { CampaignStatus } from "../../../../api/requests_responses/outreach/email";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({
  status,
}) => {
  const getColor = () => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return "gray";
      case CampaignStatus.SCHEDULED:
        return "blue";
      case CampaignStatus.RUNNING:
        return "green";
      case CampaignStatus.PAUSED:
        return "yellow";
      case CampaignStatus.COMPLETED:
        return "teal";
      case CampaignStatus.FAILED:
        return "red";
      default:
        return "gray";
    }
  };

  const getLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return <Badge color={getColor()}>{getLabel()}</Badge>;
};

export default CampaignStatusBadge;
