import React from "react";
import styles from "./BusinessDetailsModal.module.scss";

interface Timing {
  day: string;
  start_time: string;
  end_time: string;
}

interface Branch {
  branch_name: string;
  address: string;
  timings: Timing[];
}

interface BusinessDetailsModalProps {
  businessType: string;
  businessName: string;
  branches: Branch[];
}

/*************  ✨ Codeium Command ⭐  *************/

const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  businessType,
  businessName,
  branches,
}) => {
  return (
    <div className={styles.container}>
      <p>
        <strong>Business Type:</strong> {businessType || "N/A"}
      </p>
      <p>
        <strong>Business Name:</strong> {businessName || "N/A"}
      </p>
      <div>
        <strong>Branches:</strong>
        {branches.length > 0 ? (
          branches.map((branch) => (
            <div key={branch.branch_name || branch.address} className={styles.branch}>
              <p><strong>Branch:</strong> {branch.branch_name || "Unnamed Branch"}</p>
              <p><strong>Address:</strong> {branch.address || "Address Not Available"}</p>
              <div>
                <strong>Timings:</strong>
                {branch.timings.length > 0 ? (
                  branch.timings.map((timing) => (
                    <p key={timing.day}>
                      {timing.day}: {timing.start_time || "N/A"} - {timing.end_time || "N/A"}
                    </p>
                  ))
                ) : (
                  <p>No timings available.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No branches available.</p>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsModal;
